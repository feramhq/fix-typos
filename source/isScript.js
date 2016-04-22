export default (filePath) => {
	const regex = new RegExp(
		'\\.(' +
		'javascript|js|jsx|' +
		'ecmascript|es|es2015|' +
		'typescript|ts|' +
		'coffeescript|coffee' +
		'livescript|ls' +
		')$'
	)
	regex.test(filePath)
}
