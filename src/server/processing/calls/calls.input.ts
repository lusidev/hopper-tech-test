import {
  createCsvRowParser,
  failureResult,
  successResult
} from '../../utils';
import type { BatchInput, CallRecord, CsvRowParser } from '../../../types';
import {
  assessBatchInputIssues,
  assessHeader,
  parseCallRecordRow,
  resolveDataRowLine,
  validateRecord
} from '../../utils/calls.input.utils';

export const createBatchInput = (
  csvRowParser: CsvRowParser = createCsvRowParser()
): BatchInput => ({
  parseAndValidate: (payload: string) => {
    const rows = csvRowParser
      .parse(payload)
      .filter((row) => row.some((cell) => cell.trim().length > 0));
    const headerAssessment = assessHeader(rows[0] ?? []);
    const dataRows = rows.slice(headerAssessment.hasHeader ? 1 : 0);
    const batchIssues = assessBatchInputIssues(payload, rows, headerAssessment, dataRows);
    const parsedRows = dataRows.map((row: string[], index: number) => parseCallRecordRow(
      row,
      resolveDataRowLine(index, headerAssessment.hasHeader)
    ));
    const rowIssues = parsedRows.flatMap(({ issues }) => issues);
    const records = parsedRows.flatMap(({ record }) => (record ? [record] : []));
    const validationIssues = records.flatMap((record: CallRecord, index: number) => validateRecord(
      record,
      resolveDataRowLine(index, headerAssessment.hasHeader)
    ));
    const issues = batchIssues.length > 0 ? batchIssues : rowIssues.length > 0 ? rowIssues : validationIssues;

    return issues.length > 0 ? failureResult(issues) : successResult(records);
  }
});