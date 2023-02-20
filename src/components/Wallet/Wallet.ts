import { Blockchain } from './../Blockchain/Blockchain';
import { Transaction } from '../Transaction/Transaction';

import elliptic from 'elliptic';

const EC = elliptic.ec;
const ec = new EC('secp256k1');

type WalletTransaction = {
	amount: number;
	toAddress: string;
	blockchain: Blockchain;
};

export class Wallet {
	keyPair: any;
	publicKey: string;
	privateKey: string;

	constructor() {
		this.keyPair = ec.genKeyPair();
		this.publicKey = this.keyPair.getPublic('hex');
		this.privateKey = this.keyPair.getPrivate('hex');
	}

	sendTransaction({ amount, toAddress, blockchain }: WalletTransaction, isFirst?: boolean) {
		const transaction = new Transaction({ from: this.publicKey, to: toAddress, amount });
		transaction.signTransaction(this.keyPair);
		blockchain.addTransaction(transaction);
	}

	getBalance(blockchain: Blockchain) {
		return blockchain.getBalanceOfAddress(this.publicKey);
	}
}
