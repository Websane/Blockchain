import fs from 'fs';

import { Block } from '../Block/Block';
import {
	CHAIN_DATA_DIR,
	CONTRACTS_DATA_DIR,
	INITIAL_COINS_ADDRESS,
	INITIAL_DATA_ADDRESS,
	PENDING_TRANSACTIONS_DATA_DIR,
} from '../../constants';
import { Transaction } from '../Transaction/Transaction';
import { sha256 } from '../../utils/sha256';

const FORMAT = 'utf-8';
const PENDING_TRANSACTIONS_DATA = `${PENDING_TRANSACTIONS_DATA_DIR}/pendingTransactions.json`;
const CONTRACTS_DATA = `${CONTRACTS_DATA_DIR}/contracts.json`;

export class Blockchain {
	readonly chain: Array<Block>;
	private difficulty;
	pendingTransactions: Array<Transaction>;
	#miningReward;

	constructor() {
		this.chain = [];
		this.difficulty = 5;
		this.#miningReward = 100;
		this.pendingTransactions = [];
		this.initChainFromFiles();
	}

	private initChainFromFiles() {
		if (!fs.existsSync(CHAIN_DATA_DIR)) {
			this.createGenesisBlock();
		} else {
			const chainBlocks = fs.readdirSync(CHAIN_DATA_DIR);

			if (chainBlocks) {
				chainBlocks.forEach((block) => {
					const blockData = fs.readFileSync(`${CHAIN_DATA_DIR}/${block}`, FORMAT);
					const deserializedBlock = JSON.parse(blockData);
					const deserializedTransactions = deserializedBlock._transactions.map(
						(transaction: Transaction) => {
							return new Transaction(transaction);
						}
					);

					const updatedBlock = new Block({
						data: deserializedBlock._data,
						transactions: deserializedTransactions,
					});

					updatedBlock.previousHash = deserializedBlock.previousHash;
					updatedBlock.timestamp = deserializedBlock.timestamp;
					updatedBlock.hash = deserializedBlock.hash;
					updatedBlock.nonce = deserializedBlock.nonce;

					this.chain.push(updatedBlock);
				});
			}

			if (fs.existsSync(PENDING_TRANSACTIONS_DATA_DIR)) {
				const pendingTransactionsData = fs.readFileSync(
					PENDING_TRANSACTIONS_DATA,
					FORMAT
				);

				if (pendingTransactionsData) {
					const deserializedPendingTransactions = JSON.parse(
						pendingTransactionsData
					)?.map((tz: Transaction) => {
						return new Transaction(tz);
					});

					this.pendingTransactions = deserializedPendingTransactions;
				}
			}
		}
	}

	private createGenesisBlock() {
		const genesisBlock = new Block({
			data: 'Genesis block',
			transactions: [],
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
		newBlock.mine(this.difficulty);
		this.addFile(newBlock);
	}

	minePendingTransactions(rewardAddress: string) {
		const rewardTransaction = new Transaction({
			from: null,
			to: rewardAddress,
			amount: this.#miningReward,
		});
		this.pendingTransactions.push(rewardTransaction);

		this.addBlock(new Block({ transactions: this.pendingTransactions }));
		this.#clearPandingTransactions();
	}

	#clearPandingTransactions() {
		this.pendingTransactions = [];
		this.#addPendingTransactionsFile(this.pendingTransactions);
	}

	addTransaction(transaction: Transaction) {
		if (
			!transaction.from ||
			!transaction.to ||
			(!transaction.amount && !transaction.asset)
		) {
			throw new Error(`Transaction must include from, to and asset or amount`);
		}

		if (transaction.amount && !transaction.asset) {
			this.#checkCoinsTransaction(transaction);
		}

		if (!transaction.amount && transaction.asset) {
			this.#checkAssetTransaction(transaction);
		}

		if (transaction.amount && transaction.asset) {
			this.#checkCoinsTransaction(transaction);
			this.#checkAssetTransaction(transaction);
		}

		this.pendingTransactions.push(transaction);
		this.#addPendingTransactionsFile(this.pendingTransactions);
	}

	#checkCoinsTransaction(transaction: Transaction) {
		if (!transaction.from || !transaction.to || !transaction.amount) {
			throw new Error(`Transaction must include from, to and amount`);
		}

		if (transaction.amount <= 0) {
			throw new Error('Transaction amount must be higher than 0.');
		}

		const balance = this.getBalanceOfAddress(transaction.from);

		if (balance < transaction.amount) {
			throw new Error('Not enough balance.');
		}
	}

	#checkAssetTransaction(transaction: Transaction) {
		if (!transaction.from || !transaction.to || !transaction.asset) {
			throw new Error(`Transaction must include from, to and asset`);
		}

		const assetFromAddess = this.getAssetOfAddress(transaction.from);

		if (!assetFromAddess) {
			throw new Error(`${transaction.from} has no asset`);
		}
	}

	#addPendingTransactionsFile(transactions: Array<Transaction>) {
		if (!fs.existsSync(PENDING_TRANSACTIONS_DATA_DIR)) {
			fs.mkdirSync(PENDING_TRANSACTIONS_DATA_DIR);
		}

		const serializedPendingTransactions = JSON.stringify(transactions);

		try {
			fs.writeFileSync(PENDING_TRANSACTIONS_DATA, serializedPendingTransactions, FORMAT);
		} catch {
			console.error(`Writing pending transactions error`);
		}
	}

	getBalanceOfAddress(address: string) {
		let balance = INITIAL_COINS_ADDRESS.get(address) || 0;

		for (const block of this.chain) {
			for (const transaction of block.transactions) {
				if (transaction.from === address && transaction.amount) {
					balance -= transaction.amount;
				}

				if (transaction.to === address && transaction.amount) {
					balance += transaction.amount;
				}
			}
		}

		return balance;
	}

	getAssetOfAddress(address: string) {
		let asset = INITIAL_DATA_ADDRESS.get(address) || null;

		for (const block of this.chain) {
			for (const transaction of block.transactions) {
				if (transaction.from === address && transaction.asset) {
					asset = null;
				}

				if (transaction.to === address && transaction.asset) {
					asset = transaction.asset;
				}
			}
		}

		return asset;
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

	deployContract(contractCode: string, owner: string) {
		const contractAddress = sha256(contractCode).toString();
		const contract = {
			code: contractCode,
			address: contractAddress,
		};

		const contractTransaction = new Transaction({
			from: owner,
			to: contractAddress,
			asset: contract,
		});
		this.pendingTransactions.push(contractTransaction);
	}
}
