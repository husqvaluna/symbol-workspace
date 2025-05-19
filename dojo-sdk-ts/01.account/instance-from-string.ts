import { PrivateKey, PublicKey } from "symbol-sdk";
import { Address, Network, SymbolFacade } from "symbol-sdk/symbol";

// Facade for Symbol
const facade = new SymbolFacade(Network.TESTNET);

// Private Key: CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C
// Public Key: 1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98
// Address: TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI

// Create an instance from Private Key String
// It has private key, public key, address information
const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);
console.log(`account.address: ${account.address}`);

// Create an instance from Private Key String
// It has public key, address information
const publicKey = new PublicKey("1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98");
const publicAccount = facade.createPublicAccount(publicKey);
console.log(`publicAccount.address: ${publicAccount.address}`);

// It has address information
const address = new Address(facade.network.publicKeyToAddress(publicKey));
console.log(`address: ${address}`);
