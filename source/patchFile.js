import path from 'path'

import chalk from 'chalk'
import {Signature} from 'nodegit'
import fsp from 'fs-promise'
import isBinary from 'is-binary'

import replaceTypos from './replaceTypos'

import generalTypoMap from './typoMaps/general'
import styleTypoMap from './typoMaps/style'
import scriptTypoMap from './typoMaps/script'
import isHumanReadable from './isHumanReadable'
import isStyle from './isStyle'
import isScript from './isScript'
import typoMapObjects from './typoMaps'


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
