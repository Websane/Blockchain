import { sha256 } from '../../utils/sha256';

import elliptic from 'elliptic';
import { SmartContract } from '../SmartContract/SmartContract';

const EC = elliptic.ec;
const ec = new EC('secp256k1');

export type TransactionCounstructor = {
	from: string | null;
	to: string | null;
	amount?: number;
	asset?: any; // что угодно
	contract?: SmartContract;
	contractWork?: {
		method: string;
		args: any;
		result: any;
	};
};

export class Transaction {
	from;
	to;
	amount;
	asset;
	contract;
	contractWork;
	signature: string | null;

	constructor({
		from,
		to,
		amount,
		asset,
		contract,
		contractWork,
	}: TransactionCounstructor) {
		this.from = from;
		this.to = to;
		this.amount = amount || 0;
		this.asset = asset || null;
		this.contract = contract || null;
		this.contractWork = contractWork
			? { ...contractWork, date: new Date().toISOString() }
			: null;
		this.signature = null;
	}

	calculateHash() {
		return sha256(
			String(this.from) +
				String(this.to) +
				this.amount +
				this.asset +
				this.contract +
				this.contractWork
		).toString();
	}

	isValid() {
		if (this.from === null) return true;

		if (!this.signature || this.signature.length === 0) {
			throw new Error('No signature in this transaction');
		}

		const publicKey = ec.keyFromPublic(this.from, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
	}

	signTransaction(signingKey: any) {
		if (signingKey.getPublic('hex') !== this.from) {
			throw new Error('You cannot sign transactions for other wallets!');
		}

		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx, 'base64');
		this.signature = sig.toDER('hex');
	}
}
