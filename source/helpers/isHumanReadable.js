import isBinary from 'is-binary'

export default (filePath, fileContent) => {
	return !isBinary(fileContent) &&
		!/\.min\.(css|js|html)$/.test(filePath) &&
		!/\.(css|js)\.map$/.test(filePath)
}
