import type { OperatorInfo } from '../types/operator-lookup.types';

export const OPERATOR_LOOKUP_MIN_DELAY_MS = 100;
export const OPERATOR_LOOKUP_DELAY_RANGE_MS = 200;
export const OPERATOR_LOOKUP_FAILURE_RATE = 0.05;
export const OPERATOR_LOOKUP_PHONE_PREFIX_LENGTH = 3;

export const DEFAULT_OPERATOR_INFO: OperatorInfo = {
  operator: 'International Operator',
  country: 'Unknown',
  estimatedCostPerMinute: 0.10
};

export const OPERATOR_LOOKUP_MAPPINGS = [
  {
    startsWith: '+1',
    resolve: (phonePrefix: string): OperatorInfo => ({
      operator: phonePrefix === '+14' ? 'AT&T' : 'Verizon',
      country: 'United States',
      estimatedCostPerMinute: 0.02
    })
  },
  {
    startsWith: '+44',
    resolve: (phonePrefix: string): OperatorInfo => ({
      operator: phonePrefix === '+442' ? 'BT' : 'Vodafone',
      country: 'United Kingdom',
      estimatedCostPerMinute: 0.05
    })
  },
  {
    startsWith: '+49',
    resolve: (): OperatorInfo => ({
      operator: 'Deutsche Telekom',
      country: 'Germany',
      estimatedCostPerMinute: 0.04
    })
  },
  {
    startsWith: '+33',
    resolve: (): OperatorInfo => ({
      operator: 'Orange',
      country: 'France',
      estimatedCostPerMinute: 0.045
    })
  }
] as const;