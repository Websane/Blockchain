type SmartContractConstructor = {
	code: string;
	address: string;
	owner: string;
}

export class SmartContract {
	code;
	_address;
	_owner;

	constructor({ code, address, owner }: SmartContractConstructor) {
		this.code = code;
		this._address = address;
		this._owner = owner;
	}

	get address() {
		return this._address;
	}

	get owner() {
		return this._owner;
	}
}
