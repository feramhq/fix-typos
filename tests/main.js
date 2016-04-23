import path from 'path'
import util from 'util'
import fsp from 'fs-promise'

import bunyan from 'bunyan'
import nodegit, {Repository, Clone} from 'nodegit'
import getTypoPatches from '..'

const log = bunyan.createLogger({
	name: 'tests',
	level: 'trace',
})
const clonedRepoPath = path.join(__dirname, 'broken')

const patchesPromise = Clone
	.clone('https://github.com/ferambot/broken', clonedRepoPath)
	.catch(error => {
		// Ignore that git repo might already exist
	})
	// Open repository always from path,
	// instead of using the repo instance
	// which was return from the clone operation
	// as it might not actually have been cloned
	.then(() => Repository.open(clonedRepoPath))
	.then(repo => getTypoPatches({repo}))
	.then(patches => {
		console.assert(
			patches.length === 3,
			'Expected 3 patches an not %s',
			patches.length
		)
		log.info('Created patches ✔︎')
		return patches
	})
	.catch(error => log.error(error))
