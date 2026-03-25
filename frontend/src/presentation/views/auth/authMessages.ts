export function toAuthErrorMessage(err: unknown) {
  const code = err instanceof Error ? err.message : '';

  switch (code) {
    case 'AUTH_FULL_NAME_REQUIRED':
      return 'FULL NAME REQUIRED.';
    case 'AUTH_EMAIL_REQUIRED':
      return 'EMAIL REQUIRED.';
    case 'AUTH_EMAIL_INVALID':
      return 'INVALID EMAIL ADDRESS.';
    case 'AUTH_EMAIL_IN_USE':
      return 'EMAIL ALREADY REGISTERED.';
    case 'AUTH_PASSWORD_REQUIRED':
      return 'ACCESS KEY REQUIRED.';
    case 'AUTH_PASSWORD_TOO_SHORT':
      return 'ACCESS KEY MUST BE 8+ CHARACTERS.';
    case 'AUTH_INVALID_CREDENTIALS':
      return 'INVALID ACCESS CREDENTIALS.';
    case 'AUTH_USER_NOT_FOUND':
      return 'ACCOUNT NOT FOUND.';
    case 'AUTH_RESET_CODE_REQUIRED':
      return 'RESET CODE REQUIRED.';
    case 'AUTH_RESET_NOT_REQUESTED':
      return 'NO ACTIVE RESET REQUEST.';
    case 'AUTH_RESET_EXPIRED':
      return 'RESET CODE EXPIRED. REQUEST A NEW ONE.';
    case 'AUTH_RESET_CODE_INVALID':
      return 'INVALID RESET CODE.';
    case 'AUTH_NETWORK_ERROR':
      return 'NETWORK ERROR. CHECK BACKEND CONNECTION.';
    case 'AUTH_SERVER_ERROR':
      return 'SERVER ERROR. TRY AGAIN.';
    case 'AUTH_UNAUTHORIZED':
    case 'AUTH_INVALID_SESSION':
      return 'SESSION EXPIRED. LOG IN AGAIN.';
    default:
      return 'SYSTEM ERROR. TRY AGAIN.';
  }
}
