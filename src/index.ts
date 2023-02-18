import { Block } from './components/Block/Block';
import { Blockchain } from './components/Blockchain/Blockchain';
import { Transaction } from './components/Transaction/Transaction';

const WEBSANE_COIN = new Blockchain();

WEBSANE_COIN.addBlock(new Block({ data: { name: 'Vitaly' } }));
// WEBSANE_COIN.addBlock(new Block({ data: { city: 'Gorky' } }));

console.log('WEBSANE_COIN is valid?', WEBSANE_COIN.isChainValid());

// WEBSANE_COIN.minePendingTransactions('1');

WEBSANE_COIN.addTransaction(
	new Transaction({
		from: '1',
		to: '2',
		amount: 10,
	})
);

console.log(WEBSANE_COIN.chain);

console.log(WEBSANE_COIN.pendingTransactions);
