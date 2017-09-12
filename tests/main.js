const assert = require('assert')

const isIterable = require('is-iterable')
const StreamTester = require('streamtester')

const buildPatch =  require('../source/buildPatch.js')
const fixTypos = require('..')
const streamTester = new StreamTester({
  test: (chunk) =>
    assert.equal(JSON.parse(chunk).name, 'test custom log'),
})
const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'fix typos tests',
  level: 'error',
})


{
  process.stdout.write('General usage')

  fixTypos()
    .then(fixFunctionObjects => {
      assert(
        isIterable(fixFunctionObjects),
        `Is not iterable but ${typeof fixFunctionObjects}`
      )

      for (const fixFunctionObject of fixFunctionObjects) {
        assert.equal(typeof fixFunctionObject.function, 'function')
      }
    })
    .catch(error => log.error(error))
  process.stdout.write(' ✔\n')
}

{
  process.stdout.write('Custom logging')

  const customLog = bunyan.createLogger({
    name: 'test custom log',
    level: 'trace',
    streams: [{
      stream: streamTester,
      level: 'trace',
    }],
  })

  fixTypos({log: customLog})
    .then(fixFunctionObjects => {
      for (const fixFunctionObject of fixFunctionObjects) {
        fixFunctionObject.function('This text has smoe typso.')
      }
    })
    .catch(error => log.error(error))
  process.stdout.write(' ✔\n')
}

{
  process.stdout.write('Fixing typos')

  const getTypoFixFunction = require('../source/getTypoFixFunction')
  const incorrect = 'The word "manny" should be corrected'
  const correct = 'The word "many" should be corrected'
  const fileName = 'readme.md'

  const fixFunction = getTypoFixFunction({
    typo: 'manny',
    correction: 'many',
    log,
  })
  const expectedPatches = [{
    type: 'unidiff',
    fileName,
    body: buildPatch(fileName, 1, incorrect, correct),
    containsFix: true,
  }]
  const actualPatches = fixFunction({
    text: incorrect,
    fileName,
  })

  assert.deepStrictEqual(expectedPatches, actualPatches)
  process.stdout.write(' ✔\n')
}

{
  process.stdout.write('Fix typo at the start of a line')
  const getTypoFixFunction = require('../source/getTypoFixFunction')
  const incorrect = 'exerpt should be corrected'
  const correct = 'excerpt should be corrected'
  const fileName = 'readme.md'
  const fixFunction = getTypoFixFunction({
    typo: 'exerpt',
    correction: 'excerpt',
    log,
  })
  const expectedPatches = [{
    type: 'unidiff',
    fileName,
    body: buildPatch(fileName, 1, incorrect, correct),
    containsFix: true,
  }]
  const actualPatches = fixFunction({
    text: incorrect,
    fileName,
  })

  assert.deepStrictEqual(expectedPatches, actualPatches)
  process.stdout.write(' ✔\n')
}

{
  process.stdout.write('Fix typo at the end of a line')
  const getTypoFixFunction = require('../source/getTypoFixFunction')
  const incorrect = 'Should be corrected: exerpt'
  const correct = 'Should be corrected: excerpt'
  const fileName = 'readme.md'
  const fixFunction = getTypoFixFunction({
    typo: 'exerpt',
    correction: 'excerpt',
    log,
  })
  const expectedPatches = [{
    type: 'unidiff',
    fileName,
    body: buildPatch(fileName, 1, incorrect, correct),
    containsFix: true,
  }]
  const actualPatches = fixFunction({
    text: incorrect,
    fileName,
  })

  assert.deepStrictEqual(expectedPatches, actualPatches)
  process.stdout.write(' ✔\n')
}

{
  process.stdout.write('Fixing typos with spaces')
  const getTypoFixFunction = require('../source/getTypoFixFunction')
  const incorrect = 'The words "coca cola" should be corrected'
  const correct = 'The words "coca-cola" should be corrected'
  const fileName = 'readme.md'
  const fixFunction = getTypoFixFunction({
    typo: 'coca cola',
    correction: 'coca-cola',
    log,
  })
  const expectedPatches = [{
    type: 'unidiff',
    fileName,
    body: buildPatch(fileName, 1, incorrect, correct),
    containsFix: true,
  }]
  const actualPatches = fixFunction({
    text: incorrect,
    fileName,
  })

  assert.deepStrictEqual(expectedPatches, actualPatches)
  process.stdout.write(' ✔\n')
}

{
  process.stdout.write('Ignore long lines')
  const getTypoFixFunction = require('../source/getTypoFixFunction')
  const incorrect = 'Should be corrected: abotu '
  const correct = 'Should be corrected: about '

  const fixFunction = getTypoFixFunction({
    typo: 'abotu',
    correction: 'about',
    log,
  })

  assert.notEqual(
    fixFunction(
      incorrect
        .repeat(100)
        .slice(0, 1001)
    ),
    correct
      .repeat(100)
      .slice(0, 1001)
  )
  process.stdout.write(' ✔\n')
}
