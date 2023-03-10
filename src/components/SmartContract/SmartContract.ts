type SmartContractConstructor = {
	code: string;
	address: string;
}

export class SmartContract {
	code;
	_address;

	constructor({ code, address }: SmartContractConstructor) {
		this.code = code;
		this._address = address;
	}

	get address() {
		return this._address;
	}
}
