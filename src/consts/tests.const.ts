import type { CallRecord } from '../types/calls.types';
import type { OperatorInfo } from '../types/operator-lookup.types';

export const TEST_LOOKUP_PHONE_NUMBER = '+14155551234';
export const TEST_LOOKUP_TARGET_NUMBER = '+442071838750';
export const TEST_LOOKUP_DATE = '26-03-17';
export const TEST_REGION = 'emea';
export const TEST_VOICE_CALL_ID = 'call-1';
export const TEST_SHORT_VOICE_CALL_ID = 'call-2';
export const TEST_LOOKUP_DATE_CALL_ID = 'call-lookup-date';

export const TEST_VOICE_CALL_RECORD: CallRecord = {
  id: TEST_VOICE_CALL_ID,
  callStartTime: '2026-03-17T10:00:00.000Z',
  callEndTime: '2026-03-17T10:02:30.000Z',
  fromNumber: TEST_LOOKUP_PHONE_NUMBER,
  toNumber: TEST_LOOKUP_TARGET_NUMBER,
  callType: 'voice',
  region: TEST_REGION
};

export const TEST_SHORT_VOICE_CALL_RECORD: CallRecord = {
  id: TEST_SHORT_VOICE_CALL_ID,
  callStartTime: '2026-03-17T10:00:00.000Z',
  callEndTime: '2026-03-17T10:01:00.000Z',
  fromNumber: TEST_LOOKUP_PHONE_NUMBER,
  toNumber: TEST_LOOKUP_TARGET_NUMBER,
  callType: 'voice',
  region: TEST_REGION
};

export const TEST_LOOKUP_DATE_CALL_RECORD: CallRecord = {
  id: TEST_LOOKUP_DATE_CALL_ID,
  callStartTime: '2026-03-17T10:00:00.000Z',
  callEndTime: '2026-03-17T10:02:30.000Z',
  fromNumber: TEST_LOOKUP_PHONE_NUMBER,
  toNumber: TEST_LOOKUP_TARGET_NUMBER,
  callType: 'voice',
  region: TEST_REGION
};

export const TEST_AT_T_OPERATOR_INFO: OperatorInfo = {
  operator: 'AT&T',
  country: 'United States',
  estimatedCostPerMinute: 0.02
};

export const TEST_VODAFONE_OPERATOR_INFO: OperatorInfo = {
  operator: 'Vodafone',
  country: 'United Kingdom',
  estimatedCostPerMinute: 0.05
};

export const TEST_VALID_CSV_HEADER = 'id,callStartTime,callEndTime,fromNumber,toNumber,callType,region';
export const TEST_VALID_CSV_ROW = 'call-1,2026-03-17T10:00:00.000Z,2026-03-17T10:02:30.000Z,+14155551234,+442071838750,voice,emea';
export const TEST_VALID_CSV_PAYLOAD = [TEST_VALID_CSV_HEADER, TEST_VALID_CSV_ROW].join('\n');
export const TEST_INVALID_HEADER_CSV_PAYLOAD = [
  'id,callStartTime,callEndTime,fromNumber,toNumber,wrongColumn,region',
  TEST_VALID_CSV_ROW
].join('\n');
export const TEST_MALFORMED_RECORD_CSV_PAYLOAD = [
  TEST_VALID_CSV_HEADER,
  ',invalid-date,2026-03-17T09:59:00.000Z,14155551234,+1,audio,'
].join('\n');
export const TEST_HANDLER_INVALID_CSV_PAYLOAD = [
  TEST_VALID_CSV_HEADER,
  'call-1,invalid,+not-a-date,14155551234,+442071838750,voice,emea'
].join('\n');
export const TEST_NON_ISO_CSV_PAYLOAD = [
  TEST_VALID_CSV_HEADER,
  'call-1,2026-03-17 10:00:00,2026-02-30T10:00:00.000Z,+14155551234,+442071838750,voice,emea'
].join('\n');
export const TEST_OFFSET_ISO_CSV_PAYLOAD = [
  TEST_VALID_CSV_HEADER,
  'call-1,2026-03-17T10:00:00+01:00,2026-03-17T10:02:30+01:00,+14155551234,+442071838750,voice,emea'
].join('\n');
export const TEST_HEADERLESS_CSV_PAYLOAD = TEST_VALID_CSV_ROW;
export const TEST_EMPTY_CSV_PAYLOAD = '   \n  ';