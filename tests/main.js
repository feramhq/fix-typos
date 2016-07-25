const assert = require('assert')
const fixTypos = require('..')
const isIterable = require('is-iterable')

const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'fix typos tests',
  level: 'trace',
})

{
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
