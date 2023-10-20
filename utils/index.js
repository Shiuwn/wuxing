import { random } from 'lodash-es'
/**
 *
 * @param {string} message
 * @returns {Error}
 */
export const createError = (message) => { throw new Error(`[error] ${message}`) }

/**
 *
 * @param {Array<any>} arr
 */
export const randomGet = (arr) =>  {
  if(!Array.isArray(arr)) return
  const index = random(0, arr.length - 1)
  return arr[index]
}
