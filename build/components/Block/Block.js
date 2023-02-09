import { sha256 } from '../../utils/sha256';
export class Block {
    constructor({ timestamp, data, previousHash = '' }) {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.calculateHash(); // как избежать коллизий, какая вероятность что у двух блоков высчитается одинаковый хэш?
        this.nonce = 0;
    }
    calculateHash() {
        return sha256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce);
    }
    mine(difficulty) {
        while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}
//# sourceMappingURL=Block.js.map