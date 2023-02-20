import { Block } from './components/Block/Block';
import { Blockchain } from './components/Blockchain/Blockchain';
import { Transaction } from './components/Transaction/Transaction';
import { Wallet } from './components/Wallet/Wallet';

const WEBSANE_COIN = new Blockchain();

// WEBSANE_COIN.addBlock(new Block({ data: { name: 'Vitaly' } }));
// WEBSANE_COIN.addBlock(new Block({ data: { city: 'Gorky' } }));

// WEBSANE_COIN.minePendingTransactions('3');

// const myWallet = new Wallet();
// myWallet.sendTransaction({ toAddress: 'lal', amount: 50, blockchain: WEBSANE_COIN }, true);

// WEBSANE_COIN.addTransaction(
// 	new Transaction({
// 		from: '1',
// 		to: '2',
// 		amount: 150,
// 	})
// );

// console.log(WEBSANE_COIN.chain);

// console.log(WEBSANE_COIN.pendingTransactions);

console.log(1, WEBSANE_COIN.getBalanceOfAddress('1'));
console.log(2, WEBSANE_COIN.getBalanceOfAddress('2'));
console.log(3, WEBSANE_COIN.getBalanceOfAddress('3'));

console.log('WEBSANE_COIN is valid?', WEBSANE_COIN.isChainValid());
