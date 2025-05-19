import { PrivateKey, utils } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models } from "symbol-sdk/symbol";
import fs from "fs";

const facade = new SymbolFacade(Network.TESTNET);

// initiator
// TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI
const privateKey1 = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account1 = facade.createAccount(privateKey1);

// cosigner
// TAC4HPWPO5YKPAFXQJMJZ24I25O7PP357S6W72A
const privateKey2 = new PrivateKey("26DAA8B623D9B5C19A0754A5FA607285E18962BDE291A5699FE9745C05B66CCC");
const account2 = facade.createAccount(privateKey2);

// emitter
// TC3KOVNHIL3UK5EVA23ZZPRDCRTPX4SHBHR5AWY
// NOTE: 便宜上秘密鍵からアカウントオブジェクトを作るが、必要なのは`publicKey`だけである
const privateKeyM = new PrivateKey(fs.readFileSync("multisigAccount.key", { encoding: "utf8" }));
const accountM = facade.createAccount(privateKeyM);

// ---- マルチシグの設定トランザクション ------------------------------------------------------

const descriptor1 = new descriptors.TransferTransactionV1Descriptor(account1.address, [
  new descriptors.UnresolvedMosaicDescriptor(new models.UnresolvedMosaicId(0x72c0212e67a08bcen), new models.Amount(400000n)),
]);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactions = [facade.createEmbeddedTransactionFromTypedDescriptor(descriptor1, accountM.publicKey)];
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
// `attachSignature`の中でやっていること再現
// @ts-ignore
transaction.signature = new models.Signature(sign.bytes);

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

// ---- アグリゲート署名Tx ------------------------------------------------------

const coSign1 = account1.cosignTransactionHash(facade.hashTransaction(transaction), true);
const account1CosignJsonPayload = JSON.stringify(coSign1.toJson());
fs.writeFileSync("payload-cosign-account1.json", account1CosignJsonPayload, "utf8");

const coSign2 = account2.cosignTransactionHash(facade.hashTransaction(transaction), true);
const account2CosignJsonPayload = JSON.stringify(coSign2.toJson());
fs.writeFileSync("payload-cosign-account2.json", account2CosignJsonPayload, "utf8");

/**
 * curl -X PUT -H "Content-Type: application/json" -d @payload-HL.json https://sym-test-01.opening-line.jp:3001/transactions
 * curl "https://sym-test-01.opening-line.jp:3001/transactions/$(cat transactionHash-HL.txt)"
 *
 * curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions/partial
 * curl "https://sym-test-01.opening-line.jp:3001/transactions/partial/$(cat transactionHash.txt)"
 *
 * curl -X PUT -H "Content-Type: application/json" -d @payload-cosign.json https://sym-test-01.opening-line.jp:3001/transactions/cosignature
 */
