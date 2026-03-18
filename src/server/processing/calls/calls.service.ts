import {
  createInMemoryEnrichedIndex,
  createInMemoryEnrichedStore
} from '../../mocks';
import {
  calculateDurationInSeconds,
  roundCurrency,
  toLookupDate
} from '../../utils';
import type {
  BatchService,
  CallRecord,
  EnrichedCallRecord,
  EnrichedIndex,
  EnrichedStore,
  LookupGateway,
  SafeLookupResult
} from '../../../types';
import { createLookupGateway } from '../operator-lookup';

const createEnrichedRecord = async (
  record: CallRecord,
  lookupGateway: LookupGateway
): Promise<EnrichedCallRecord> => {
  const safeLookup = async (phoneNumber: string, callDate: string): Promise<SafeLookupResult> => {
    try {
      return {
        info: await lookupGateway.lookup(phoneNumber, callDate)
      };
    } catch {
      return {};
    }
  };

  const duration = calculateDurationInSeconds(record.callStartTime, record.callEndTime);
  const lookupDate = toLookupDate(record.callStartTime);

  const [fromLookup, toLookup] = await Promise.all([
    safeLookup(record.fromNumber, lookupDate),
    safeLookup(record.toNumber, lookupDate)
  ]);

  const pricePoints = [fromLookup.info?.estimatedCostPerMinute, toLookup.info?.estimatedCostPerMinute]
    .filter((value): value is number => typeof value === 'number');

  const averagePricePerMinute = pricePoints.length > 0
    ? pricePoints.reduce((sum, value) => sum + value, 0) / pricePoints.length
    : undefined;

  return {
    ...record,
    duration,
    fromOperator: fromLookup.info?.operator,
    toOperator: toLookup.info?.operator,
    fromCountry: fromLookup.info?.country,
    toCountry: toLookup.info?.country,
    estimatedCost: averagePricePerMinute === undefined
      ? undefined
      : roundCurrency((duration / 60) * averagePricePerMinute)
  };
};

export const createBatchService = (
  lookupGateway: LookupGateway = createLookupGateway(),
  enrichedStore: EnrichedStore = createInMemoryEnrichedStore(),
  enrichedIndex: EnrichedIndex = createInMemoryEnrichedIndex()
): BatchService => ({
  process: async (records: CallRecord[]): Promise<EnrichedCallRecord[]> => {
    const enrichedRecords = await Promise.all(
      records.map((record) => createEnrichedRecord(record, lookupGateway))
    );

    await Promise.all([
      enrichedStore.saveMany(enrichedRecords),
      enrichedIndex.indexMany(enrichedRecords)
    ]);

    return enrichedRecords;
  }
});