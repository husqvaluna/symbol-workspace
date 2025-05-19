import { PrivateKey } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models, generateMosaicId, metadataGenerateKey } from "symbol-sdk/symbol";
import crypto from "node:crypto";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// ---- モザイクの定義 ------------------------------------------------------

// フラグ値
const flagValues =
  models.MosaicFlags.NONE.value |
  models.MosaicFlags.SUPPLY_MUTABLE.value | // 供給量変更の可否
  models.MosaicFlags.TRANSFERABLE.value | // 第三者への譲渡可否
  models.MosaicFlags.RESTRICTABLE.value | // 制限設定の可否
  models.MosaicFlags.REVOKABLE.value; // 発行者からの還収可否

// ノンス値
const randomByteValue = crypto.randomBytes(models.MosaicNonce.SIZE);
const mosaicNonce = models.MosaicNonce.deserialize(randomByteValue);

// 期間値
const blockDurationValue = 2000n;

// モザイクID値
const mosaicIdValue = generateMosaicId(account.address, Number(mosaicNonce.value));
const mosaicId = new models.MosaicId(mosaicIdValue);
const unresolvedMosaicId = new models.UnresolvedMosaicId(mosaicIdValue);

const descriptor1 = new descriptors.MosaicDefinitionTransactionV1Descriptor(
  mosaicId,
  new models.BlockDuration(blockDurationValue),
  models.MosaicNonce.deserialize(randomByteValue),
  new models.MosaicFlags(flagValues),
  0, // 可分数
);

// ---- モザイクの発行 ------------------------------------------------------

const descriptor2 = new descriptors.MosaicSupplyChangeTransactionV1Descriptor(
  unresolvedMosaicId, // モザイクID
  new models.Amount(10000n), // 発行数
  models.MosaicSupplyChangeAction.INCREASE, // 増減タイプ
);

// ---- モザイク制約の設定 ------------------------------------------------------

const plainKey = "kyc";
const restrictionKey = metadataGenerateKey(plainKey);

const descriptor3 = new descriptors.MosaicGlobalRestrictionTransactionV1Descriptor(
  unresolvedMosaicId, // モザイクID
  new models.UnresolvedMosaicId(),
  restrictionKey,
  0n,
  1n,
  models.MosaicRestrictionType.NONE,
  models.MosaicRestrictionType.EQ,
);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactions = [descriptor1, descriptor2, descriptor3].map((descriptor) =>
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
