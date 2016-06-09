module.exports = (fileContent) => {
  const start = /((?:[ .?!,;]|^)[aA])/.source
  const incorrectA = new RegExp(
    start +
    / ((?:[aei]|o(?!(nc|ne))|u(?!(ni|se|ti)))|ho(?:ur|n))/g.source
  )
  const incorrectAn = new RegExp(
    start +
    /n ([bcdfghj-np-tv-z]|o(?![un][^s])|u(?:s)|u(?:ni))/g.source
  )

  const fixedFileContent = fileContent
    .replace(incorrectAn, '$1 $2')
    .replace(incorrectA, '$1n $2')

  return fixedFileContent !== fileContent ?
    fixedFileContent :
    false
}
