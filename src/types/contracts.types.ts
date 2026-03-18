import type { CallRecord, EnrichedCallRecord } from './calls.types';
import type { ValidationResult } from './validation.types';
import type { OperatorInfo } from './operator-lookup.types';

export type Response = {
  ok: boolean;
  error?: string;
};

export interface BatchInput {
  parseAndValidate: (payload: string) => ValidationResult<CallRecord[]>;
}

export interface BatchService {
  process: (records: CallRecord[]) => Promise<EnrichedCallRecord[]>;
}

export interface EnrichedStore {
  saveMany: (records: EnrichedCallRecord[]) => Promise<void>;
  getAll: () => EnrichedCallRecord[];
}

export interface EnrichedIndex {
  indexMany: (records: EnrichedCallRecord[]) => Promise<void>;
  getAll: () => EnrichedCallRecord[];
}

export interface LookupGateway {
  lookup: (phoneNumber: string, callDate: string) => Promise<OperatorInfo>;
}

export interface BatchLogger {
  error: (message: string, error?: Error) => void;
}

export interface BatchHandlerDependencies {
  input?: BatchInput;
  service?: BatchService;
  logger?: BatchLogger;
}

export interface BatchHandler {
  handleBatch: (payload: string) => Promise<Response>;
}