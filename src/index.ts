import { Block } from './components/Block/Block';
import { Blockchain } from './components/Blockchain/Blockchain';
import { Transaction } from './components/Transaction/Transaction';
import { Wallet } from './components/Wallet/Wallet';

import { createInterface } from 'readline';
import { stdin as input, stdout as output } from 'node:process';

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
	console.log('Контракты', contractAddresses);

	if (contractAddresses.length > 0) {
		contractAddresses.forEach(address => {
			const contract = WEBSANE_COIN.getContract(address);
			console.table(contract)
		})
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
		execute: () =>
			WEBSANE_COIN.deployContract('something interesting', '2'),
	};
	yield {
		id: 4,
		descr: 'Майнинг блока аккаунтом 3',
		execute: () => WEBSANE_COIN.minePendingTransactions('3'),
	};
	return {
		id: 5,
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
			`Будет выполнен шаг ${value.id} - ${value.descr}. Выполнить? (y/n) `,
			(answer) => {
				if (answer.toLowerCase() === 'y') {
					value.execute();
					console.log(`Шаг ${value.id} выполнен.`);
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
