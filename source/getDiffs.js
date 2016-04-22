import getDiffForFile from './getDiffForFile'
import bunyan from 'bunyan'

const log = bunyan.createLogger({
	name: 'patch-repo',
	level: 0,
})

export default (options = {}) => {
	const {repo, ignore} = options

	return repo
		.getHeadCommit()
		.then(commit => commit.getTree())
		.then(fileTree => new Promise((resolve, reject) => {
			let fileCheckPromiseChain = Promise.resolve()
			let filesCanBeFixed = false
			let changes = []

			const walker = fileTree.walk(true)

			walker.on('error', reject)

			walker.on('entry', (entry) => {
				if (ignore instanceof RegExp && ignore.test(entry.path())) {
					return
				}

				fileCheckPromiseChain = fileCheckPromiseChain
					.then(() => getDiffForFile(
						Object.assign({}, {entry}, options)
					))
					.then(fileChanges => {
						if (fileChanges) {
							changes.push(fileChanges)
						}
					})
			})

			walker.on('end', () => resolve(
				fileCheckPromiseChain
					.then(() => changes)
			))

			walker.start()
		}))
}
