import { PrivateKey } from "symbol-sdk";
import { Address, SymbolFacade, Network, descriptors, models } from "symbol-sdk/symbol";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// ---- Build transfer ------------------------------------------------------

const descriptor = new descriptors.TransferTransactionV1Descriptor(new Address("TARDV42KTAIZEF64EQT4NXT7K55DHWBEFIXVJQY"), [
  new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(1000000n)),
]);

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, account.publicKey, 10, 2 * 3600);

// ---- Sign ------------------------------------------------------

// こういう書き方もできる
// const signature = facade.signTransaction(account.keyPair, transaction);

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());

/**
 * bun with-descripter.ts > payload.json 2> transactionHash.txt
 */
