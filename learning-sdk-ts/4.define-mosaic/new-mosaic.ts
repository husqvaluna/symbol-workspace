import { PrivateKey } from 'symbol-sdk';
import { SymbolFacade, descriptors, models, generateMosaicId } from 'symbol-sdk/symbol';
import crypto from 'node:crypto';

const facade = new SymbolFacade('testnet');

const privateKey = new PrivateKey('CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C');
const account = facade.createAccount(privateKey)

// ----------------------------------------------------------

// フラグ値
const flagValues = models.MosaicFlags.NONE.value
  | models.MosaicFlags.SUPPLY_MUTABLE.value // 供給量変更の可否
  | models.MosaicFlags.TRANSFERABLE.value   // 第三者への譲渡可否
  | models.MosaicFlags.RESTRICTABLE.value   // 制限設定の可否
  | models.MosaicFlags.REVOKABLE.value      // 発行者からの還収可否
;

// ノンス値
const randomByteValue = crypto.randomBytes(models.MosaicNonce.SIZE);
const mosaicNonce = models.MosaicNonce.deserialize(randomByteValue);

// 期間値
const blockDurationValue = 1000n;

// モザイクID値
const mosaicIdValue = generateMosaicId(account.address, Number(mosaicNonce.value));

// ディククリプタ
const descriptor = new descriptors.MosaicDefinitionTransactionV1Descriptor(
  new models.MosaicId(mosaicIdValue),
  new models.BlockDuration(blockDurationValue),
  models.MosaicNonce.deserialize(randomByteValue),
  new models.MosaicFlags(flagValues),
  0,
);

// ----------------------------------------------------------

const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  account.publicKey,
  100,
  2 * 3600
);

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);;

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
