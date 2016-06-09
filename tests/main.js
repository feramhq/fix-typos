const path = require('path')
const assert = require('assert')

const bunyan = require('bunyan')
const {Repository, Clone} = require('nodegit')
const del = require('del')

const getTypoPatches = require('..')

const log = bunyan.createLogger({
  name: 'fix typos tests',
  level: 'trace',
})
const clonedRepoPath = path.join(__dirname, 'broken')

del(clonedRepoPath, {force: true})
  .then(() =>
    Clone.clone('https://github.com/ferambot/broken', clonedRepoPath)
  )
  // Ignore that git repo might already exist
  .catch(() => {})
  // Open repository always from path,
  // instead of using the repo instance
  // which was return from the clone operation
  // as it might not actually have been cloned
  .then(() => Repository.open(clonedRepoPath))
  .then(repo => getTypoPatches({repo}))
  .then(patchCollection => {
    assert.equal(patchCollection.patches.length, 3)
    log.info('Created patches ✔︎')
  })
  .catch(error => log.error(error))

{
  // It corrects some wrong usages of "a" and "an"
  const usageMap = require('./a-an-usage')
  const fixIndefiniteArticle = require('../source/fixIndefiniteArticle')

  // Check for introduction of unwanted typos in correct sentencees
  // Must be avoided at all cost in automatic mode! (false positives)

  usageMap.a.forEach(word => {
    const correctSentence = `a ${word}`
    assert.equal(
      fixIndefiniteArticle(correctSentence),
      false,
      `A typo was introduced in "${correctSentence}"`
    )
  })

  usageMap.an.forEach(word => {
    const correctSentence = `an ${word}`
    assert.equal(
      fixIndefiniteArticle(correctSentence),
      false,
      `A typo was introduced in "${correctSentence}"`
    )
  })

  // Fix wrong usage

  usageMap.correctAToAn.forEach(word => {
    const incorrectSentence = `a ${word}`
    const correctSentence = `an ${word}`
    assert.equal(
      fixIndefiniteArticle(incorrectSentence),
      correctSentence,
      `"${incorrectSentence}" should get fixed to "${correctSentence}"`
    )
  })

  usageMap.correctAnToA.forEach(word => {
    const incorrectSentence = `an ${word}`
    const correctSentence = `a ${word}`
    assert.equal(
      fixIndefiniteArticle(incorrectSentence),
      correctSentence,
      `"${incorrectSentence}" should get fixed to "${correctSentence}"`
    )
  })
}
