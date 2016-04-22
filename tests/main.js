import path from 'path'
import util from 'util'
import fsp from 'fs-promise'

import bunyan from 'bunyan'
import nodegit, {Repository, Clone} from 'nodegit'
import {getDiffs, patchRepo} from '../source/'

const log = bunyan.createLogger({
	name: 'tests',
	level: 'trace',
})
const clonedRepoPath = path.join(__dirname, 'broken')

const changesPromise = Clone
	.clone('https://github.com/ferambot/broken', clonedRepoPath)
	.catch(error => {
		// Ignore that git repo might already exist
	})
	// Open repository always from path,
	// instead of using the repo instance
	// which was return from the clone operation
	// as it might not actually have been cloned
	.then(() => Repository.open(clonedRepoPath))
	.then(repo => getDiffs({repo}))
	.then(changes => {
		console.assert(
			changes.length === 3,
			'Expected 3 changes an not %s',
			changes.length
		)
		log.info('Created changes ✔︎')
		return changes
	})
	.catch(error => log.error(error))


changesPromise
	.then(changes => Repository
		.open(clonedRepoPath)
		.then(repo => patchRepo({
			repo,
			changes,
		}))
	)
	.then(() => {
		log.info('Patched repo ✔︎')
		log.info('All tests passed ✔︎')
	})
	.catch(error => log.error(error))
