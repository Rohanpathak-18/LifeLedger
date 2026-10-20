export function success(res, data, message = 'Request completed') {
  return res.json({ success: true, data, message });
}

export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
