import { Block } from "../Block/Block";
export class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;
    }
    createGenesisBlock() {
        const timestamp = new Date().toISOString();
        return new Block({
            timestamp,
            data: "Genesis block",
            previousHash: "0",
        });
    }
    ;
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        newBlock.mine(this.difficulty);
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
//# sourceMappingURL=Blockchain.js.map