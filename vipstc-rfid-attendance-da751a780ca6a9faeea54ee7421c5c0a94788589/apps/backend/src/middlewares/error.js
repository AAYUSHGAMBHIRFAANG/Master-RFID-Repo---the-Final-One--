import createError from 'http-errors';

/**
 * Wrap async route handlers so thrown errors go to next(err)
 */
export const asyncWrap =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Express error-handling middleware (must have 4 args)
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Convert unknown errors
  console.error('💥', err);
  const e = createError.isHttpError(err) ? err : createError(500, err.message);
  if (process.env.NODE_ENV !== 'test') {
    console.error(e); // eslint-disable-line no-console
  }
  res
    .status(e.statusCode || 500)
    .json({ status: e.statusCode || 500, message: e.message });
}
