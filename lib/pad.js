module.exports = function pad (text, size) {
  let s = String(text)
  while (s.length < (size || 2)) { s = '0' + s }
  return s
}
