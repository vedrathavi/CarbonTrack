export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class HomeError extends AppError {
  constructor(message, code) {
    super(message, code.startsWith("4") ? parseInt(code) : 500);
    this.name = "HomeError";
    this.code = code;
  }
}
