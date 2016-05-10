import generalTypoMap from './general'
import styleTypoMap from './style'
import scriptTypoMap from './script'
import cTypoMap from './c'

import isStyle from '../helpers/isStyle'
import isScript from '../helpers/isScript'


export default [
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
