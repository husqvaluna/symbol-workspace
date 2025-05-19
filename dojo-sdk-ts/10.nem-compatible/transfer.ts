import { PrivateKey } from "symbol-sdk";
import { Address, NemFacade, Network, descriptors, models } from "symbol-sdk/nem";

const facade = new NemFacade(Network.TESTNET);

const privateKey = new PrivateKey("CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C");
const account = facade.createAccount(privateKey);

// ---- Build transfer ------------------------------------------------------

const descriptor = new descriptors.TransferTransactionV2Descriptor(
  new Address("TCSMSAMGFNWZVWFTJ34GKIZKYQNDJOVICWIRMVQY"),
  new models.Amount(0n),
  new descriptors.MessageDescriptor(models.MessageType.PLAIN, "Good Luck!"),
  [
    new descriptors.SizePrefixedMosaicDescriptor(
      new descriptors.MosaicDescriptor(
        new descriptors.MosaicIdDescriptor(
          new descriptors.NamespaceIdDescriptor(new TextEncoder().encode("nem")),
          new TextEncoder().encode("xem"),
        ),
        new models.Amount(0n),
      ),
    ),
  ],
);

// v1
// const descriptor = new descriptors.TransferTransactionV1Descriptor(
//   new Address('TCSMSAMGFNWZVWFTJ34GKIZKYQNDJOVICWIRMVQY'),
//   new models.Amount(0n),
//   new descriptors.MessageDescriptor(models.MessageType.PLAIN, 'hello nem')
// );

const transaction = facade.createTransactionFromTypedDescriptor(descriptor, account.publicKey, 100000n, 2 * 3600);

// ---- Sign ------------------------------------------------------

// こういう書き方もできる
// const signature = facade.signTransaction(account.keyPair, transaction);

const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(transaction, signature);

// 標準出力と標準エラー出力に JSON 形式で出力。
process.stdout.write(jsonPayload);
process.stderr.write(facade.hashTransaction(transaction).toString());

/**
 * bun transfer.ts > payload.json 2> transactionHash.txt
 * curl -X POST -H "Content-Type: application/json" -d @payload.json http://ntn1.dusanjp.com:7890/transaction/announce
 * curl "http://ntn1.dusanjp.com:7890/transaction/get?hash=$(cat transactionHash.txt)"
 *
 * curl -X POST -F "data=@payload.json;type=application/json" http://ntn1.dusanjp.com:7890/transaction/announce
 * curl -X POST \
  -F "data=010100000200009848EC5F13200000007F4185D34C00BD8855413FBDB9210D38844448018449564F2E121ACA1CB58EC5A08601000000000068086013280000005443534D53414D47464E575A565746544A3334474B495A4B59514E444A4F5649435749524D565159000000000000000012000000010000000A000000476F6F64204C75636B21010000001A0000000E000000030000006E656D0300000078656D0000000000000000" \
  -F "signature=062E50B5ACFBDA66DD70FEC74EACE33B38EB7582013E8C53B4EF987BCDA4D3450A19095A24540E82F084885FCDB58FC876CA1F03B5B813C3D4E45461BC05370F" \
  http://ntn1.dusanjp.com:7890/transaction/announce
 */
