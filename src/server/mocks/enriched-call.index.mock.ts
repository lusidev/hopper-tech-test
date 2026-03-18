import type { EnrichedCallRecord, EnrichedIndex } from '../../types';

/**
 * In-memory mock for a search-optimized store, e.g. Elasticsearch/OpenSearch.
 */
export const createInMemoryEnrichedIndex = (): EnrichedIndex => {
  const indexedRecords: EnrichedCallRecord[] = [];

  return {
    indexMany: async (records: EnrichedCallRecord[]): Promise<void> => {
      indexedRecords.push(...records.map((record) => ({ ...record })));
    },
    getAll: (): EnrichedCallRecord[] => [...indexedRecords]
  };
};
