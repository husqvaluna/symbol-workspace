# ネームスペース定義

ネームスペースの定義を行います。

ネームスペースはアカウントやモザイクのエイリアスとして使うことができるが、ここでは省略します。

詳細は後述するアグリゲートトランザクションにて扱います。


## トランザクションの作成

ネームスペース定義のトランザクションディスクリプタを作成します。

[root-namespace.ts](./root-namespace.ts)

ネームスペースは３階層（`foo.bar.baz`）のように、子ネームスペースを定義できます。

[child-namespace.ts](./child-namespace.ts)


## 手数料の確認

ネームスペースの取得やその占有ブロック期間によって、手数料は従量します。

ネットワークに問い合わせて、その単価を取得することができます。

```shell
$ curl -s "https://sym-test-01.opening-line.jp:3001/network/fees/rental" | jq -r
{
  "effectiveRootNamespaceRentalFeePerBlock": "200",
  "effectiveChildNamespaceRentalFee": "10000000",
  "effectiveMosaicRentalFee": "50000000"
}
```
