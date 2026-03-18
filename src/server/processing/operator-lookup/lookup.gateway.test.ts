import test from 'node:test';
import {
  TEST_AT_T_OPERATOR_INFO,
  TEST_LOOKUP_DATE,
  TEST_LOOKUP_PHONE_NUMBER
} from '../../../consts';
import type { OperatorInfo } from '../../../types';
import { createLookupGateway } from './lookup.gateway';
import assert from 'node:assert/strict';

test('`createLookupGateway` delegates lookup calls to the provided operator lookup function', async () => {
  const calls: Array<{ phoneNumber: string; callDate: string }> = [];
  const expectedResponse: OperatorInfo = TEST_AT_T_OPERATOR_INFO;

  const gateway = createLookupGateway(async (phoneNumber: string, callDate: string): Promise<OperatorInfo> => {
    calls.push({ phoneNumber, callDate });
    return expectedResponse;
  });

  const result = await gateway.lookup(TEST_LOOKUP_PHONE_NUMBER, TEST_LOOKUP_DATE);

  assert.deepEqual(calls, [{ phoneNumber: TEST_LOOKUP_PHONE_NUMBER, callDate: TEST_LOOKUP_DATE }]);
  assert.deepEqual(result, expectedResponse);
});