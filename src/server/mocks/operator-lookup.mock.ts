import { isLookupDate } from '../utils';
import type { OperatorInfo } from '../../types';
import {
  DEFAULT_OPERATOR_INFO,
  E164_PHONE_REGEX,
  OPERATOR_LOOKUP_DELAY_RANGE_MS,
  OPERATOR_LOOKUP_FAILURE_RATE,
  OPERATOR_LOOKUP_MAPPINGS,
  OPERATOR_LOOKUP_MIN_DELAY_MS,
  OPERATOR_LOOKUP_PHONE_PREFIX_LENGTH
} from '../../consts';

type LookupInputValidation = {
  isValid: boolean;
  createError: () => Error;
};

const raise = (error: Error): never => {
  throw error;
};

const throwIfPresent = (error?: Error): void => {
  (error ? [error] : []).forEach(raise);
};

const resolveOperatorInfo = (phoneNumber: string, phonePrefix: string): OperatorInfo => (
  OPERATOR_LOOKUP_MAPPINGS.find((mapping) => phoneNumber.startsWith(mapping.startsWith))?.resolve(phonePrefix)
  ?? DEFAULT_OPERATOR_INFO
);

const createLookupInputValidations = (phoneNumber: string, callDate: string): LookupInputValidation[] => [
  {
    isValid: E164_PHONE_REGEX.test(phoneNumber),
    createError: () => new Error(`Phone number must be in E.164 format: ${phoneNumber}`)
  },
  {
    isValid: isLookupDate(callDate),
    createError: () => new Error(`Call date must be in 'yy-MM-dd' format: ${callDate}`)
  }
];

/**
 * Mock operator lookup service.
 * Takes 100-300ms and occasionally fails (~5% failure rate).
 */
export const lookupOperator = async (
  phoneNumber: string,
  callDate: string
): Promise<OperatorInfo> => {
  throwIfPresent(
    createLookupInputValidations(phoneNumber, callDate)
      .find(({ isValid }) => !isValid)
      ?.createError()
  );

  const delay = Math.floor(Math.random() * OPERATOR_LOOKUP_DELAY_RANGE_MS) + OPERATOR_LOOKUP_MIN_DELAY_MS;
  await new Promise((resolve) => setTimeout(resolve, delay));
  throwIfPresent(
    Math.random() < OPERATOR_LOOKUP_FAILURE_RATE
      ? new Error('Operator lookup service temporarily unavailable')
      : undefined
  );

  const phonePrefix = phoneNumber.substring(0, OPERATOR_LOOKUP_PHONE_PREFIX_LENGTH);

  return resolveOperatorInfo(phoneNumber, phonePrefix);
};
