export class AppError extends Error {
    statusCode: number;
    constructor(m: string, s: number) { super(m); this.statusCode = s; Error.captureStackTrace(this, this.constructor); }
}
