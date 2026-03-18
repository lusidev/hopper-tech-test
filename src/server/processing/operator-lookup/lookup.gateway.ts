import { lookupOperator } from '../../mocks';
import type { LookupGateway, OperatorInfo } from '../../../types';

export const createLookupGateway = (
  lookup: LookupGateway['lookup'] = lookupOperator
): LookupGateway => ({
  lookup: async (phoneNumber: string, callDate: string): Promise<OperatorInfo> =>
    lookup(phoneNumber, callDate)
});