module.exports = (fileName, lineNumber = 1, incorrect, correct) => {
  return `--- ${fileName}\n` +
    `+++ ${fileName}\n` +
    `@@ -${lineNumber},1 +${lineNumber},1 @@\n` +
    `-${incorrect}\n` +
    `+${correct}\n`
}
