import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEST_LOOKUP_DATE,
  TEST_LOOKUP_PHONE_NUMBER
} from '../../consts';
import { lookupOperator } from './operator-lookup.mock';

test('`lookupOperator` rejects phone numbers outside E.164 format', async () => {
  await assert.rejects(
    lookupOperator('14155551234', TEST_LOOKUP_DATE),
    /E\.164/
  );
});

test('`lookupOperator` rejects call dates outside yy-MM-dd format', async () => {
  await assert.rejects(
    lookupOperator(TEST_LOOKUP_PHONE_NUMBER, '2026-03-17'),
    /yy-MM-dd/
  );
});