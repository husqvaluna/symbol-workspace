import { PrivateKey } from 'symbol-sdk';
import { Address, Network, SymbolFacade } from 'symbol-sdk/symbol';

const privateKey = PrivateKey.random();
console.log(`Private Key: ${privateKey.toString()}`);

const facade = new SymbolFacade(Network.TESTNET);
const keyPair = new facade.static.KeyPair(privateKey);

const account = facade.createAccount(privateKey)
console.log(`Public Key: ${account.publicKey.toString()}`);
console.log(`Address: ${account.address.toString()}`);

// -----------------------------------------------------------

const address = new Address(facade.network.publicKeyToAddress(keyPair.publicKey));
console.log(`Address: ${address.toString()}`);
