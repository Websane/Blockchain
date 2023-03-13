type SmartContractConstructor = {
	code: string;
	address: string;
	owner: string;
};

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

	getMethods() {
		const classPrototype = Object.getPrototypeOf(new (eval(`(${this.code})`))());

		const methodNames = Reflect.ownKeys(classPrototype).filter(
			(propertyName) =>
				typeof classPrototype[propertyName] === 'function' &&
				propertyName !== 'constructor'
		);

		return methodNames;
	}
}
