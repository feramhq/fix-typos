const isBinary = require('is-binary')

module.exports = (filePath, fileContent) => {
  return !isBinary(fileContent) &&
    !/\.min\.(css|js|html)$/.test(filePath) &&
    !/\.(css|js)\.map$/.test(filePath)
}
