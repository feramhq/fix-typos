const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const getDiffForFile = require('./getDiffForFile')
const packageData = require('../package.json')
const ignoreFileYaml = fs.readFileSync(
  path.join(__dirname, 'helpers/ignorePatterns.yaml'),
  'utf-8'
)
const ignorePatterns = yaml.safeLoad(ignoreFileYaml)
const ignoreRegexes = ignorePatterns.map(
  pattern => new RegExp(pattern)
)

module.exports = (options = {}) => {
  const {repo} = options

  return repo
    .getHeadCommit()
    .then(commit => commit.getTree())
    .then(fileTree => new Promise((resolve, reject) => {
      let fileCheckPromiseChain = Promise.resolve()
      const changes = []
      const walker = fileTree.walk(true)

      walker.on('error', reject)

      walker.on('entry', entry => {
        const mustBeIgnored = ignoreRegexes
          .some(regex => regex.test(entry.path()))

        if (mustBeIgnored) {
          return
        }

        fileCheckPromiseChain = fileCheckPromiseChain
          .then(() => getDiffForFile(
            Object.assign({}, {entry}, options)
          ))
          .then(fileChanges => {
            if (fileChanges) {
              changes.push(fileChanges)
            }
          })
      })

      walker.on('end', () => resolve(
        fileCheckPromiseChain.then(() => ({
          // eslint-disable-next-line camelcase
          created_by: packageData.name,
          patches: changes.map(change => ({
            type: 'unidiff',
            body: change,
          })),
        }))
      ))

      walker.start()
    }))
}
