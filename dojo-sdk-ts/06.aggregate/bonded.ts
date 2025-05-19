import { PrivateKey } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models } from "symbol-sdk/symbol";
import fs from "fs";

const facade = new SymbolFacade(Network.TESTNET);

const myPrivateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const myAccount = facade.createAccount(myPrivateKey);

const yourPrivateKey = new PrivateKey("26DAA8B623D9B5C19A0754A5FA607285E18962BDE291A5699FE9745C05B66CCC");
const yourAccount = facade.createAccount(yourPrivateKey);

// ---- モザイクの交換トランザクション ------------------------------------------------------

// 便宜上、お互いに`xym`を送り合うが、他のモザイクでもよい

const descriptor1 = new descriptors.TransferTransactionV1Descriptor(
  myAccount.address,
  [new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(1000000n))],
  new TextEncoder().encode("I will give you **super mosaic**."),
);

const descriptor2 = new descriptors.TransferTransactionV1Descriptor(
  yourAccount.address,
  [new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(1000000n))],
  new TextEncoder().encode("You give **ultra mosaic** to me."),
);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactions = [
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptor1, myAccount.publicKey),
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptor2, yourAccount.publicKey),
];

const descriptor = new descriptors.AggregateBondedTransactionV2Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions,
);

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, myAccount.publicKey, 100, 2 * 3600, 1);

// ---- Sign ------------------------------------------------------

const mySign = myAccount.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, mySign);

fs.writeFileSync("payload.json", jsonPayload, "utf8");
fs.writeFileSync("transactionHash.txt", facade.hashTransaction(transaction).toString(), "utf8");

// ---- ハッシュロックTx ------------------------------------------------------

const hashLockDescriptor = new descriptors.HashLockTransactionV1Descriptor(
  new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(10000000n)),
  new models.BlockDuration(120n),
  facade.hashTransaction(transaction),
);
const hashLockTx = facade.createTransactionFromTypedDescriptor(hashLockDescriptor, myAccount.publicKey, 100, 60 * 60 * 2);

const hashLockSign = myAccount.signTransaction(hashLockTx);
const hashLockJsonPayload = facade.transactionFactory.static.attachSignature(hashLockTx, hashLockSign);

fs.writeFileSync("payload-HL.json", hashLockJsonPayload, "utf8");
fs.writeFileSync("transactionHash-HL.txt", facade.hashTransaction(hashLockTx).toString(), "utf8");

// ---- アグリゲート署名Tx ------------------------------------------------------

const yourCosign = yourAccount.cosignTransactionHash(facade.hashTransaction(transaction), true);
const yourCosignJsonPayload = JSON.stringify(yourCosign.toJson());

fs.writeFileSync("payload-cosign.json", yourCosignJsonPayload, "utf8");

/**
 * curl -X PUT -H "Content-Type: application/json" -d @payload-hl.json https://sym-test-01.opening-line.jp:3001/transactions
 * curl "https://sym-test-01.opening-line.jp:3001/transactions/$(cat transactionHash-hl.txt)"
 *
 * curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions/partial
 * curl "https://sym-test-01.opening-line.jp:3001/transactions/partial/$(cat transactionHash.txt)"
 *
 * curl -X PUT -H "Content-Type: application/json" -d @payload-cosign.json https://sym-test-01.opening-line.jp:3001/transactions/cosignature
 */
