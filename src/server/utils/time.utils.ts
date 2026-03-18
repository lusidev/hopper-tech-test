import {
  CURRENCY_PRECISION_FACTOR,
  ISO_8601_TIMESTAMP_REGEX,
  LOOKUP_DATE_REGEX,
  LOOKUP_DATE_YEAR_SLICE_LENGTH
} from '../../consts';

export const isIso8601Timestamp = (value: string): boolean => {
  const match = ISO_8601_TIMESTAMP_REGEX.exec(value);
  const parsedDate = new Date(value);

  return match === null
    ? false
    : !Number.isNaN(parsedDate.getTime()) && hasMatchingTimestampParts(match, parsedDate);
};

const hasMatchingTimestampParts = (match: RegExpExecArray, parsedDate: Date): boolean => {
  const [
    ,
    yearPart,
    monthPart,
    dayPart,
    hourPart,
    minutePart,
    secondPart,
    millisecondPart,
    timezonePart,
    offsetSignPart,
    offsetHourPart,
    offsetMinutePart
  ] = match;

  const normalizedDate = new Date(parsedDate.getTime() + (resolveOffsetMinutes(
    timezonePart,
    offsetSignPart,
    offsetHourPart,
    offsetMinutePart
  ) * 60_000));

  return [
    normalizedDate.getUTCFullYear() === Number(yearPart),
    normalizedDate.getUTCMonth() + 1 === Number(monthPart),
    normalizedDate.getUTCDate() === Number(dayPart),
    normalizedDate.getUTCHours() === Number(hourPart),
    normalizedDate.getUTCMinutes() === Number(minutePart),
    normalizedDate.getUTCSeconds() === Number(secondPart),
    normalizedDate.getUTCMilliseconds() === resolveMilliseconds(millisecondPart)
  ].every(Boolean);
};

const resolveMilliseconds = (millisecondPart?: string): number => Number((millisecondPart ?? '0').padEnd(3, '0'));

const resolveOffsetMinutes = (
  timezonePart: string,
  offsetSignPart?: string,
  offsetHourPart?: string,
  offsetMinutePart?: string
): number => (
  timezonePart === 'Z'
    ? 0
    : (offsetSignPart === '+' ? 1 : -1) * ((Number(offsetHourPart) * 60) + Number(offsetMinutePart))
);

export const isLookupDate = (value: string): boolean => LOOKUP_DATE_REGEX.test(value);

export const calculateDurationInSeconds = (startIso: string, endIso: string): number => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return Math.max(0, Math.floor((end - start) / 1000));
};

export const toLookupDate = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO timestamp: ${isoTimestamp}`);
  }

  const year = String(date.getUTCFullYear()).slice(-LOOKUP_DATE_YEAR_SLICE_LENGTH);
  const month = padTwoDigits(date.getUTCMonth() + 1);
  const day = padTwoDigits(date.getUTCDate());

  return `${year}-${month}-${day}`;
};

export const roundCurrency = (value: number): number => Math.round(value * CURRENCY_PRECISION_FACTOR) / CURRENCY_PRECISION_FACTOR;

const padTwoDigits = (value: number): string => (value < 10 ? `0${value}` : String(value));
