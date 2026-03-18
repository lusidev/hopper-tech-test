import test from 'node:test';
import {
  TEST_AT_T_OPERATOR_INFO,
  TEST_LOOKUP_DATE,
  TEST_LOOKUP_DATE_CALL_RECORD,
  TEST_LOOKUP_PHONE_NUMBER,
  TEST_SHORT_VOICE_CALL_RECORD,
  TEST_VODAFONE_OPERATOR_INFO,
  TEST_VOICE_CALL_RECORD
} from '../../../consts';
import type { EnrichedCallRecord, LookupGateway, OperatorInfo } from '../../../types';
import { createBatchService } from './calls.service';
import assert from 'node:assert/strict';

const raise = (error: Error): never => {
  throw error;
};

const createLookupGatewayFromDictionary = (
  dictionary: Record<string, OperatorInfo | Error>,
  fallback: OperatorInfo
): LookupGateway => ({
  lookup: async (phoneNumber: string): Promise<OperatorInfo> => {
    const resolvedValue = dictionary[phoneNumber] ?? fallback;

    return resolvedValue instanceof Error ? raise(resolvedValue) : resolvedValue;
  }
});

const createDeterministicLookupGateway = (): LookupGateway => createLookupGatewayFromDictionary(
  {
    [TEST_LOOKUP_PHONE_NUMBER]: TEST_AT_T_OPERATOR_INFO
  },
  TEST_VODAFONE_OPERATOR_INFO
);

const createPartiallyFailingLookupGateway = (): LookupGateway => createLookupGatewayFromDictionary(
  {
    [TEST_LOOKUP_PHONE_NUMBER]: new Error('Temporary failure')
  },
  TEST_VODAFONE_OPERATOR_INFO
);

test('`BatchService` enriches records, calculates values, and dispatches them to store and index', async () => {
  let storedRecords: unknown[] = [];
  let indexedRecords: unknown[] = [];

  const service = createBatchService(
    createDeterministicLookupGateway(),
    {
      saveMany: async (records: EnrichedCallRecord[]) => {
        storedRecords = records;
      },
      getAll: () => storedRecords as any
    },
    {
      indexMany: async (records: EnrichedCallRecord[]) => {
        indexedRecords = records;
      },
      getAll: () => indexedRecords as any
    }
  );

  const [enrichedRecord] = await service.process([TEST_VOICE_CALL_RECORD]);

  assert.equal(enrichedRecord.duration, 150);
  assert.equal(enrichedRecord.fromOperator, 'AT&T');
  assert.equal(enrichedRecord.toOperator, 'Vodafone');
  assert.equal(enrichedRecord.fromCountry, 'United States');
  assert.equal(enrichedRecord.toCountry, 'United Kingdom');
  assert.equal(enrichedRecord.estimatedCost, 0.0875);
  assert.deepEqual(storedRecords, [enrichedRecord]);
  assert.deepEqual(indexedRecords, [enrichedRecord]);
});

test('`BatchService` converts ISO 8601 timestamps to yy-MM-dd for operator lookups', async () => {
  const receivedCallDates: string[] = [];

  const gateway: LookupGateway = {
    lookup: async (_phoneNumber: string, callDate: string): Promise<OperatorInfo> => {
      receivedCallDates.push(callDate);

      return TEST_AT_T_OPERATOR_INFO;
    }
  };

  const service = createBatchService(gateway);

  await service.process([TEST_LOOKUP_DATE_CALL_RECORD]);

  assert.deepEqual(receivedCallDates, [TEST_LOOKUP_DATE, TEST_LOOKUP_DATE]);
});

test('`BatchService` tolerates lookup failures and still returns records', async () => {
  const service = createBatchService(createPartiallyFailingLookupGateway());

  const [enrichedRecord] = await service.process([TEST_SHORT_VOICE_CALL_RECORD]);

  assert.equal(enrichedRecord.duration, 60);
  assert.equal(enrichedRecord.fromOperator, undefined);
  assert.equal(enrichedRecord.toOperator, 'Vodafone');
  assert.equal(enrichedRecord.estimatedCost, 0.05);
});