import util from 'util'
const debuglog = util.debuglog('tests')

// Diff can only be required and not imported
const diff = require('diff')

import replaceTypos from './replaceTypos'
import typoMapObjects from './typoMaps'
import isHumanReadable from './helpers/isHumanReadable'


export default (options = {}) => {
	const {entry, repo} = options
	const filePath = entry.path()

	return entry
		.getBlob()
		.then(blob => blob.toString())
		.then(fileContent => {
			let newFileContent = fileContent
			let contentWasChanged = false

			if  (!isHumanReadable(filePath, fileContent)) {
				throw new Error('not human readable')
			}

			typoMapObjects.forEach(typoMapObject => {
				if (!typoMapObject.test(filePath)) {
					return
				}

				const changedFileContent = replaceTypos(
					newFileContent,
					filePath,
					typoMapObject.map,
				)
				if (changedFileContent) {
					contentWasChanged = true
					newFileContent = changedFileContent
				}
			})

			if (!contentWasChanged) {
				debuglog('Nothing was fixed in %s', filePath)
			}

			return diff.createPatch(
				filePath,
				fileContent,
				newFileContent,
			)
		})
		.then(diffs => {
			debuglog(util.inspect(diffs, {depth: null, colors: true}))
			return diffs
		})
		.catch(error =>
			console.error(error.stack)
		)
}
