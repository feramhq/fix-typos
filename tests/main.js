const path = require('path')
const assert = require('assert')

const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'fix typos tests',
  level: 'trace',
})


{
  const {Repository, Clone} = require('nodegit')
  const del = require('del')

  const getTypoPatches = require('..')
  const clonedRepoPath = path.join(__dirname, 'broken')
  const referencePatches = require('./referencePatches')

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
    .then(repo => {
      log.info('It fixes typos in repo "ferambot/broken"')
      return getTypoPatches({repo})
    })
    .then(patchCollection => {
      assert.deepEqual(
        patchCollection.patches,
        referencePatches,
        `${JSON.stringify(patchCollection.patches)}
should equal
${JSON.stringify(referencePatches)}`
      )
    })
    .catch(error => log.error(error))
}

{
  log.info('It corrects incorrect usages of "a"')
  const usageMap = require('./a-an-usage')
  const fixIncorrectA = require('../source/fixIncorrectA')

  // Check for introduction of unwanted typos in correct sentencees
  // Must be avoided at all cost in automatic mode! (false positives)
  usageMap.a.forEach(word => {
    const correctSentence = `a ${word}`
    const sentenceWasCorrected = fixIncorrectA(correctSentence)
    assert.equal(
      sentenceWasCorrected,
      false,
      `"${correctSentence}" was incorrectly changed to "${
        sentenceWasCorrected}"`
    )
    log.trace(`"${correctSentence}" was not changed`)
  })

  usageMap.correctAToAn.forEach(word => {
    const incorrectSentence = `a ${word}`
    const correctSentence = `an ${word}`
    const fixedSentence = fixIncorrectA(incorrectSentence)

    assert.equal(
      fixedSentence,
      correctSentence,
      `"${incorrectSentence}" should get fixed to "${correctSentence
        }" and not "${fixedSentence}"`
    )
  })
}

{
  log.info('It corrects incorrect usages of "an"')
  const usageMap = require('./a-an-usage')
  const fixIncorrectAn = require('../source/fixIncorrectAn')

  // Check for introduction of unwanted typos in correct sentencees
  // Must be avoided at all cost in automatic mode! (false positives)
  usageMap.an.forEach(word => {
    const correctSentence = `an ${word}`
    const sentenceWasCorrected = fixIncorrectAn(correctSentence)

    assert.equal(
      sentenceWasCorrected,
      false,
      `"${correctSentence}" was incorrectly changed to "${
        sentenceWasCorrected}"`
    )
    log.trace(`"${correctSentence}" was not changed`)
  })

  usageMap.correctAnToA.forEach(word => {
    const incorrectSentence = `an ${word}`
    const correctSentence = `a ${word}`
    const fixedSentence = fixIncorrectAn(incorrectSentence)

    assert.equal(
      fixedSentence,
      correctSentence,
      `"${incorrectSentence}" should get fixed to "${correctSentence
      }" and not "${fixedSentence}"`
    )
  })
}
