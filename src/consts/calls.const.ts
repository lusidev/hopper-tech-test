export const EXPECTED_CALL_HEADERS = [
  'id',
  'callStartTime',
  'callEndTime',
  'fromNumber',
  'toNumber',
  'callType',
  'region'
] as const;

export const ALLOWED_CALL_TYPES = ['voice', 'video'] as const;
export const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;