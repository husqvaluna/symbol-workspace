import { PrivateKey } from 'symbol-sdk';
import { SymbolFacade } from 'symbol-sdk/symbol';

const facade = new SymbolFacade('testnet');

const privateKey = new PrivateKey('CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C');
const account = facade.createAccount(privateKey)

// ----------------------------------------------------------

const transaction = facade.transactionFactory.create({
	type: 'transfer_transaction_v1',
	signerPublicKey: account.publicKey,
	fee: 1000000n, // 絶対数指定なので 1.000000 XYM の意味
	deadline: facade.network.fromDatetime(new Date()).addHours(2).timestamp, // 有効期限を現在時刻から 2 時間後に設定
	recipientAddress: 'TCHBDENCLKEBILBPWP3JPB2XNY64OE7PYHHE32I',
	mosaics: [
		{ mosaicId: 0x72C0212E67A08BCEn, amount: 1000000n }
	]
});

// ----------------------------------------------------------

// こういう書き方もできる
// const signature = facade.signTransaction(account.keyPair, transaction);
const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);;

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
