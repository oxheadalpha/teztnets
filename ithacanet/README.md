Ithacanet will launch on **Wednesday, December 22nd at 15:00 UTC**. We expect Octez release `v12.0-rc1` to be out on Tuesday, December 21st. Octez v12 is needed to run Ithacanet.


We are looking for as many Tezos bakers as possible to participate in this testnet. Please make yourself known in the Tezos Baking Slack #test-networks channel if you wish to participate as a bootstrap baker.

If you choose to participate as a bootstrap baker, **you must run a node** from genesis. Ithaca is introducing a new consensus mechanism called Tenderbake, where the chain will not produce new blocks if more than one third of the bakers are offline. If you participate, it is your responsibility to keep your node in good working order, so that the chain does not stall.

We are tracking the list of bootstrap bakers at the bottom of [this file](https://github.com/oxheadalpha/teztnets/blob/v6.18/ithacanet/values.yaml). You must provide your public key (starting with `edpk`, NOT the hash starting with `tz`) to get rights at genesis.

You can run ithaca testnet by passing the argument `--network ithacanet` to `tezos-node run`.

⚠️  Ithacanet will run Hangzhou for two cycles then perform an upgrade to Ithaca at block 8192. You must run the **Hangzhou baker and endorser** for the first few days.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  You can not sign with Ledger for now. You need to use a hot wallet address.

⚠️  If you participated in the previous Tenderbake test networks (Idiazabalnet), you are presumed to be participating in Ithacanet. If this is not the case, please let us know in the slack channel.

### Advanced

Tenderbake consensus algorithm significantly increases the amount of consensus messages. There are 7000 endorsing slots per block. On mainnet, we expect several hundred preendorsements and endorsement messages to be gossiped at every block.

To simulate this behavior, it is important to have many participating bakers in Ithacanet. If you desire, you may run several bakers, in order to generate more consensus messages. If you choose to run several bakers, you must ensure that each one of them is in good working order during the lifecycle of the testnet.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="* -> debug"
```
