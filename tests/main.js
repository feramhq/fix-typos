import path from 'path'
import util from 'util'
import fsp from 'fs-promise'

import bunyan from 'bunyan'
import nodegit, {Repository, Clone} from 'nodegit'
import {getDiffs, patchFiles} from '../source/'

const log = bunyan.createLogger({
	name: 'tests',
	level: 'trace',
})
const clonePath = path.join(__dirname, 'broken')

Clone
	.clone('https://github.com/ferambot/broken', clonePath)
	.catch(error => {
		// Ignore that git repo might already exist
	})
	// Open repository always from path,
	// instead of using the repo instance
	// which was return from the clone operation
	// as it might not actually have been cloned
	.then(() => Repository.open(clonePath))
	.then(repo => repo.getHeadCommit()
		.then(commit => commit.getTree())
		.then(fileTree => getDiffs({
			fileTree,
			repo,
			ignore: /typoMaps\/general\.js$/
		}))
	)
	.then(changes => {
		console.assert(changes.length === 3)
		log.debug({changes})
	})
	.then(() => log.info('All tests passed ✔︎'))
	.catch(error => log.error(error))
