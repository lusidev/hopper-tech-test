import test from 'node:test';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  TEST_EMPTY_CSV_PAYLOAD,
  TEST_HEADERLESS_CSV_PAYLOAD,
  TEST_INVALID_HEADER_CSV_PAYLOAD,
  TEST_MALFORMED_RECORD_CSV_PAYLOAD,
  TEST_NON_ISO_CSV_PAYLOAD,
  TEST_OFFSET_ISO_CSV_PAYLOAD,
  TEST_VOICE_CALL_ID
} from '../../../consts';
import type { ValidationIssue } from '../../../types';
import { createBatchInput } from './calls.input';
import assert from 'node:assert/strict';

test('`BatchInput` parses and validates the provided sample CSV batch', async () => {
  const input = createBatchInput();
  const payload = await readFile(resolve(__dirname, '../../mocks/call-batch.mock.csv'), 'utf8');

  const result = input.parseAndValidate(payload);

  assert.equal(result.success, true);
  assert.equal(result.value?.length, 3);
  assert.equal(result.value?.[0]?.id, 'cdr_001');
  assert.equal(result.value?.[1]?.id, 'cdr_002');
  assert.equal(result.value?.[2]?.callType, 'video');
});

test('`BatchInput` rejects an invalid CSV header', () => {
  const input = createBatchInput();

  const result = input.parseAndValidate(TEST_INVALID_HEADER_CSV_PAYLOAD);

  assert.equal(result.success, false);
  assert.match(result.issues[0]?.message ?? '', /CSV header is invalid/);
});

test('`BatchInput` reports validation issues for malformed records', () => {
  const input = createBatchInput();

  const result = input.parseAndValidate(TEST_MALFORMED_RECORD_CSV_PAYLOAD);

  assert.equal(result.success, false);
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'id'));
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'callStartTime'));
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'callType'));
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'fromNumber'));
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'toNumber'));
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'region'));
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.line === 2));
});

test('`BatchInput` rejects parseable but non-ISO timestamps and impossible calendar dates', () => {
  const input = createBatchInput();

  const result = input.parseAndValidate(TEST_NON_ISO_CSV_PAYLOAD);

  assert.equal(result.success, false);
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'callStartTime'));
  assert.ok(result.issues.some((issue: ValidationIssue) => issue.field === 'callEndTime'));
});

test('`BatchInput` accepts ISO 8601 timestamps with timezone offsets', () => {
  const input = createBatchInput();

  const result = input.parseAndValidate(TEST_OFFSET_ISO_CSV_PAYLOAD);

  assert.equal(result.success, true);
  assert.equal(result.value?.[0]?.callStartTime, '2026-03-17T10:00:00+01:00');
  assert.equal(result.value?.[0]?.callEndTime, '2026-03-17T10:02:30+01:00');
});

test('`BatchInput` supports headerless CSV input and rejects an empty payload', () => {
  const input = createBatchInput();

  const validResult = input.parseAndValidate(TEST_HEADERLESS_CSV_PAYLOAD);
  const emptyResult = input.parseAndValidate(TEST_EMPTY_CSV_PAYLOAD);

  assert.equal(validResult.success, true);
  assert.equal(validResult.value?.length, 1);
  assert.equal(validResult.value?.[0]?.id, TEST_VOICE_CALL_ID);
  assert.equal(emptyResult.success, false);
  assert.equal(emptyResult.issues[0]?.message, 'Payload is empty.');
});