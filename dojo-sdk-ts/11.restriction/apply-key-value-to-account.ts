import { PrivateKey } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models, metadataGenerateKey } from "symbol-sdk/symbol";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

const permittedPrivateKey = new PrivateKey("26DAA8B623D9B5C19A0754A5FA607285E18962BDE291A5699FE9745C05B66CCC");
const permittedAccount = facade.createAccount(permittedPrivateKey);

// ---- モザイク制限 ------------------------------------------------------

const mosaicId = 0x2cae2c12d1b06429n;

const plainKey = "verified";
const restrictionKey = metadataGenerateKey(plainKey);

const descriptor1 = new descriptors.MosaicAddressRestrictionTransactionV1Descriptor(
  new models.UnresolvedMosaicId(mosaicId),
  restrictionKey,
  0xffffffffffffffffn,
  1n,
  permittedAccount.address,
);

const descriptor2 = new descriptors.MosaicAddressRestrictionTransactionV1Descriptor(
  new models.UnresolvedMosaicId(mosaicId), // 制限対象のモザイクID
  restrictionKey, // グローバルモザイク制限のキー
  0xffffffffffffffffn, // 現在の値　、初回は 0xFFFFFFFFFFFFFFFF
  1n, // 新しい値（比較タイプがEQで値が1なので許可）
  account.address, // 発行者自身にも設定しないと送受信できない
);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactions = [descriptor1, descriptor2].map((descriptor) =>
  facade.createEmbeddedTransactionFromTypedDescriptor(descriptor, account.publicKey),
);

const descriptor = new descriptors.AggregateCompleteTransactionV2Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions,
);

// ----------------------------------------------------------

const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  account.publicKey,
  100,
  2 * 3600,
  0, // 連署者数
);

// ---- Sign ------------------------------------------------------

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());

/**
 * bun define-restricted-mosaic.ts > payload.json 2> transactionHash.txt
 * curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions
 */
