export default (options = {}) => {
	const {fileTree, shallReturnPatches} = options

	return new Promise((resolve, reject) => {
		let fileEditPromiseChain = Promise.resolve()
		let commitWasCreated = false

		const walker = fileTree.walk(true)

		walker.on('error', error => reject(error))
		walker.on('entry', (entry) => {
			fileEditPromiseChain = fileEditPromiseChain
				.then(commitId => {
					if (commitId) {
						commitWasCreated = true
					}
					return fixTyposInFile(
						Object.assign({}, {entry}, options)
					)
				})
		})
		walker.on('end', () => {
			resolve(fileEditPromiseChain
				.then(() => commitWasCreated)
			)
		})
		walker.start()
	})
}
