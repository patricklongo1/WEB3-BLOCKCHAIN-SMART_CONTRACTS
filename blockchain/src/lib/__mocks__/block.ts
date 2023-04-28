import Transaction from './transaction'
import Validation from '../validation'

/**
 * Mock Block Class
 */
export default class Block {
  index: number
  timestamp: number
  hash: string
  previousHash: string
  transactions: Transaction[]

  /**
   * Mock block constructor
   * @param block Mock block data
   */
  constructor(block?: Block) {
    this.index = block?.index || 0
    this.timestamp = block?.timestamp || Date.now()
    this.previousHash = block?.previousHash || ''
    this.transactions = block?.transactions || ([] as Transaction[])
    this.hash = block?.hash || this.getHash()
  }

  getHash(): string {
    return this.hash || 'fakehash'
  }

  /**
   * Check if mocked block is valid
   * @returns True if it is a valid mock block
   */
  isValid(previousHash: string, previousIndex: number): Validation {
    if (!previousHash || previousIndex < 0 || this.index < 0) {
      return new Validation(false, 'Invalid mock block.')
    }
    return new Validation()
  }
}
