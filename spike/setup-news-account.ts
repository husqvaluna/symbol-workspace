import { PrivateKey } from 'symbol-sdk';
import { Address, SymbolFacade, descriptors, models, generateMosaicId, generateNamespaceId, generateNamespacePath, metadataGenerateKey, metadataUpdateValue } from 'symbol-sdk/symbol';
import { calculateCompositeHash } from './contrib';

import msgpack from 'msgpack-lite';
import zlib from 'node:zlib'
import * as cbor from 'cbor2';

const facade = new SymbolFacade('testnet');

const privateKey = new PrivateKey('CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C');
const account = facade.createAccount(privateKey)

const senderAddress = new Address('TAC4HPWPO5YKPAFXQJMJZ24I25O7PP357S6W72A');

// https://sym-test-01.opening-line.jp:3001/metadata?targetAddress=TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI&sourceAddress=TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI
// https://qiita.com/Toshi_ma/items/1ffd987c638dff07fce8#%E3%83%A1%E3%82%BF%E3%83%87%E3%83%BC%E3%82%BF%E5%89%B2%E5%BD%93%E6%9B%B4%E6%96%B0%E3%81%AE%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89
// https://github.com/TGVRock/quick_learning_symbol_v3/blob/main/07_metadata.md#v3-1
// https://testnet.symbol.fyi/accounts/TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI

// ---- アカウント情報の設定 ------------------------------------------------------

const key = metadataGenerateKey("test8");

const data = {
  $schema: "https://example.com/schema",
  uri: "https://example.com/foo/bar/baz/qux/10000/20000/30000/40000/50000",
  meta: {
    foo: 100,
    bar: 200,
    hoge: "ほげ",
    fuga: "ふが",
    piyo: "ぴよ",
  }
}

// const encoded = msgpack.encode(data);
const encoded = cbor.encode(data);
const compressed = zlib.brotliCompressSync(encoded);

const value = compressed;
const valueSize = value.length;
// console.debug(`valueSize: ${valueSize}`);

// const compositeHash = calculateCompositeHash(
//   account.address,
//   account.address,
//   key,
//   0n,
//   0 // 0: metadataType: account:1
// )
// console.debug(`compositeHash: ${compositeHash}`);

const oldValueContent = "";
const oldValue = new TextEncoder().encode(oldValueContent);
const oldValueSize = oldValue.length;

const descriptor1 = new descriptors.AccountMetadataTransactionV1Descriptor(
  account.address,
  key,
  valueSize - oldValueSize,
  metadataUpdateValue(oldValue, value)
);

// ---- 制約の設定 ------------------------------------------------------

// 制限設定
const flagValues = models.AccountRestrictionFlags.ADDRESS.value
  // | models.AccountRestrictionFlags.INCOMING
;

/**
 * Failure_RestrictionAccount_Invalid_Modification_Address
 * なんと自分自身のアドレスを指定することができない仕様だった。
 * 実質的に実現するには、自分が管理する別のアカウント使うことになる。
 */
const descriptor2 = new descriptors.AccountAddressRestrictionTransactionV1Descriptor(
  flagValues,
  [ senderAddress ],
  [ ]
);

// ---- アグリゲート ------------------------------------------------------

const aggregatedTransaction = [
  descriptor1,
  // descriptor2,
  // descriptor3,
  // descriptor4,
  // descriptor5
].map((descriptor) => (
  facade.createEmbeddedTransactionFromTypedDescriptor(
    descriptor,
    account.publicKey
  )
))

const descriptor = new descriptors.AggregateCompleteTransactionV2Descriptor(
  facade.static.hashEmbeddedTransactions(aggregatedTransaction),
  aggregatedTransaction
);

// ----------------------------------------------------------

const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  account.publicKey,
  100,
  2 * 3600,
  0 // 連署者数
);

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);;

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
