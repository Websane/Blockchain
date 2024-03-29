import { Block } from './components/Block/Block';
import { Blockchain } from './components/Blockchain/Blockchain';
import { Transaction } from './components/Transaction/Transaction';
import { Wallet } from './components/Wallet/Wallet';

import { createInterface } from 'readline';
import { stdin as input, stdout as output } from 'node:process';
import { TodoListContract } from './utils/todoListContract';

const rl = createInterface({ input, output });

const WEBSANE_COIN = new Blockchain();

const getBlockchainInfo = () => {
	console.log('Баланс адреса 1', WEBSANE_COIN.getBalanceOfAddress('1'));
	console.log('Баланс адреса 2', WEBSANE_COIN.getBalanceOfAddress('2'));
	console.log('Баланс адреса 3', WEBSANE_COIN.getBalanceOfAddress('3'));

	console.log('Данные адреса 1', WEBSANE_COIN.getAssetOfAddress('1'));
	console.log('Данные адреса 2', WEBSANE_COIN.getAssetOfAddress('2'));
	console.log('Данные адреса 3', WEBSANE_COIN.getAssetOfAddress('3'));

	const contractAddresses = WEBSANE_COIN.contractAddresses;
	console.log('Загруженные контракты:', contractAddresses);

	if (contractAddresses.length > 0) {
		contractAddresses.forEach((address) => {
			const contract = WEBSANE_COIN.getContract(address);
			console.log(`Контракт ${address}:`, contract);
			console.log(`Методы контракта ${address}:`);
			console.table(contract?.getMethods());
		});
	}

	console.log('Блокчейн WEBSANE_COIN валиден?', WEBSANE_COIN.isChainValid());

	console.log('Блокчейн', WEBSANE_COIN.chain);
	console.log('Очередь транзакций', WEBSANE_COIN.pendingTransactions);
};

function* generateExample() {
	yield {
		id: 1,
		descr: 'Создание транзакции в 150 монет с аккаунта 1 на аккаунт 2',
		execute: () =>
			WEBSANE_COIN.addTransaction(
				new Transaction({
					from: '1',
					to: '2',
					amount: 150,
				})
			),
	};
	yield {
		id: 2,
		descr: 'Создание транзакции c данными с аккаунта 1 на аккаунт 2',
		execute: () =>
			WEBSANE_COIN.addTransaction(
				new Transaction({
					from: '1',
					to: '2',
					asset: WEBSANE_COIN.getAssetOfAddress('1'),
				})
			),
	};
	yield {
		id: 3,
		descr: 'Деплой контракта аккаунтом 2',
		execute: () => WEBSANE_COIN.deployContract(TodoListContract.toString(), '2'),
	};
	yield {
		id: 4,
		descr: 'Майнинг блока аккаунтом 3',
		execute: () => WEBSANE_COIN.minePendingTransactions('3'),
	};
	yield {
		id: 5,
		descr: 'Вызов метода контракта аккаунтом 1 (добавление таски в контракт тасок)',
		execute: () =>
			WEBSANE_COIN.callContractMethod(
				{
					contractAddress: WEBSANE_COIN.contractAddresses[0],
					methodName: 'addTask',
					initiator: '1',
				},
				'Купи хлебушка'
			),
	};
	yield {
		id: 6,
		descr: 'Майнинг блока аккаунтом 3',
		execute: () => WEBSANE_COIN.minePendingTransactions('3'),
	};
	yield {
		id: 7,
		descr: 'Вызов метода контракта аккаунтом 2 (проверка существующих в контракте тасок)',
		execute: () => {
			const result = WEBSANE_COIN.callContractMethod({
				contractAddress: WEBSANE_COIN.contractAddresses[0],
				methodName: 'getTasks',
				initiator: '2',
			});
			console.log('Существующие в контракте задания:', result);
		},
	};
	yield {
		id: 8,
		descr: 'Майнинг блока аккаунтом 3',
		execute: () => WEBSANE_COIN.minePendingTransactions('3'),
	};
	return {
		id: 9,
		descr: 'Логирование',
		execute: () => 'Все шаги выполнены',
	};
}

const rlDone = () => {
	console.log('done');
	rl.close();
};

function runGenerator() {
	const generator = generateExample();

	function ask() {
		const { done, value } = generator.next();

		if (done) {
			value.execute();
			rlDone();
			return;
		}

		rl.question(
			`\x1b[35mБудет выполнен шаг ${value.id} - ${value.descr}. Выполнить? (y/n)\x1b[0m `,
			(answer) => {
				if (answer.toLowerCase() === 'y') {
					value.execute();
					console.log(`\x1b[32mШаг ${value.id} выполнен.\x1b[0m`);
					getBlockchainInfo();
					ask();
				} else {
					rlDone();
				}
			}
		);
	}

	ask();
}

runGenerator();

// WEBSANE_COIN.addBlock(new Block({ data: { name: 'Vitaly' } }));
// WEBSANE_COIN.addBlock(new Block({ data: { city: 'Gorky' } }));

// const myWallet = new Wallet();
// myWallet.sendTransaction({ toAddress: 'lal', amount: 50, blockchain: WEBSANE_COIN });
