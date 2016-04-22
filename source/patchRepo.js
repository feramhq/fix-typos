import path from 'path'

// Diff can only be required and not imported
const diff = require('diff')
import fsp from 'fs-promise'
import bunyan from 'bunyan'

const log = bunyan.createLogger({
	name: 'patch-repo',
	level: 0,
})


export default (options = {}) => {
	const {repo, changes} = options

	return repo
		.getHeadCommit()
		.then(commit => commit.getTree())
		.then(fileTree => new Promise((resolve, reject) => {

			let applyPatchChain = Promise.resolve()

			changes.forEach(patch => {
				let rewritePromiseChain = Promise.resolve()

				diff.applyPatches(patch, {
					loadFile: (index, callback) => {
						fileTree
							.getEntry(index.newFileName)
							.then(entry => entry.getBlob())
							.then(fileContent =>
								callback(null, fileContent.toString()))
							.catch(callback)
					},
					patched: (index, content) => {
						rewritePromiseChain = rewritePromiseChain
							.then(() => fsp.writeFile(
								path.join(
									path.dirname(repo.path()),
									index.newFileName
								),
								content
							))
					},
					complete: (error) => {
						if (error) {
							reject(error)
						}
						else {
							log.info(
								'A patch was applied to %s',
								patch.slice(7, patch.indexOf('\n')),
							)
							applyPatchChain = applyPatchChain
								.then(() => rewritePromiseChain)
						}
					}
				})
			})

			resolve(applyPatchChain)
		}))
}
