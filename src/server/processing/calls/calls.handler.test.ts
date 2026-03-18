import test from 'node:test';
import { performance } from 'node:perf_hooks';
import {
  TEST_HANDLER_INVALID_CSV_PAYLOAD,
  TEST_VALID_CSV_PAYLOAD,
  TEST_VOICE_CALL_RECORD
} from '../../../consts';
import type { BatchLogger, BatchService, CallRecord } from '../../../types';
import { createBatchHandler } from './calls.handler';
import assert from 'node:assert/strict';

test('`BatchHandler` acknowledges a valid batch and dispatches records to the service', async () => {
  let receivedRecords: CallRecord[] | undefined;
  const service: BatchService = {
    process: async (records: CallRecord[]): Promise<[]> => {
      receivedRecords = records;
      return [];
    }
  };
  const handler = createBatchHandler({ service });

  const response = await handler.handleBatch(TEST_VALID_CSV_PAYLOAD);

  assert.deepEqual(response, { ok: true });
  assert.deepEqual(receivedRecords, [TEST_VOICE_CALL_RECORD]);
});

test('`BatchHandler` returns a validation error for an invalid batch', async () => {
  const handler = createBatchHandler();

  const response = await handler.handleBatch(TEST_HANDLER_INVALID_CSV_PAYLOAD);

  assert.equal(response.ok, false);
  assert.match(response.error ?? '', /callStartTime|callEndTime|fromNumber/);
});

test('`BatchHandler` still acknowledges a valid batch when background processing fails', async () => {
  const loggedErrors: string[] = [];
  const logger: BatchLogger = {
    error: (message: string): void => {
      loggedErrors.push(message);
    }
  };
  const service: BatchService = {
    process: async (): Promise<[]> => {
      throw new Error('Background failure');
    }
  };
  const handler = createBatchHandler({ service, logger });

  const response = await handler.handleBatch(TEST_VALID_CSV_PAYLOAD);
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(response, { ok: true });
  assert.ok(loggedErrors.some((message) => message.includes('Background call batch processing failed.')));
});

test('`BatchHandler` acknowledges valid batches within the 500ms SLA', async () => {
  const service: BatchService = {
    process: async (): Promise<[]> => {
      return new Promise<[]>((resolve) => {
        const timer = setTimeout(() => resolve([]), 650);
        timer.unref();
      });
    }
  };
  const handler = createBatchHandler({ service });

  const startedAt = performance.now();
  const response = await handler.handleBatch(TEST_VALID_CSV_PAYLOAD);
  const elapsedMs = performance.now() - startedAt;

  console.info(`BatchHandler acknowledgment time: ${elapsedMs.toFixed(2)}ms (<500ms required)`);

  assert.deepEqual(response, { ok: true });
  assert.ok(elapsedMs < 500, `Expected acknowledgment below 500ms, received ${elapsedMs.toFixed(2)}ms.`);
});