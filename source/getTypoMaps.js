const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')
const nativeConsole = require('console')
const log = new nativeConsole.Console(process.stdout, process.stderr)
const typoMapsPath = path.join(__dirname, 'typoMaps')
const keywordListsPath = path.join(__dirname, 'keywordLists')
const keywordsFileName = 'keywords.yaml'

const fileTypes = [
  {
    name: 'c',
    test: filePath => /\.c$/.test(filePath),
  },
  {
    name: 'general',
    // Only human readable files are used anyways
    // => No more filtering required
    test: () => true,
  },
  {
    name: 'script',
    test: require('./helpers/isScript'),
  },
  {
    name: 'style',
    test: require('./helpers/isStyle'),
  },
]

function reverseMap (valueToKeysMap) {
  const keyToValueMap = {}

  Object
    .keys(valueToKeysMap)
    .forEach(value => {
      let keys = valueToKeysMap[value]

      if (!Array.isArray(keys)) {
        keys = [keys]
      }
      keys.forEach(key =>
        keyToValueMap[key] = value
      )
    })

  return keyToValueMap
}

function getTypoToWordMapPromise (fileTypeObject) {

  if (fileTypeObject.name === 'general') {
    return fsp
      .readdir(typoMapsPath)
      .then(fileNames => fileNames
        .filter(name =>
          /\.yaml$/.test(name) &&
          name !== keywordsFileName
        )
        .map(name => path.join(typoMapsPath, name))
      )
      .then(filePaths => Promise.all(
        filePaths.map(filePath => fsp.readFile(filePath))
      ))
      .then(fileContents => fileContents.map(yaml.safeLoad))
      .then(typoMaps => reverseMap(typoMaps.reduce(
        (map, typoMap) => Object.assign(map, typoMap),
        {}
      )))
      .then(typoToWordMap => {
        fileTypeObject.map = typoToWordMap
        return fileTypeObject
      })
  }

  return fsp
    .readFile(path.join(keywordListsPath, fileTypeObject.name + '.yaml'))
    .then(yaml.safeLoad)
    .then(keywords => fsp
      .readFile(path.join(typoMapsPath, 'keywords.yaml'))
      .then(yaml.safeLoad)
      .then(keywordToTyposMap => {
        return keywords.reduce(
          (filteredKeyworToTypoMap, keyword) => {
            if (keywordToTyposMap[keyword]) {
              filteredKeyworToTypoMap[keyword] = keywordToTyposMap[keyword]
            }
            return filteredKeyworToTypoMap
          },
          {}
        )
      })
    )
    .then(reverseMap)
    .then(typoToKeywordMap => {
      fileTypeObject.map = typoToKeywordMap
      return fileTypeObject
    })
}

module.exports = Promise
  .all(fileTypes.map(getTypoToWordMapPromise))
  .catch(log.error)
