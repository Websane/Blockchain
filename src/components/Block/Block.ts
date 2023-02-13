import { sha256 } from '../../utils/sha256';

interface BlockConstructor {
	data: any;
	previousHash?: string;
}

export class Block {
	_data;
	previousHash;
	timestamp;
	hash;
	nonce;

	constructor({ data }: BlockConstructor) {
		this._data = data;
		this.previousHash = "";
		this.hash = this.calculateHash(); // как избежать коллизий, какая вероятность что у двух блоков высчитается одинаковый хэш?
		this.timestamp = new Date().toISOString();
		this.nonce = 0;
	}

	get data() {
		return this._data;
	}

	calculateHash(): string {
		return sha256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce);
	}

	mine(difficulty: number) {
		while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
			this.nonce++;
			this.hash = this.calculateHash();
		}
	}
}
