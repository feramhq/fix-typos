import getDiffForFile from './getDiffForFile'
import packageData from '../package.json'

export default (options = {}) => {
  const {repo, ignore} = options

  return repo
    .getHeadCommit()
    .then(commit => commit.getTree())
    .then(fileTree => new Promise((resolve, reject) => {
      let fileCheckPromiseChain = Promise.resolve()
      const changes = []

      const walker = fileTree.walk(true)

      walker.on('error', reject)

      walker.on('entry', (entry) => {
        if (ignore instanceof RegExp && ignore.test(entry.path())) {
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
