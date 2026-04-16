export const PASSWORD_RULES_TEXT =
  'Use at least 8 characters with at least 1 uppercase letter and 1 number.';

const PASSWORD_STRENGTH_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export function getPasswordStrengthError(password: string): string | null {
  if (!password) return 'Password is required';
  if (!PASSWORD_STRENGTH_REGEX.test(password)) return PASSWORD_RULES_TEXT;
  return null;
}
