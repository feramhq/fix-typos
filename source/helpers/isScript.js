export default (filePath) => {
	const flags = 'i'
	const regex = new RegExp(
		'\\.(' +
		'javascript|js|jsx|' +
		'ecmascript|es|es2015|' +
		'typescript|ts|' +
		'coffeescript|coffee' +
		'livescript|ls' +
		')$',
		flags,
	)
	return regex.test(filePath)
}
