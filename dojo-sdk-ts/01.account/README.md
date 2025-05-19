# 新規アカウントの生成

検証で使うための新たなアカウントを作成します。

アカウントには、ニーモニックによるアカウントと秘密鍵によるアカウントが存在します。

- [アカウント \- Blockchain Symbol\-SDK v3\.2 \#TypeScript \- Qiita](https://qiita.com/ccHarvestasya/items/d6b87c47aade9d744bbe)

ニーモニックによるアカウントは子孫アカウントを持つことができるが、今回はシンプルな秘密鍵によるアカウントを作成します。

[generate-new-account.ts](./generate-new-account.ts)

```shell
$ bun run generate-new-account.ts
PrivateKey: CC741E6AFE9AE8ED92B1567A17EBC4950DAEFF7EA70D8878D27E4CB91D47B20C
PublicKey: 1D0C551813FF2072B82D0E987A6AAF50EAB0D6F34CDCBA255EA804D9773E3B98
Address: TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI
```

エクスプローラで見れるようにアドレスに関するURLをメモしておきます。

- [TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI - Symbol Block Explorer](https://testnet.symbol.fyi/accounts/TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI)


## 文字列情報をオブジェクトで扱うサンプルコード

秘密鍵や公開鍵はテキストとしてやり取りされますが、プログラムコード中ではオブジェクト化して扱うことが多いです。

テキスト値を扱うサンプルコードです。

[instance-from-string.ts](./instance-from-string.ts)


# XYMの取得

テスト用のXYMを得るために蛇口に申請する。X(旧Twitter)認証が必要です。

- [The XYM Faucet](https://testnet.symbol.tools/)

> Twitter account is unqualified

このメッセージが出る場合は連携したアカウントがスパム疑いとされている模様。

ある程度使い込んだ別のアカウントで認証したら配布してくれました。

- [578BF0CF369D9079287AE93CA57AEF9C5CB40F13CE833D0D9E63635FDF93B8E3 - Symbol Block Explorer](https://testnet.symbol.fyi/transactions/578BF0CF369D9079287AE93CA57AEF9C5CB40F13CE833D0D9E63635FDF93B8E3)

これでアカウントにXYMをもたせることができました。
