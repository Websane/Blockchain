import { Block } from "../Block/Block";

export class Blockchain {
  readonly chain: Array<Block>;
	private difficulty;

  constructor() {
    this.chain = [this.createGenesisBlock()];
		this.difficulty = 5;
  }

  private createGenesisBlock() {
    return new Block({
      data: "Genesis block",
      previousHash: "0",
    });
  };

  private getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock: Block) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
		newBlock.mine(this.difficulty); // что будет если во время майнинга уже будет добавлен кем-то новый блок и previousHash станет не действительным? Как этого избежать?
    this.chain.push(newBlock);
  }

	isChainValid() {
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (currentBlock.hash !== currentBlock.calculateHash() || currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}

		return true;
	}
}
