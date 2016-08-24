const assert = require('assert')
const fixTypos = require('..')
const isIterable = require('is-iterable')
const StreamTester = require('streamtester')
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
  // Test general usage
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
}

{
  // Test custom logging
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
}
