import fs from 'fs';

import { Block } from '../Block/Block';
import { CHAIN_DATA_DIR } from '../../constants';

export class Blockchain {
	readonly chain: Array<Block>;
	private difficulty;

	constructor() {
		this.chain = this.getExistBlocks();
		this.difficulty = 5;
	}

	private getExistBlocks() {
		if (!fs.existsSync(CHAIN_DATA_DIR)) {
			return [this.createGenesisBlock()];
		} else {
			const existBlocks: Array<Block> = [];
			const chainBlocks = fs.readdirSync(CHAIN_DATA_DIR);

			if (chainBlocks) {
				chainBlocks.forEach((block) => {
					const blockData = fs.readFileSync(`${CHAIN_DATA_DIR}/${block}`, 'utf-8');
					const deserializedBlockData = JSON.parse(blockData);

					const updatedBlock = new Block({ data: deserializedBlockData.data });
					Object.setPrototypeOf(updatedBlock, Block.prototype);

					updatedBlock.previousHash = deserializedBlockData.previousHash;
					updatedBlock.timestamp = deserializedBlockData.timestamp;
					updatedBlock.hash = deserializedBlockData.hash;
					updatedBlock.nonce = deserializedBlockData.nonce;

					existBlocks.push(updatedBlock);
				});
			}

			return existBlocks;
		}
	}

	private createGenesisBlock() {
		const genesisBlock = new Block({
			data: 'Genesis block',
			previousHash: '0',
		});

		this.addFile(genesisBlock);
		return genesisBlock;
	}

	private addFile(newBlock: Block) {
		if (!fs.existsSync(CHAIN_DATA_DIR)) {
			fs.mkdirSync(CHAIN_DATA_DIR);
		}

		const serialized = JSON.stringify(newBlock);

		fs.writeFile(
			`${CHAIN_DATA_DIR}/block_${this.chain?.length || 0}_${newBlock.hash}.json`,
			serialized,
			'utf8',
			(error: any) => {
				if (error) throw error;

				this.chain.push(newBlock);
				console.log(`Block ${newBlock.hash} was added!`);
			}
		);
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(newBlock: Block) {
		newBlock.previousHash = this.getLatestBlock().hash;
		newBlock.hash = newBlock.calculateHash();
		newBlock.mine(this.difficulty); // что будет если во время майнинга уже будет добавлен кем-то новый блок и previousHash станет не действительным? Как этого избежать?
		this.addFile(newBlock);
	}

	isChainValid() {
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (
				currentBlock.hash !== currentBlock.calculateHash() ||
				currentBlock.previousHash !== previousBlock.hash
			) {
				return false;
			}
		}

		return true;
	}
}
