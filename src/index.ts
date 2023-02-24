import { Block } from './components/Block/Block';
import { Blockchain } from './components/Blockchain/Blockchain';
import { SmartContract } from './components/SmartContract/SmartContract';
import { Transaction } from './components/Transaction/Transaction';
import { Wallet } from './components/Wallet/Wallet';

const WEBSANE_COIN = new Blockchain();

// WEBSANE_COIN.addBlock(new Block({ data: { name: 'Vitaly' } }));
// WEBSANE_COIN.addBlock(new Block({ data: { city: 'Gorky' } }));

// WEBSANE_COIN.minePendingTransactions('3');

// const myWallet = new Wallet();
// myWallet.sendTransaction({ toAddress: 'lal', amount: 50, blockchain: WEBSANE_COIN });

// WEBSANE_COIN.addTransaction(
// 	new Transaction({
// 		from: '1',
// 		to: '2',
// 		amount: 150,
// 	})
// );

// WEBSANE_COIN.addTransaction(
// 	new Transaction({
// 		from: '1',
// 		to: '2',
// 		asset:  WEBSANE_COIN.getAssetOfAddress('1'),
// 	})
// );

// console.log(WEBSANE_COIN.chain);

// console.log(WEBSANE_COIN.pendingTransactions);

console.log(1, WEBSANE_COIN.getBalanceOfAddress('1'));
console.log(2, WEBSANE_COIN.getBalanceOfAddress('2'));
console.log(3, WEBSANE_COIN.getBalanceOfAddress('3'));

console.log('asset', 1, WEBSANE_COIN.getAssetOfAddress('1'));
console.log('asset', 2, WEBSANE_COIN.getAssetOfAddress('2'));
console.log('asset', 3, WEBSANE_COIN.getAssetOfAddress('3'));

console.log('WEBSANE_COIN is valid?', WEBSANE_COIN.isChainValid());

// const contract = new SmartContract('code123', {
// 	myFunction: (a: number, b: number) => {
// 		const sum = a + b;
// 		console.log(`The sum of ${a} and ${b} is ${sum}`);
// 		return sum;
// 	},
// });
// WEBSANE_COIN.addContract(contract);

// WEBSANE_COIN.executeContract(
// 	{ contractAddress: contract.address, functionName: 'myFunction' },
// 	2,
// 	3
// );

// console.log('contracts', WEBSANE_COIN.contracts);
