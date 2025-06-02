/**
 * 数字转中文数字
 * @param {number} number 万亿以下数字
 * @returns string
 */
export function toChineseNumber(number) {
  const numberStringArray = number
    .toString()
    .replace(/(?=(\d{4})+$)/g, ',')
    .split(',')
    .filter(Boolean)

  const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千']
  const bigUnits = ['', '万', '亿']

  function handleZero(s) {
    return s.replace(/零{2,}/g, '零').replace(/零+$/, '')
  }

  function handleTen(s) {
    return s.replace(/^一十/, '十')
  }

  function _transform(n) {
    if (n === '0000') {
      return '零'
    }

    let result = ''

    for (let index = 0; index < n.length; index++) {
      const c = chars[+n[index]]
      let u = units[n.length - 1 - index]

      if (c === chars[0]) {
        u = ''
      }

      result += c + u
    }

    return handleZero(result)
  }

  let result = ''

  for (let index = 0; index < numberStringArray.length; index++) {
    const part = numberStringArray[index]
    const c = _transform(part)
    let u = bigUnits[numberStringArray.length - 1 - index]

    if (c === chars[0]) {
      u = ''
    }

    result += c + u
  }

  return handleTen(handleZero(result))
}

/**
 * 数字转大写中文数字
 * @param {number} number 万亿以下数字
 * @returns string
 */
export function toBigChineseNumber(number) {
  const result = toChineseNumber(number)
  const map = {
    零: '零',
    一: '壹',
    二: '贰',
    三: '叁',
    四: '肆',
    五: '伍',
    六: '陆',
    七: '柒',
    八: '捌',
    九: '玖',
    十: '拾',
    百: '佰',
    千: '仟',
    万: '万',
    亿: '亿'
  }

  return result
    .split('')
    .map((s) => map[s])
    .join('')
}

