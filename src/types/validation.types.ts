export interface ValidationIssue {
  message: string;
  line?: number;
  field?: string;
  value?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  value?: T;
  issues: ValidationIssue[];
}