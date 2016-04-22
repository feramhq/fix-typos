import getDiffForFile from './getDiffForFile'

export default (options = {}) => {
	const {fileTree, ignore} = options
	const walker = fileTree.walk(true)

	return new Promise((resolve, reject) => {
		let fileCheckPromiseChain = Promise.resolve()
		let filesCanBeFixed = false
		let changes = []

		walker.on('error', error => reject(error))

		walker.on('entry', (entry) => {
			if (ignore instanceof RegExp &&
				ignore.test(entry.path())
			) {
				return
			}

			fileCheckPromiseChain = fileCheckPromiseChain
				.then(() => {
					return getDiffForFile(
						Object.assign({}, {entry}, options)
					)
				})
				.then(fileChanges =>
					changes.push(fileChanges)
				)
		})

		walker.on('end', () => {
			resolve(
				fileCheckPromiseChain.then(() => changes)
			)
		})

		walker.start()
	})
}
