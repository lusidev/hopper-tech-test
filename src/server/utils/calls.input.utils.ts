import { isIso8601Timestamp } from './time.utils';
import {
  ALLOWED_CALL_TYPES,
  E164_PHONE_REGEX,
  EXPECTED_CALL_HEADERS
} from '../../consts';
import type { CallRecord } from '../../types/calls.types';
import type { ValidationIssue } from '../../types/validation.types';
import type {
  CallRecordField,
  FieldValidator,
  HeaderAssessment,
  ParsedCallRecordRow
} from '../../types/calls.input.types';
import {
  CALL_INPUT_MESSAGES,
  CSV_DATA_ROW_OFFSET,
  CSV_HEADER_LINE_NUMBER,
  CSV_HEADER_ROW_OFFSET,
  REQUIRED_CALL_RECORD_FIELDS
} from '../../consts/calls.input.const';

const toIssueArray = (issue?: ValidationIssue): ValidationIssue[] => (issue ? [issue] : []);

const createIssue = (
  line: number,
  message: string,
  field?: ValidationIssue['field'],
  value?: string
): ValidationIssue => ({
  line,
  field,
  value,
  message
});

const createConditionalIssue = (condition: boolean, issue: ValidationIssue): ValidationIssue | undefined => (
  condition ? issue : undefined
);

const createFieldIssue = (
  field: CallRecordField,
  line: number,
  value: string,
  message: string
): ValidationIssue => createIssue(line, message, field, value);

const isCallChronologyValid = (record: CallRecord): boolean => {
  const timestamps = [record.callStartTime, record.callEndTime];
  const hasComparableTimestamps = timestamps.every(Boolean) && timestamps.every(isIso8601Timestamp);

  return !hasComparableTimestamps
    || new Date(record.callEndTime).getTime() >= new Date(record.callStartTime).getTime();
};

const FIELD_VALIDATORS: Partial<Record<CallRecordField, FieldValidator[]>> = {
  callType: [
    (record: CallRecord, line: number): ValidationIssue | undefined => createConditionalIssue(
      !ALLOWED_CALL_TYPES.includes(record.callType),
      createFieldIssue('callType', line, record.callType, CALL_INPUT_MESSAGES.invalidCallType)
    )
  ],
  callStartTime: [
    (record: CallRecord, line: number): ValidationIssue | undefined => createConditionalIssue(
      Boolean(record.callStartTime) && !isIso8601Timestamp(record.callStartTime),
      createFieldIssue('callStartTime', line, record.callStartTime, CALL_INPUT_MESSAGES.invalidStartTimestamp)
    )
  ],
  callEndTime: [
    (record: CallRecord, line: number): ValidationIssue | undefined => createConditionalIssue(
      Boolean(record.callEndTime) && !isIso8601Timestamp(record.callEndTime),
      createFieldIssue('callEndTime', line, record.callEndTime, CALL_INPUT_MESSAGES.invalidEndTimestamp)
    ),
    (record: CallRecord, line: number): ValidationIssue | undefined => createConditionalIssue(
      !isCallChronologyValid(record),
      createFieldIssue('callEndTime', line, record.callEndTime, CALL_INPUT_MESSAGES.invalidCallOrder)
    )
  ],
  fromNumber: [
    (record: CallRecord, line: number): ValidationIssue | undefined => createConditionalIssue(
      Boolean(record.fromNumber) && !E164_PHONE_REGEX.test(record.fromNumber),
      createFieldIssue('fromNumber', line, record.fromNumber, CALL_INPUT_MESSAGES.invalidFromNumber)
    )
  ],
  toNumber: [
    (record: CallRecord, line: number): ValidationIssue | undefined => createConditionalIssue(
      Boolean(record.toNumber) && !E164_PHONE_REGEX.test(record.toNumber),
      createFieldIssue('toNumber', line, record.toNumber, CALL_INPUT_MESSAGES.invalidToNumber)
    )
  ]
};

const buildHeaderAssessment = (
  hasHeader: boolean,
  isValid: boolean,
  issues: ValidationIssue[] = []
): HeaderAssessment => ({ hasHeader, isValid, issues });

const toCallRecord = (row: string[]): CallRecord => {
  const [id, callStartTime, callEndTime, fromNumber, toNumber, callType, region] = row.map(
    (value: string) => value.trim()
  );

  return {
    id,
    callStartTime,
    callEndTime,
    fromNumber,
    toNumber,
    callType: callType.toLowerCase() as CallRecord['callType'],
    region
  };
};

export const assessHeader = (firstRow: string[]): HeaderAssessment => {
  const lowerCaseRow = firstRow.map((value) => value.trim().toLowerCase());
  const matchingHeaders = EXPECTED_CALL_HEADERS.filter((header, index) => lowerCaseRow[index] === header.toLowerCase());
  const resemblesHeader = lowerCaseRow.some((value) => EXPECTED_CALL_HEADERS.includes(value as typeof EXPECTED_CALL_HEADERS[number]));

  return [
    buildHeaderAssessment(true, true),
    buildHeaderAssessment(
      true,
      false,
      [createIssue(CSV_HEADER_LINE_NUMBER, CALL_INPUT_MESSAGES.invalidHeader(EXPECTED_CALL_HEADERS))]
    ),
    buildHeaderAssessment(false, true)
  ][matchingHeaders.length === EXPECTED_CALL_HEADERS.length ? 0 : resemblesHeader ? 1 : 2];
};

export const resolveDataRowLine = (rowIndex: number, hasHeader: boolean): number => (
  rowIndex + (hasHeader ? CSV_HEADER_ROW_OFFSET : CSV_DATA_ROW_OFFSET)
);

export const assessBatchInputIssues = (
  payload: string,
  rows: string[][],
  headerAssessment: HeaderAssessment,
  dataRows: string[][]
): ValidationIssue[] => [
  {
    condition: payload.trim().length === 0,
    issues: [{ message: CALL_INPUT_MESSAGES.emptyPayload }]
  },
  {
    condition: rows.length === 0,
    issues: [{ message: CALL_INPUT_MESSAGES.emptyRows }]
  },
  {
    condition: !headerAssessment.isValid,
    issues: headerAssessment.issues
  },
  {
    condition: dataRows.length === 0,
    issues: [{ message: CALL_INPUT_MESSAGES.emptyRecords }]
  }
].find(({ condition }) => condition)?.issues ?? [];

export const parseCallRecordRow = (row: string[], line: number): ParsedCallRecordRow => (
  row.length === EXPECTED_CALL_HEADERS.length
    ? { record: toCallRecord(row), issues: [] }
    : {
      issues: [createIssue(
        line,
        CALL_INPUT_MESSAGES.unexpectedColumnCount(EXPECTED_CALL_HEADERS.length, row.length)
      )]
    }
);

export const validateRecord = (record: CallRecord, line: number): ValidationIssue[] => {
  const requiredFieldIssues = REQUIRED_CALL_RECORD_FIELDS.flatMap((field: CallRecordField) => toIssueArray(
    createConditionalIssue(
      record[field].trim().length === 0,
      createIssue(line, CALL_INPUT_MESSAGES.requiredField(field), field)
    )
  ));

  const fieldIssues = Object.values(FIELD_VALIDATORS)
    .flat()
    .flatMap((validator: FieldValidator | undefined) => toIssueArray(validator?.(record, line)));

  return [...requiredFieldIssues, ...fieldIssues];
};
