import path from 'path'

import chalk from 'chalk'
import {Signature} from 'nodegit'
import fsp from 'fs-promise'
import isBinary from 'is-binary'

import replaceTypos from './replaceTypos'

import typoMapObjects from './typoMaps'
import isHumanReadable from './helpers/isHumanReadable'
import isStyle from './helpers/isStyle'
import isScript from './helpers/isScript'


export default (options = {}) => {
	const {entry, repo, authorSignature, committerSignature} = options
	const filePath = entry.path()

	return entry
		.getBlob()
		.then(blob => {
			let fileContent = blob.toString()
			let isFixed = false

			if  (!isHumanReadable(filePath, fileContent)) {
				throw new Error('not human readable')
			}

			typoMapObjects.forEach(mapObject => {
				if (!mapObject.test(filePath)) { return }

				const newFileConent = replaceTypos(
					fileContent,
					filePath,
					mapObject.map,
				)
				if (newFileConent) {
					isFixed = true
					fileContent = newFileConent
				}
			})

			if (!isFixed) {
				process.stdout.write('.')
				throw new Error('nothing was fixed')
			}

			fsp.writeFile(
				path.join(repo.workdir(), filePath),
				fileContent
			)
		})
		.then(() => repo.index())
		.then(repoIndex => {
			repoIndex.addByPath(filePath)
			repoIndex.write()
			return repoIndex.writeTree()
		})
		.then(() => repo.createCommitOnHead(
			[filePath],
			authorSignature,
			committerSignature,
			`Fix typos in ` + path.basename(filePath)
		))
		.catch(error => {
			if (['nothing was fixed', 'not human readable']
				.indexOf(error.message) >= 0
			) { return }

			console.error(chalk.red(error.stack))
		})
}
