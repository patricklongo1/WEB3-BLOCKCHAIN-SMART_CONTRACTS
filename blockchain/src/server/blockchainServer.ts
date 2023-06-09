import dotenv from 'dotenv'

import express, { Request, Response, NextFunction } from 'express'
import morgan from 'morgan'
import Blockchain from '../lib/blockchain'
import Block from '../lib/block'
import Transaction from '../lib/transaction'
import Wallet from '../lib/wallet'
import TransactionOutput from '../lib/transactionOutput'
dotenv.config()

/* c8 ignore next */
const PORT: number = parseInt(`${process.env.BLOCKCHAIN_PORT || 3333}`)

const app = express()

/* c8 ignore next */
if (process.argv.includes('--run')) app.use(morgan('tiny'))

app.use(express.json())

const wallet = new Wallet(process.env.BLOCKCHAIN_WALLET)

const blockchain = new Blockchain(wallet.publicKey)

app.get('/status', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    mempool: blockchain.mempool.length,
    blocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  })
})

app.get('/blocks/next', (req: Request, res: Response, next: NextFunction) => {
  res.json(blockchain.getNextBlock())
})

app.get(
  '/blocks/:indexOrHash',
  (req: Request, res: Response, next: NextFunction) => {
    let block
    if (/^[0-9]+$/.test(req.params.indexOrHash)) {
      block = blockchain.blocks[parseInt(req.params.indexOrHash)]
    } else {
      block = blockchain.getBlockByHash(req.params.indexOrHash)
    }

    if (!block) {
      return res.status(404).json({ message: 'Invalid hash or index' })
    } else {
      return res.json(block)
    }
  },
)

app.get(
  '/transactions/:hash?',
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.hash) {
      return res.json(blockchain.getTransaction(req.params.hash))
    }

    return res.json({
      next: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
      total: blockchain.mempool.length,
    })
  },
)

app.post('/blocks', (req: Request, res: Response, next: NextFunction) => {
  if (req.body.previousHash === undefined) {
    return res.sendStatus(422)
  }

  const block = new Block(req.body as Block)
  const validation = blockchain.addBlock(block)

  if (validation.success) {
    return res.status(201).json(block)
  } else {
    return res.status(400).json(validation)
  }
})

app.post('/transactions', (req: Request, res: Response, next: NextFunction) => {
  if (req.body.hash === undefined) {
    return res.sendStatus(422)
  }

  const tx = new Transaction(req.body as Transaction)
  const validation = blockchain.addTransaction(tx)

  if (validation.success) {
    return res.status(201).json(tx)
  } else {
    return res.status(400).json(validation)
  }
})

app.get(
  '/wallets/:wallet',
  (req: Request, res: Response, next: NextFunction) => {
    const wallet = req.params.wallet

    if (wallet.length < 66) {
      return res.status(400).json({ errorMessage: 'Invalid wallet' })
    }

    const utxo = blockchain.getUtxo(wallet)
    const balance = blockchain.getBalance(wallet)
    const fee = blockchain.getFeePerTx()

    return res.json({
      balance,
      fee,
      utxo,
    })
  },
)

/* c8 ignore start */
if (process.argv.includes('--run'))
  app.listen(PORT, () => {
    console.log(
      `Blockchain server is runing at: ${PORT}.\nWallet private: ${wallet.privateKey}\nWallet public: ${wallet.publicKey}`,
    )
  })
/* c8 ignore end */

export { app }
