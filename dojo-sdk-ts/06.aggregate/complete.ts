import { PrivateKey } from "symbol-sdk";
import {
  SymbolFacade,
  Network,
  descriptors,
  models,
  generateMosaicId,
  generateNamespaceId,
  generateNamespacePath,
} from "symbol-sdk/symbol";
import crypto from "node:crypto";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// ---- 親ネームスペースの登録 ------------------------------------------------------

const rentalDays = 30; // 最小期間
const rentalBlocks = (rentalDays * 24 * 60 * 60) / 30;

const rootNamespace = "luna" + crypto.randomBytes(4).toString("hex");

const descriptor1 = new descriptors.NamespaceRegistrationTransactionV1Descriptor(
  new models.NamespaceId(generateNamespaceId(rootNamespace)),
  models.NamespaceRegistrationType.ROOT,
  new models.BlockDuration(BigInt(rentalBlocks)),
  undefined, // 親ネームスペース (ルートの場合は省略可)
  rootNamespace,
);

// ---- 子ネームスペースの登録 ------------------------------------------------------

const parentNamespaceId = generateNamespaceId(rootNamespace);
const childNamespace = crypto.randomBytes(2).toString("hex");

const descriptor2 = new descriptors.NamespaceRegistrationTransactionV1Descriptor(
  new models.NamespaceId(generateNamespaceId(childNamespace, parentNamespaceId)),
  models.NamespaceRegistrationType.CHILD,
  undefined, // レンタル期間 (子の場合は省略可)
  new models.NamespaceId(parentNamespaceId),
  childNamespace,
);

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
const blockDurationValue = 1000n;

// モザイクID値
const mosaicIdValue = generateMosaicId(account.address, Number(mosaicNonce.value));

const descriptor3 = new descriptors.MosaicDefinitionTransactionV1Descriptor(
  new models.MosaicId(mosaicIdValue),
  new models.BlockDuration(blockDurationValue),
  models.MosaicNonce.deserialize(randomByteValue),
  new models.MosaicFlags(flagValues),
  0, // 可分数
);

// ---- モザイクの発行 ------------------------------------------------------

const descriptor4 = new descriptors.MosaicSupplyChangeTransactionV1Descriptor(
  new models.UnresolvedMosaicId(mosaicIdValue), // モザイクID
  new models.Amount(10000n), // 発行数
  models.MosaicSupplyChangeAction.INCREASE, // 増減タイプ
);

// ---- 子ネームスペースの割当 ------------------------------------------------------

const namespacePaths = generateNamespacePath(`${rootNamespace}.${childNamespace}`);
const namespaceId = new models.NamespaceId(namespacePaths.at(-1));
const mosaicId = new models.MosaicId(mosaicIdValue);

const descriptor5 = new descriptors.MosaicAliasTransactionV1Descriptor(namespaceId, mosaicId, models.AliasAction.LINK);

// ---- アグリゲート ------------------------------------------------------

const embeddedTransactions = [descriptor1, descriptor2, descriptor3, descriptor4, descriptor5].map((descriptor) =>
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
