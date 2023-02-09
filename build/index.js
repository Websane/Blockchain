import { Block } from './components/Block/Block';
import { Blockchain } from './components/Blockchain/Blockchain';
const WEBSANE_COIN = new Blockchain();
console.log('mining block 1...');
WEBSANE_COIN.addBlock(new Block({ timestamp: new Date().toISOString(), data: { name: 'Vitaly' } }));
console.log('mining block 2...');
WEBSANE_COIN.addBlock(new Block({ timestamp: new Date().toISOString(), data: { city: 'Gorky' } }));
console.log(WEBSANE_COIN.chain);
console.log('WEBSANE_COIN is valid?', WEBSANE_COIN.isChainValid());
//# sourceMappingURL=index.js.map