const generalTypoMap = require('./general')
const styleTypoMap = require('./style')
const scriptTypoMap = require('./script')
const cTypoMap = require('./c')

const isStyle = require('../helpers/isStyle')
const isScript = require('../helpers/isScript')


module.exports = [
  {
    name: 'general',
    map: generalTypoMap,
    test: () => true,
  },
  {
    name: 'style',
    map: styleTypoMap,
    test: isStyle,
  },
  {
    name: 'script',
    map: scriptTypoMap,
    test: isScript,
  },
  {
    name: 'c',
    map: cTypoMap,
    test: filePath => /\.c$/.test(filePath),
  },
]
