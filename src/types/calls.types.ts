export interface CallRecord {
  id: string;
  callStartTime: string; // ISO 8601 formatted timestamp
  callEndTime: string; // ISO 8601 formatted timestamp
  fromNumber: string;
  toNumber: string;
  callType: 'voice' | 'video';
  region: string;
}

export interface EnrichedCallRecord extends CallRecord {
  duration: number;
  fromOperator?: string;
  toOperator?: string;
  fromCountry?: string;
  toCountry?: string;
  estimatedCost?: number;
}