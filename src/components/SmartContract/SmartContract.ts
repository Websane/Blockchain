export class SmartContract {
	code: string;
	_address: string;
	functions: Record<string, any>;
	value: any;

  constructor(code: SmartContract['code'], functions: SmartContract['functions']) {
    this.code = code;
		this._address = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.functions = functions;

  }

	get address() {
		return this._address;
	}
}
