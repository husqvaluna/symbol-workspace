import { PrivateKey, utils } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models } from "symbol-sdk/symbol";
import fs from "fs";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey1 = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account1 = facade.createAccount(privateKey1);

const privateKey2 = new PrivateKey("26DAA8B623D9B5C19A0754A5FA607285E18962BDE291A5699FE9745C05B66CCC");
const account2 = facade.createAccount(privateKey2);

const privateKey = PrivateKey.random();
const accountM = facade.createAccount(privateKey);
fs.writeFileSync("multisigAccount.key", privateKey.toString(), "utf8");

// ---- マルチシグの設定トランザクション ------------------------------------------------------

const descriptor1 = new descriptors.MultisigAccountModificationTransactionV1Descriptor(
  2, // minRemoval:除名のために必要な最小署名者数増分
  2, // minApproval:承認のために必要な最小署名者数増分
  [account1.address, account2.address], // 追加対象アドレスリスト
  [], // 除名対象アドレスリスト
);

// 後に残高の転送を試すために`1XYM`も転送しておく
const descriptor2 = new descriptors.TransferTransactionV1Descriptor(accountM.address, [
  new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(1000000n)),
]);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactions = [
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptor1, accountM.publicKey),
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptor2, account1.publicKey),
];
const descriptor = new descriptors.AggregateBondedTransactionV2Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions,
);
const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  account1.publicKey,
  100,
  2 * 3600,
  2,
) as models.AggregateBondedTransactionV2;

// ---- Sign ------------------------------------------------------

// facade.signTransaction(account1.keyPair, transaction);
const sign = account1.signTransaction(transaction);
// const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, sign);

// `attachSignature`の中でやっていることのうち、署名の添付だけ実施
// @ts-ignore
transaction.signature = new models.Signature(sign.bytes);

// NOTE: `account1.signTransaction(transaction)`を実施してから`transaction.signature`に追加しないと、署名が承認されない。
const coSignM = accountM.cosignTransaction(transaction, false);
transaction.cosignatures.push(coSignM);

// fs.writeFileSync("payload.json", jsonPayload, "utf8");
fs.writeFileSync(
  "payload.json",
  JSON.stringify({
    payload: utils.uint8ToHex(transaction.serialize()),
  }),
  "utf8",
);
fs.writeFileSync("transactionHash.txt", facade.hashTransaction(transaction).toString(), "utf8");

// ---- ハッシュロックTx ------------------------------------------------------

const hashLockDescriptor = new descriptors.HashLockTransactionV1Descriptor(
  new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(10000000n)),
  new models.BlockDuration(30n),
  facade.hashTransaction(transaction),
);
const hashLockTx = facade.createTransactionFromTypedDescriptor(hashLockDescriptor, account1.publicKey, 100, 60 * 60 * 2);

const hashLockSign = account1.signTransaction(hashLockTx);
const hashLockJsonPayload = facade.transactionFactory.static.attachSignature(hashLockTx, hashLockSign);

fs.writeFileSync("payload-HL.json", hashLockJsonPayload, "utf8");
fs.writeFileSync("transactionHash-HL.txt", facade.hashTransaction(hashLockTx).toString(), "utf8");

// ---- 連署 ------------------------------------------------------

const coSign2a = account2.cosignTransactionHash(facade.hashTransaction(transaction), true);
const account2CosignJsonPayload = JSON.stringify(coSign2a.toJson());
fs.writeFileSync("payload-cosign-account2.json", account2CosignJsonPayload, "utf8");

/**
 * curl -X PUT -H "Content-Type: application/json" -d @payload-hl.json https://sym-test-01.opening-line.jp:3001/transactions
 * curl "https://sym-test-01.opening-line.jp:3001/transactions/confirmed/$(cat transactionHash-HL.txt)"
 *
 * curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions/partial
 * curl "https://sym-test-01.opening-line.jp:3001/transactions/partial/$(cat transactionHash.txt)"
 *
 * curl -X PUT -H "Content-Type: application/json" -d @payload-cosign-account1.json https://sym-test-01.opening-line.jp:3001/transactions/cosignature
 * curl -X PUT -H "Content-Type: application/json" -d @payload-cosign-account2.json https://sym-test-01.opening-line.jp:3001/transactions/cosignature
 */
