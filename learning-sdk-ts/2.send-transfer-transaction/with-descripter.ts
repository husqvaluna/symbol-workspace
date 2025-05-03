import { PrivateKey } from 'symbol-sdk';
import { Address, SymbolFacade, descriptors, models } from 'symbol-sdk/symbol';

const facade = new SymbolFacade('testnet');

const privateKey = new PrivateKey('CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C');
const account = facade.createAccount(privateKey)

// ----------------------------------------------------------

const descriptor = new descriptors.TransferTransactionV1Descriptor(
  new Address('TCHBDENCLKEBILBPWP3JPB2XNY64OE7PYHHE32I'),
  [
    new descriptors.UnresolvedMosaicDescriptor(
      new models.UnresolvedMosaicId(0x72C0212E67A08BCEn),
      new models.Amount(1000000n)
    )
  ]
);

// ----------------------------------------------------------

const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  account.keyPair.publicKey,
  100,
  2 * 3600
);

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);;

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());
