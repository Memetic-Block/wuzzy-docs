import 'dotenv/config'
import { ANT, ArweaveSigner } from '@ar.io/sdk'
import { TurboFactory } from '@ardrive/turbo-sdk'
import { readFileSync } from 'fs'

const logger = console
const DEPLOY_FOLDER = `${process.cwd()}/doc_build`
const gatewayUrl = process.env.GATEWAY || 'https://arweave.net'
const processId = process.env.ANT_PROCESS_ID || ''
if (!processId) {
  throw new Error('No ANT_PROCESS_ID provided!')
}
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not set!')
}
const JWK = JSON.parse(readFileSync(PRIVATE_KEY, 'utf-8'))
const signer = new ArweaveSigner(JWK)

let undername = 'docs-dev'
if (process.env.PHASE === 'stage') {
  undername = 'docs-stage'
} else if (process.env.PHASE === 'live') {
  undername = 'docs'
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
  
  const {
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

  if (!manifestResponse?.id) {
    throw new Error('No manifest id returned!')
  }

  logger.info(`Manifest id ${manifestResponse?.id}`)
  logger.info('Manifest', JSON.stringify(manifest))

  logger.info('Updating ANT undername', undername)
  const ant = ANT.init({ processId, signer })
  const record = {
    transactionId: manifestResponse?.id,
    ttlSeconds: undername === 'docs' ? 1800 : 60,
    displayName: 'Wuzzy Docs',
    description: 'Wuzzy Docs is the documentation website for Wuzzy Search, a decentralized search engine application built on the Arweave and AO',
    keywords: [ 'wuzzy', 'search', 'ao', 'permaweb', 'seo', 'discover', 'docs', 'documentation', 'api' ]
  }
  const { id: deployedTxId } = await ant.setUndernameRecord({
      undername,
      ...record
    })
  logger.info(
    `ANT updated! View deploy message at `
      +`https://ao.link/#/message/${deployedTxId}`
  )
}

deploy()
  .then(() => logger.info('Deployed!'))
  .catch(err => { logger.error('error deploying!', err); process.exit(1); })
