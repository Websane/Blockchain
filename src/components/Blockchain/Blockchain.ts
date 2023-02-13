import fs from 'fs';

import { Block } from '../Block/Block';
import { CHAIN_DATA_DIR } from '../../constants';

const FORMAT = 'utf-8';

export class Blockchain {
	readonly chain: Array<Block>;
	private difficulty;

	constructor() {
		this.chain = [];
		this.difficulty = 5;
		this.checkExistBlocks();
	}

	private checkExistBlocks() {
		if (!fs.existsSync(CHAIN_DATA_DIR)) {
			this.createGenesisBlock();
		} else {
			const chainBlocks = fs.readdirSync(CHAIN_DATA_DIR);

			if (chainBlocks) {
				chainBlocks.forEach((block) => {
					const blockData = fs.readFileSync(`${CHAIN_DATA_DIR}/${block}`, FORMAT);
					const deserializedBlock = JSON.parse(blockData);

					const updatedBlock = new Block({ data: deserializedBlock._data });
					Object.setPrototypeOf(updatedBlock, Block.prototype);

					updatedBlock.previousHash = deserializedBlock.previousHash;
					updatedBlock.timestamp = deserializedBlock.timestamp;
					updatedBlock.hash = deserializedBlock.hash;
					updatedBlock.nonce = deserializedBlock.nonce;

					this.chain.push(updatedBlock);
				});
			}
		}
	}

	private createGenesisBlock() {
		const genesisBlock = new Block({
			data: 'Genesis block',
			previousHash: '0',
		});

		this.addFile(genesisBlock);
	}

	private addFile(newBlock: Block) {
		if (!fs.existsSync(CHAIN_DATA_DIR)) {
			fs.mkdirSync(CHAIN_DATA_DIR);
		}

		const serializedBlock = JSON.stringify(newBlock);

		try {
			fs.writeFileSync(
				`${CHAIN_DATA_DIR}/block_${this.chain?.length || 0}_${newBlock.hash}.json`,
				serializedBlock,
				FORMAT
			);

			this.chain.push(newBlock);
			console.log(`Block ${newBlock.hash} was added!`);
		} catch {
			console.error(`Block adding error`);
		}
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
