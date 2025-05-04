import { PrivateKey } from 'symbol-sdk';
import { Address, SymbolFacade, descriptors, models } from 'symbol-sdk/symbol';

import zlib from 'node:zlib'
import * as cbor from 'cbor2';

const facade = new SymbolFacade('testnet');

const privateKey = new PrivateKey('CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C');
const account = facade.createAccount(privateKey)

// ----------------------------------------------------------

const plainData = {
  "userIdentifierLongKeyABC123456789": "f31c9a2d-1234-4f57-98ef-02fbdc3a1d00",
  "sessionTokenXYZ7890123456789": "A1B2C3D4E5F60718293A4B5C6D7E8F90",
  "timestampISO8601Long": "2025-05-06T14:32:45.123Z",
  "locationCoordinatesVerbose": {
    "latitudePreciseString": "48.85884430000000000000000000000000",
    "longitudePreciseString": "2.29435060000000000000000000000000",
    "altitudeDetailedMeters": "35.123456789012345678901234567890"
  },
  "preferencesAndSettings": {
    "themeSettingVersionControlledAndDescriptive": "a9c38e1f-d1cf-47fa-b20c-674b2fc2fa10",
    "notificationFlagForMarketingEmailsDetailed": "false",
    "notificationFlagForAppUpdatesDescriptive": "true",
    "userSelectedLanguagePreferenceWithFullLocale": "en-US"
  },
  "nestedDataStructureWithLowRedundancy": {
    "entry0001": {
      "data": "fc273e91e921412c96a743dfb6a514d7"
    },
    "entry0002": {
      "data": "1f92ab3e0e9d4dbb90fc4eefa7f81035"
    },
    "entry0003": {
      "data": "a48f88fe2a5dc47b8af2d0ab64c5dbff"
    },
    "entry0004": {
      "data": "3d2c1c9f7e334b9bb2924424ee64a2a3"
    },
    "entry0005": {
      "data": "95df30a8f4e245469bccb1de789e1e14"
    },
    "entry0006": {
      "data": "4d69d746b3d041d4a9835cc0e0ff6b1a"
    },
    "entry0007": {
      "data": "0d9d394e91d14b8eb17adf4fdb12c0d1"
    },
    "entry0008": {
      "data": "ba7e4c8f37a54c88b65c28550e2946cb"
    },
    "entry0009": {
      "data": "e4e1a2120b9f4b35b5e5702b870e217f"
    },
    "entry0010": {
      "data": "dab8f0a189d14970987c58f1242cb40f"
    }
  }
}
const plainMessage = JSON.stringify(plainData);
//console.debug(plainMessage.length);

const encoded = cbor.encode(plainData);
const compressedMessage = zlib.brotliCompressSync(encoded);
// console.debug(compressedData.length);

const descriptor = new descriptors.TransferTransactionV1Descriptor(
  new Address('TCHBDENCLKEBILBPWP3JPB2XNY64OE7PYHHE32I'),
  // account.address,
  [
    new descriptors.UnresolvedMosaicDescriptor(
      new models.UnresolvedMosaicId(0x72C0212E67A08BCEn),
      new models.Amount(1000000n)
    )
  ],
  compressedMessage,
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
