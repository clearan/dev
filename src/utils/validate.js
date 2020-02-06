/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor','jay']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * 校验安全码
 * 去掉空格后字符长度不小于6
 */
export function validateVcode(str) {
  return str.replace(/\s/g,"").length<6 ? false : true
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg = /^[a-zA-Z0-9/_]+$/

  return reg.test(url)
}

export function checkVal(num) {
  return (num > 0) && ((num & (num - 1)) == 0);
}

export function judgeNaN (num) {
  return (typeof value) === 'number' && window.isNaN(value);
}
