import { sha256 } from '../../utils/sha256';

import elliptic from 'elliptic';

const EC = elliptic.ec;
const ec = new EC('secp256k1');

type TransactionCounstructor = {
	from: string | null;
	to: string;
	amount: number;
}

export class Transaction {
	from;
	to;
	amount;
	signature: any;

	constructor({ from, to, amount }: TransactionCounstructor) {
		this.from = from;
		this.to = to;
		this.amount = amount;
		this.signature = null;
	}

	calculateHash() {
    return sha256(this.from + this.to + this.amount).toString();
  }

	signTransaction(signingKey: any) {
    if (signingKey.getPublic('hex') !== this.from) {
      throw new Error("You cannot sign transactions for other wallets!");
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

	isValid() {
    if (this.from === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.from, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}
