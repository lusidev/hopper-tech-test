import type { ValidationIssue, ValidationResult } from '../../types';

export const successResult = <T,>(value: T): ValidationResult<T> => ({
  success: true,
  value,
  issues: []
});

export const failureResult = <T,>(issues: ValidationIssue[]): ValidationResult<T> => ({
  success: false,
  issues
});

export const formatValidationIssues = (issues: ValidationIssue[]): string => issues
  .map((issue) => {
    const linePrefix = issue.line === undefined ? '' : `line ${issue.line}: `;
    const fieldPrefix = issue.field === undefined ? '' : `${issue.field} - `;
    return `${linePrefix}${fieldPrefix}${issue.message}`;
  })
  .join('; ');
