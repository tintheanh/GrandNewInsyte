export enum MyErrorCodes {
  UnknownError = 'unknown-error',
  EmailFailed = 'email-failed',
  PasswordFailed = 'password-failed',
  UsernameFailed = 'username-failed',
  PasswordsDontMatch = 'passwords-dont-match',
  DataNotFound = 'data-not-found',
  NotAuthenticated = 'not-authenticated',
  GettingDataFailed = 'getting-data-failed',
}

/**
 * Custom error class
 * @property code
 * @property message
 */
export default class MyError extends Error {
  public code: MyErrorCodes;
  public message: string;
  constructor(message: string, code = MyErrorCodes.UnknownError) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.message = message;
  }
}
