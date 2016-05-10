import path from 'path'
import assert from 'assert'

import bunyan from 'bunyan'
import {Repository, Clone} from 'nodegit'
import getTypoPatches from '..'

const log = bunyan.createLogger({
  name: 'tests',
  level: 'trace',
})
const clonedRepoPath = path.join(__dirname, 'broken')

Clone
  .clone('https://github.com/ferambot/broken', clonedRepoPath)
  // Ignore that git repo might already exist
  .catch(() => {})
  // Open repository always from path,
  // instead of using the repo instance
  // which was return from the clone operation
  // as it might not actually have been cloned
  .then(() => Repository.open(clonedRepoPath))
  .then(repo => getTypoPatches({repo}))
  .then(patches => {
    assert(
      patches.length === 3,
      'Expected 3 patches an not %s',
      patches.length
    )
    log.info('Created patches ✔︎')
    return patches
  })
  .catch(error => log.error(error))
