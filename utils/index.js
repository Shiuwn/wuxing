/**
 *
 * @param {string} message
 * @returns {Error}
 */
export const createError = (message) => { throw new Error(`[error] ${message}`) }
