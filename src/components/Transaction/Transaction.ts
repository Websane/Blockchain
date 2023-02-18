import { sha256 } from '../../utils/sha256';

type TransactionCounstructor = {
	from: string;
	to: string;
	amount: number;
}

export class Transaction {
	from;
	to;
	amount;
	_id;

	constructor({ from, to, amount }: TransactionCounstructor) {
		this.from = from;
		this.to = to;
		this.amount = amount;
		this._id = sha256(`${this.from}${this.to}${this.amount}${performance.now()}${Date.now()}`);
	}

	get id() {
		return this._id;
	}
}
