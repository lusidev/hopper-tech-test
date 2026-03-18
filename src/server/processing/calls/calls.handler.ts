import { formatValidationIssues } from '../../utils';
import type {
  BatchHandler,
  BatchHandlerDependencies,
  BatchLogger,
  BatchService,
  CallRecord,
  Response,
  ValidationResult
} from '../../../types';
import { createBatchInput } from './calls.input';
import { createBatchService } from './calls.service';

type ParsedBatchResult = ValidationResult<CallRecord[]>;

const defaultLogger: BatchLogger = {
  error: (message: string, error?: Error): void => {
    console.error(message, error);
  }
};

const createValidationErrorResponse = (parsedRecords: ParsedBatchResult): Response | undefined => (
  parsedRecords.success && parsedRecords.value
    ? undefined
    : {
      ok: false,
      error: formatValidationIssues(parsedRecords.issues)
    }
);

const processInBackground = (
  records: CallRecord[],
  service: BatchService,
  logger: BatchLogger
): void => {
  void service.process(records).catch((error: Error) => {
    logger.error('Background call batch processing failed.', error);
  });
};

export const createBatchHandler = (
  dependencies: BatchHandlerDependencies = {}
): BatchHandler => {
  const input = dependencies.input ?? createBatchInput();
  const service = dependencies.service ?? createBatchService();
  const logger = dependencies.logger ?? defaultLogger;

  return {
    handleBatch: async (payload: string): Promise<Response> => {
      const parsedRecords = input.parseAndValidate(payload);
      const errorResponse = createValidationErrorResponse(parsedRecords);
      const validRecords = parsedRecords.success && parsedRecords.value ? parsedRecords.value : [];

      return errorResponse ?? (
        processInBackground(validRecords, service, logger),
        { ok: true }
      );
    }
  };
};