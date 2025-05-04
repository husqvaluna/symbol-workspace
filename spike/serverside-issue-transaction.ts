import { PrivateKey, PublicKey, Signature } from 'symbol-sdk';
import { Address, SymbolFacade, descriptors, models, SymbolTransactionFactory } from 'symbol-sdk/symbol';
import { hexToUint8 } from './node_modules/symbol-sdk/src/utils/converter.js';

const facade = new SymbolFacade('testnet');

// ---- クライアントサイドで実行 ------------------------------------------------------

const clientPrivateKey = new PrivateKey('CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C');
const clientAccount = facade.createAccount(clientPrivateKey)
const clientPublicKey = clientAccount.keyPair.publicKey

const requestBody1 = {
  publicKey: clientPublicKey.toString(),
}

// ---- サーバサイドで実行 ------------------------------------------------------

const { publicKey: publicKeyString } = requestBody1;

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
  new PublicKey(publicKeyString),
  100,
  2 * 3600
);

/**
 * クライアントへ送信する文字列形式のペイロード。
 */
const responseBody = {
  payload: transaction.serialize().toHex(),
  hash: facade.hashTransaction(transaction).toString(),
}


// ---- クライアントサイドで実行------------------------------------------------------

const { payload: transactionPayload, hash: transactionHash } = responseBody;

/**
 * サーバから受け取ったぺイロードからトランザクションを復元して、署名を行う。
 */
const restoredTransaction =  SymbolTransactionFactory.deserialize(hexToUint8(transactionPayload))
const calculatedHash = facade.hashTransaction(restoredTransaction).toString();

if( transactionHash !== calculatedHash) {
  throw new Error("Hash mismatch");
}

const signature = clientAccount.signTransaction(restoredTransaction);

// トランザクションに対する署名を返送
const requestBody = {
  signature: signature.toString(),
}

// ---- サーバサイドで実行 ------------------------------------------------------

const { signature: transactionSignature } = requestBody;

const clientSignature = new Signature(transactionSignature);


if( facade.verifyTransaction(transaction, clientSignature) === false ) {
  throw new Error("Signature mismatch");
}

/**
 * クライアントからサーバへ送信する署名済みのペイロード。
 */
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, clientSignature);

// サーバサイドで作成した内容と一致するのであれば、ユーザーによる承認を得たとして、
// トランザクションを発信する。

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
