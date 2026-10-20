/**
 * Memo types that employees must acknowledge. Everything else (internal/general
 * notices, circulars, meeting notices) is informational and needs no acknowledgement.
 *
 * - Disciplinary Memo: acknowledgement is the employee's proof of receipt (due process).
 * - Policy Memo: employees confirm they have read the rule they are now bound by.
 */
export const ACKNOWLEDGEMENT_REQUIRED_MEMO_TYPES = new Set<string>(['Disciplinary Memo', 'Policy Memo']);

export const memoRequiresAcknowledgement = (memoType: string | null | undefined): boolean =>
  ACKNOWLEDGEMENT_REQUIRED_MEMO_TYPES.has(memoType ?? '');
