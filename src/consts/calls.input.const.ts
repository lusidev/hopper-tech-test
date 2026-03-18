import type { CallRecordField } from '../types/calls.input.types';

export const REQUIRED_CALL_RECORD_FIELDS: CallRecordField[] = [
  'id',
  'callStartTime',
  'callEndTime',
  'fromNumber',
  'toNumber',
  'region'
];

export const CSV_HEADER_LINE_NUMBER = 1;
export const CSV_HEADER_ROW_OFFSET = 2;
export const CSV_DATA_ROW_OFFSET = 1;

export const CALL_INPUT_MESSAGES = {
  emptyPayload: 'Payload is empty.',
  emptyRows: 'Payload does not contain any CSV rows.',
  emptyRecords: 'CSV payload does not contain any call records.',
  invalidCallType: 'callType must be either voice or video.',
  invalidStartTimestamp: 'callStartTime must be a valid ISO 8601 timestamp.',
  invalidEndTimestamp: 'callEndTime must be a valid ISO 8601 timestamp.',
  invalidCallOrder: 'callEndTime must be greater than or equal to callStartTime.',
  invalidFromNumber: 'fromNumber must be in E.164 format.',
  invalidToNumber: 'toNumber must be in E.164 format.',
  requiredField: (field: string): string => `${field} is required.`,
  invalidHeader: (expectedHeader: readonly string[]): string => `CSV header is invalid. Expected: ${expectedHeader.join(', ')}`,
  unexpectedColumnCount: (expectedColumns: number, receivedColumns: number): string => (
    `Expected ${expectedColumns} columns but received ${receivedColumns}.`
  )
} as const;
