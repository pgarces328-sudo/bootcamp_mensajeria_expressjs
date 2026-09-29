export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string);
  constructor(message: string, statusCode: number);

  constructor(
    firstArgument: number | string,
    secondArgument: string | number
  ) {
    const statusCode =
      typeof firstArgument === 'number'
        ? firstArgument
        : secondArgument;

    const message =
      typeof firstArgument === 'string'
        ? firstArgument
        : secondArgument;

    super(String(message));

    this.name = 'AppError';
    this.statusCode = Number(statusCode);
    this.isOperational = true;

    Error.captureStackTrace(this, AppError);
  }
}