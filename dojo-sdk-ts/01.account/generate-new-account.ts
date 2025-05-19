import { PrivateKey } from "symbol-sdk";
import { Network, SymbolFacade } from "symbol-sdk/symbol";

// Facade for Symbol
const facade = new SymbolFacade(Network.TESTNET);

// Generate new Key
const privateKey = PrivateKey.random();
console.log(`PrivateKey: ${privateKey}`);

// Create an account instance
const account = facade.createAccount(privateKey);
console.log(`PublicKey: ${account.publicKey}`);
console.log(`Address: ${account.address}`);
