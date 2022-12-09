import sha256 from 'crypto-js/sha256';

export class Block {
    previousHash: string;
    timestamp: string;
    data: any;
    hash: any;

    constructor(timestamp, data, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return sha256(this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}