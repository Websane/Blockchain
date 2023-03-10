import fs from 'fs';

import { Block } from '../Block/Block';
import { Transaction, TransactionCounstructor } from '../Transaction/Transaction';
import { SmartContract } from '../SmartContract/SmartContract';

import {
	CHAIN_DATA_DIR,
	INITIAL_COINS_ADDRESS,
	INITIAL_DATA_ADDRESS,
	PENDING_TRANSACTIONS_DATA_DIR,
	CONTRACT_ADDRESSES_DATA_DIR,
} from '../../constants';
import { sha256 } from '../../utils/sha256';

const FORMAT = 'utf-8';
const PENDING_TRANSACTIONS_DATA = `${PENDING_TRANSACTIONS_DATA_DIR}/pendingTransactions.json`;
const CONTRACT_ADDRESSES_DATA = `${CONTRACT_ADDRESSES_DATA_DIR}/contractAddresses.json`;

export class Blockchain {
	readonly chain: Array<Block>;
	private difficulty;
	pendingTransactions: Array<Transaction>;
	contractAddresses: Array<string>;
	#miningReward;

	constructor() {
		this.chain = [];
		this.difficulty = 5;
		this.#miningReward = 100;
		this.pendingTransactions = [];
		this.contractAddresses = [];
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
						(transaction: TransactionCounstructor) => {
							if (transaction.contract) {
								transaction.contract = new SmartContract({
									code: transaction.contract.code,
									address: transaction.contract._address,
									owner: transaction.contract._owner,
								});
							}
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
					)?.map((tz: TransactionCounstructor) => {
						return new Transaction(tz);
					});

					this.pendingTransactions = deserializedPendingTransactions;
				}
			}

			if (fs.existsSync(CONTRACT_ADDRESSES_DATA_DIR)) {
				const contractsData = fs.readFileSync(CONTRACT_ADDRESSES_DATA, FORMAT);

				if (contractsData) {
					const deserializedContractAddresses = JSON.parse(contractsData);

					this.contractAddresses = deserializedContractAddresses;
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

		this.pendingTransactions.forEach((transaction) => {
			if (transaction.contract) {
				this.contractAddresses.push(transaction.contract.address);
				this.#addContractAddressesFile(this.contractAddresses);
			}
		});

		this.addBlock(new Block({ transactions: this.pendingTransactions }));
		this.#clearPandingTransactions();
	}

	#clearPandingTransactions() {
		this.pendingTransactions = [];
		this.#addPendingTransactionsFile(this.pendingTransactions);
	}

	addTransaction(transaction: Transaction) {
		if (transaction.contract) {
			throw new Error(`You must use method "depoloyContract"`);
		}

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

	#addContractAddressesFile(contractAddresses: Array<string>) {
		if (!fs.existsSync(CONTRACT_ADDRESSES_DATA_DIR)) {
			fs.mkdirSync(CONTRACT_ADDRESSES_DATA_DIR);
		}

		const serializedContractData = JSON.stringify(contractAddresses);

		try {
			fs.writeFileSync(CONTRACT_ADDRESSES_DATA, serializedContractData, FORMAT);
		} catch {
			console.error(`Writing contract addresses error`);
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
		const isAddressExist = Boolean(this.getContract(contractAddress));

		if (isAddressExist) {
			throw new Error(`Contract ${contractAddress} has already existed`);
		}

		const contract = new SmartContract({
			code: contractCode,
			address: contractAddress,
			owner,
		});

		const contractTransaction = new Transaction({
			from: owner,
			to: contractAddress,
			contract: contract,
		});
		this.pendingTransactions.push(contractTransaction);

		console.log(`Contract ${contractAddress} was created`);
	}

	getContract(address: string) {
		const contractAddress = this.contractAddresses.find(
			(existingAddress) => existingAddress === address
		);

		if (!contractAddress) {
			console.error(`Contract ${address} not found`);
			return null;
		}

		for (const block of this.chain) {
			for (const transaction of block.transactions) {
				if (transaction.contract?.address === address) {
					return transaction.contract;
				}
			}
		}
	}
}

// callContractMethod(contractAddress: string, methodName: string, ...args: any[]): any {
//   // Получаем контракт по его адресу
//   const contract = this.getContract(contractAddress);

//   // Проверяем, что контракт найден
//   if (!contract) {
//     throw new Error(`Contract ${contractAddress} not found`);
//   }

//   // Проверяем, что контракт имеет метод с указанным именем
//   if (!(methodName in contract)) {
//     throw new Error(`Method ${methodName} not found in contract`);
//   }

//   // Вызываем метод контракта с переданными параметрами
//   return contract[methodName](...args);
// }
