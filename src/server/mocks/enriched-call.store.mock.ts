import type { EnrichedCallRecord, EnrichedStore } from '../../types';

/**
 * In-memory mock for a transactional OLTP store, e.g. PostgreSQL.
 */
export const createInMemoryEnrichedStore = (): EnrichedStore => {
  const records: EnrichedCallRecord[] = [];

  return {
    saveMany: async (inputRecords: EnrichedCallRecord[]): Promise<void> => {
      records.push(...inputRecords.map((record) => ({ ...record })));
    },
    getAll: (): EnrichedCallRecord[] => [...records]
  };
};
