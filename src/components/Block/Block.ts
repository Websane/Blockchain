import { sha256 } from '../../utils/sha256';

interface BlockConstructor {
	data: any;
	previousHash?: string;
}

export class Block {
	data;
	previousHash;
	timestamp;
	hash;
	nonce;
	getData: () => any;

	constructor({ data }: BlockConstructor) {
		this.previousHash = "";
		this.hash = this.calculateHash(); // как избежать коллизий, какая вероятность что у двух блоков высчитается одинаковый хэш?
		this.timestamp = new Date().toISOString();
		this.data = data;
		this.nonce = 0;
		this.getData = function() {
			return this.data;
		}
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
