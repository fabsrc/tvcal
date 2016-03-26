'use strict'

Number.prototype.pad = function(size) {
  let s = String(this)
  while (s.length < (size || 2)) { s = '0' + s }
  return s
}
