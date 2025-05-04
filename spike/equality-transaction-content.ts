import { PrivateKey } from 'symbol-sdk';
import { Address, SymbolFacade, descriptors, models, SymbolTransactionFactory } from 'symbol-sdk/symbol';
import { hexToUint8 } from './node_modules/symbol-sdk/src/utils/converter.js';

const facade = new SymbolFacade('testnet');

const privateKey = new PrivateKey('CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C');
const account = facade.createAccount(privateKey)


// ---- サーバサイドで発行 ------------------------------------------------------

const descriptor = new descriptors.TransferTransactionV1Descriptor(
  new Address('TCHBDENCLKEBILBPWP3JPB2XNY64OE7PYHHE32I'),
  [
    new descriptors.UnresolvedMosaicDescriptor(
      new models.UnresolvedMosaicId(0x72C0212E67A08BCEn),
      new models.Amount(1000000n)
    )
  ]
);

const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  account.keyPair.publicKey,
  100,
  2 * 3600
);

/**
 * クライアントへ送信する文字列形式のペイロード。
 */
const transactionPayload = transaction.serialize().toHex();
const transactionHash = facade.hashTransaction(transaction).toString();


// ---- クライアントサイドで署名------------------------------------------------------

/**
 * サーバから受け取ったぺイロードからトランザクションを復元して、署名を行う。
 */
const restoredTransaction =  SymbolTransactionFactory.deserialize(hexToUint8(transactionPayload))
const calculatedHash = facade.hashTransaction(restoredTransaction).toString();

if( transactionHash !== calculatedHash) {
  throw new Error("Hash mismatch");
}

// 署名
const signature = account.signTransaction(restoredTransaction);

/**
 * クライアントからサーバへ送信する署名済みのペイロード。
 */
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);;


// ---- サーバサイドで検証 ------------------------------------------------------

/**
 * JSON 形式のペイロードをデシリアライズして、トランザクションを復元する。
 * その復元したトランザクションが元のトランザクションと一致することを確認する。
 */
const { payload } = JSON.parse(jsonPayload);
const signedTransaction =  SymbolTransactionFactory.deserialize(hexToUint8(payload))

// console.debug({
//   original: transaction.serialize().toHex(),
//   signed: signedTransaction.serialize().toHex(),
//   eq: transaction.serialize().toHex() === signedTransaction.serialize().toHex()
// });

// サーバサイドで作成した内容と一致するのであれば、ユーザーによる承認を得たとして、
// トランザクションを発信する。

// ----------------------------------------------------------

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(signedTransaction).toString());
