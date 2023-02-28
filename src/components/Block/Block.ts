import { sha256 } from '../../utils/sha256';
import { Transaction } from '../Transaction/Transaction';

interface BlockConstructor {
	data?: any;
	previousHash?: string;
	transactions?: Array<Transaction>;
}

export class Block {
	_data;
	_transactions;
	previousHash;
	timestamp;
	hash;
	nonce;

	constructor({ data, transactions }: BlockConstructor) {
		this._data = data;
		this._transactions = transactions || [];
		this.previousHash = "";
		this.hash = this.calculateHash();
		this.timestamp = new Date().toISOString();
		this.nonce = 0;
	}

	get data() {
		return this._data;
	}

	get transactions() {
		return this._transactions;
	}

	calculateHash(): string {
		return sha256(this.previousHash + this.timestamp + JSON.stringify(this.data) + JSON.stringify(this.transactions) + this.nonce);
	}

	mine(difficulty: number) {
		console.log('mining block...');

		while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
			this.nonce++;
			this.hash = this.calculateHash();
		}

		console.log('Block mined:', this.hash);
	}
}
