# トランスファートランザクション

ブロックチェーンに何らかの操作（トランザクション）を実行・記録するには、

トランザクションオブジェクトを作り、それに対して署名を行い、署名済みトランザクションを作成します。

作成した署名済みトランザクションをAPIノードへ送信する、というのが基本的な一連の流れとなります。

ここでは最も基本の、基幹通貨である`XYM`を別のアカウントへ転送するトランザクションを実行します。


## トランザクションオブジェクトの作成

`README`に書いてある内容を参考に、転送トランザクションペイロードを作るコードを記述しました。

- [symbol/sdk/javascript at main · symbol/symbol](https://github.com/symbol/symbol/tree/main/sdk/javascript#sending-a-transaction)

秘密鍵は前回作ったものを使用し、宛先には蛇口のアドレスを指定します。

- [Symbol Block Explorer](https://testnet.symbol.fyi/accounts/TARDV42KTAIZEF64EQT4NXT7K55DHWBEFIXVJQY)

NodeJS(bun)環境でのコードを実行を試す。

[with-name.ts](./with-name.ts)


### 型堅牢なトランザクションオブジェクトの作成

文字列による指定`type: 'transfer_transaction_v1',`を排除でき、有効期限も現時点からの秒数を指定するだけでよい。

また、具体的なトランザクションごとのディスクリプタの定義と、トランザクション共通の定義の処理を分離できるコードになります。

[with-descriptor.ts](./with-descriptor.ts)

こちらのほうが型システムを利用でき、柔軟なコードを実装できるので、以後はディスクリプタを用いたコードを書くこととします。


## 署名済みトランザクションを作成

コードを実行して、ペイロードとトランザクションハッシュをファイルとして保存します。

```shell
$ bun with-descriptor.ts > payload.json 2> transactionHash.txt
$ cat payload.json
{"payload": "B0000000000000003110845134F864EA1823BACB2CF410E1E6EF6CD53F6142CC8B7400CCD8F5C763EA5D4275D512CD77B53B479B6BD7708FCE6464D5A70A9E02D5BCB1CF3583470B1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98000000000198544140420F000000000060514D9610000000988E1191A25A88142C2FB3F69787576E3DC713EFC1CE4DE90000010000000000CE8BA0672E21C07240420F0000000000"}
$ cat transactionHash.txt
98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE
```

署名済みのトランザクションをノード送信用に整形したデータが得られました。


## ネットワークへトランザクションの送信

> Finally, send the payload to the desired network using the specified node endpoint:
> Symbol: PUT /transactions

この`json`をAPIノードのエンドポイント`/transactions`へ`PUT`します。

- [sym\-test\-01\.opening\-line\.jp:3001](https://sym-test-01.opening-line.jp:3001/)

送信先ノードはこちらを使わせてもらいます。

```shell
$ curl -X PUT -H "Content-Type: application/json" -d @payload.json https://sym-test-01.opening-line.jp:3001/transactions
{"message":"packet 9 was pushed to the network via /transactions"}
```

トランザクションの受認可否結果は非同期に行われるため、このレスポンスからは判断できません。

レスポンスのメッセージはあくまでも、トランザクションを受け付けたということだけを示しています。


## トランザクションの状態を確認

エンドポイントの`/transactionStatus/{TransactionHash}`へ問い合わせて、トランザクションの状態を確認します。

```shell
$ curl "https://sym-test-01.opening-line.jp:3001/transactionStatus/$(cat transactionHash.txt)"
{"group":"unconfirmed","code":"Success","hash":"98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE","deadline":"71243353244","height":"0"}
```

トランザクションが承認されると、承認後のエンドポイントの`/transactions/confirmed/{TransactionHash}`を見るか、エクスプローラでも確認できるようになります。

```shell
$ curl "https://sym-test-01.opening-line.jp:3001/transactions/confirmed/$(cat transactionHash.txt)"
{"meta":{"height":"2100850","hash":"98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE","merkleComponentHash":"98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE","index":0,"timestamp":"71233950045","feeMultiplier":5681},"transaction":{"size":176,"signature":"3110845134F864EA1823BACB2CF410E1E6EF6CD53F6142CC8B7400CCD8F5C763EA5D4275D512CD77B53B479B6BD7708FCE6464D5A70A9E02D5BCB1CF3583470B","signerPublicKey":"1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98","version":1,"network":152,"type":16724,"maxFee":"1000000","deadline":"71241126240","recipientAddress":"988E1191A25A88142C2FB3F69787576E3DC713EFC1CE4DE9","mosaics":[{"id":"72C0212E67A08BCE","amount":"1000000"}]},"id":"679F2AC16583EA846923CA2E"}%
```

エクスプローラで確認する場合はハッシュ値で参照します。

- [98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE - Symbol Block Explorer](https://testnet.symbol.fyi/transactions/98890C54F3AAA90B71B64292D5EE6309E34F89EED6B5ED1BA289D8CEC7704EBE)

残高から`1XYM`を送信するトランザクションを実行し、ネットワークに承認されたことを確認できました。


# トランザクションの送信

トランザクションディスクリプタを構築し、トランザクションオブジェクトを作成して、それに署名を行います。

署名済みトランザクションが得られたら、それをネットワークへ送信する、というのが任意のトランザクションの送信手順です。
