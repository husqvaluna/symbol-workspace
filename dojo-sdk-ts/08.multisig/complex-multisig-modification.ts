import { PrivateKey, utils } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models } from "symbol-sdk/symbol";
import fs from "fs";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey1 = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const accountS = facade.createAccount(privateKey1);

// --------

const privateKeyL0M = PrivateKey.random();
const accountL0M = facade.createAccount(privateKeyL0M);
fs.writeFileSync("accountL0M.key", privateKeyL0M.toString(), "utf8");

// --------

const privateKeyL1M1 = PrivateKey.random();
const accountL1M1 = facade.createAccount(privateKeyL1M1);
fs.writeFileSync("accountL1M1.key", privateKeyL1M1.toString(), "utf8");

const privateKeyL1M2 = PrivateKey.random();
const accountL1M2 = facade.createAccount(privateKeyL1M2);
fs.writeFileSync("accountL1M2.key", privateKeyL1M2.toString(), "utf8");

const privateKeyL1C1 = PrivateKey.random();
const accountL1C1 = facade.createAccount(privateKeyL1C1);
fs.writeFileSync("accountL1C1.key", privateKeyL1C1.toString(), "utf8");

// --------

const privateKeyL2M1 = PrivateKey.random();
const accountL2M1 = facade.createAccount(privateKeyL2M1);
fs.writeFileSync("accountL2M1.key", privateKeyL2M1.toString(), "utf8");

const privateKeyL2C1 = PrivateKey.random();
const accountL2C1 = facade.createAccount(privateKeyL2C1);
fs.writeFileSync("accountL2C1.key", privateKeyL2C1.toString(), "utf8");

const privateKeyL2C2 = PrivateKey.random();
const accountL2C2 = facade.createAccount(privateKeyL2C2);
fs.writeFileSync("accountL2C2.key", privateKeyL2C2.toString(), "utf8");

// --------

const privateKeyL2C3 = PrivateKey.random();
const accountL2C3 = facade.createAccount(privateKeyL2C3);
fs.writeFileSync("accountL2C3.key", privateKeyL2C3.toString(), "utf8");

const privateKeyL2C4 = PrivateKey.random();
const accountL2C4 = facade.createAccount(privateKeyL2C4);
fs.writeFileSync("accountL2C4.key", privateKeyL2C4.toString(), "utf8");

// --------

const privateKeyL3C1 = PrivateKey.random();
const accountL3C1 = facade.createAccount(privateKeyL3C1);
fs.writeFileSync("accountL3C1.key", privateKeyL3C1.toString(), "utf8");

// ---- マルチシグの設定トランザクション ------------------------------------------------------

const descriptorL0M = new descriptors.MultisigAccountModificationTransactionV1Descriptor(
  1,
  2,
  [accountL1M1.address, accountL1M2.address, accountL1C1.address],
  [],
);

const descriptorL1M1 = new descriptors.MultisigAccountModificationTransactionV1Descriptor(
  1,
  2,
  [accountL2M1.address, accountL2C1.address, accountL2C2.address],
  [],
);

const descriptorL1M2 = new descriptors.MultisigAccountModificationTransactionV1Descriptor(
  1,
  2,
  [accountL2C3.address, accountL2C4.address],
  [],
);

const descriptorL2M1 = new descriptors.MultisigAccountModificationTransactionV1Descriptor(1, 1, [accountL3C1.address], []);

const descriptor0 = new descriptors.TransferTransactionV1Descriptor(accountL0M.address, []);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactionss = [
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptorL0M, accountL0M.publicKey),
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptorL1M1, accountL1M1.publicKey),
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptorL1M2, accountL1M2.publicKey),
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptorL2M1, accountL2M1.publicKey),
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptor0, accountS.publicKey),
];
const descriptor = new descriptors.AggregateCompleteTransactionV2Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactionss),
  embeddedTransactionss,
);
const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  accountS.publicKey,
  100,
  2 * 3600,
  0,
) as models.AggregateCompleteTransactionV2;

// ---- Sign ------------------------------------------------------

// facade.signTransaction(account1.keyPair, transaction);
const sign = accountS.signTransaction(transaction);
// const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, sign);

// `attachSignature`の中でやっていることのうち、署名の添付だけ実施
// @ts-ignore
transaction.signature = new models.Signature(sign.bytes);

// NOTE: `accountS.signTransaction(transaction)`を実施してから`transaction.signature`に追加しないと、署名が承認されない。
transaction.cosignatures = [
  accountL0M.cosignTransaction(transaction, false),
  accountL1M1.cosignTransaction(transaction, false),
  accountL1M2.cosignTransaction(transaction, false),
  accountL1C1.cosignTransaction(transaction, false),
  accountL2M1.cosignTransaction(transaction, false),
  accountL2C1.cosignTransaction(transaction, false),
  accountL2C2.cosignTransaction(transaction, false),
  accountL2C3.cosignTransaction(transaction, false),
  accountL2C4.cosignTransaction(transaction, false),
  accountL3C1.cosignTransaction(transaction, false),
];

// fs.writeFileSync("payload.json", jsonPayload, "utf8");
fs.writeFileSync(
  "payload.json",
  JSON.stringify({
    payload: utils.uint8ToHex(transaction.serialize()),
  }),
  "utf8",
);
fs.writeFileSync("transactionHash.txt", facade.hashTransaction(transaction).toString(), "utf8");

/**
 * curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions
 * curl "https://sym-test-01.opening-line.jp:3001/transactions/$(cat transactionHash.txt)"
 */
