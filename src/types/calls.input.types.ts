import type { CallRecord } from './calls.types';
import type { ValidationIssue } from './validation.types';

export type CallRecordField = keyof CallRecord;

export type FieldValidator = (record: CallRecord, line: number) => ValidationIssue | undefined;

export type HeaderAssessment = {
  hasHeader: boolean;
  isValid: boolean;
  issues: ValidationIssue[];
};

export type ParsedCallRecordRow = {
  record?: CallRecord;
  issues: ValidationIssue[];
};
