import { ANT, ArweaveSigner } from '@ar.io/sdk'
import { TurboFactory } from '@ardrive/turbo-sdk'
import { readFileSync } from 'fs'

import { logger } from './logger'

const DEPLOY_FOLDER = `${process.cwd()}/doc_build`
const gatewayUrl = process.env.GATEWAY || 'https://arweave.net'
const url = process.env.BUNDLER || 'https://ar.anyone.tech/bundler'
const processId = process.env.ANT_PROCESS_ID || ''
// if (!processId) {
//   throw new Error('No ANT_PROCESS_ID provided!')
// }
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not set!')
}
const JWK = JSON.parse(readFileSync(PRIVATE_KEY, 'utf-8'))
const signer = new ArweaveSigner(JWK)

let undername = 'dev'
if (process.env.PHASE === 'stage') {
  undername = 'stage'
} else if (process.env.PHASE === 'live') {
  undername = '@'
} else if (process.env.UNDERNAME) {
  undername = process.env.UNDERNAME
}

async function deploy() {
  logger.info('Deploying...')
  const turbo = TurboFactory.authenticated({
    signer,
    gatewayUrl,
    // uploadServiceConfig: { url }
  })
  // const ant = ANT.init({ processId, signer })
  const {
    // fileResponses,
    manifestResponse,
    manifest,
    errors
  } = await turbo.uploadFolder({
    folderPath: DEPLOY_FOLDER,
    dataItemOpts: {
      tags: [{ name: 'Deploy-Nonce', value: Date.now().toString() }]
    },
    manifestOptions: {
      indexFile: 'index.html',
      fallbackFile: 'index.html'
    }
  })

  if (errors && errors.length > 0) {
    logger.error(errors)
    throw new Error('Deploy failed, see errors above')
  }
  logger.info(`Manifest id ${manifestResponse?.id}`)
  logger.info('Manifest', JSON.stringify(manifest))
  // logger.info('Updating ANT undername', undername)
  // const { id: deployedTxId } = undername === '@'
  //   ? await ant.setBaseNameRecord({
  //     transactionId: manifestResponse?.id,
  //     ttlSeconds: 3600
  //   })
  //   : await ant.setUndernameRecord({
  //     undername,
  //     transactionId: manifestResponse?.id,
  //     ttlSeconds: 3600
  //   })
}

deploy()
  .then(() => logger.info('Deployed!'))
  .catch(err => { logger.error('error deploying!', err); process.exit(1); })
