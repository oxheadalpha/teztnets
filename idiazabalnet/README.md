🔥 If you're here, this means you belong to one of the few lucky people to take part into the testnet using the brand new consensus algorithm [Tenderbake](https://blog.nomadic-labs.com/a-look-ahead-to-tenderbake.html). Congratulations and thanks in advance! This page shows you how to set up your system and actively participate in testing Tenderbake.

⚠️  We are maintaining a [`teztnet/idiazabalnet`](https://gitlab.com/nomadic-labs/tezos/-/tree/testnet/idiazabalnet) branch with a snapshot of protocol alpha from 2021-11-06. If any upgrades are needed, they will go to this branch. **Do not use most recent master branch**.

⚠️  There are no released packages or binaries for this testnet. You must build from source or use Docker.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  You can not sign with Ledger for now. You need to use a hot wallet address.

⚠️  Idiazabalnet does not upgrade and stays on the same protocol from genesis.

⚠️  initially, 80% of the stake will belong to Nomadic Labs bakers, in order to faciliate debugging.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="* -> debug"
```

Be aware that Tenderbake is not a final product. The software which is provided may contain bugs that you can report as issues.

1. Check that your issue is not [already referenced](https://gitlab.com/tezos/tezos/-/issues?label_name[]=testnet%3A%3Aidiazabalnet). Your issue is possibly under investigation as of now and we invite you to wait patiently.
2. If not, you can [open a new one](https://gitlab.com/tezos/tezos/-/issues/new?issue%5Bmilestone_id%5D=) and use tag **testnet::idiazabalnet**.
3. You can also ask for help on Slack using the [`#idiazabalnet`](https://app.slack.com/client/TAHVDMZ44/C02LCFZLPAP) channel of [tezos-baking.slack.com](https://tezos-baking.slack.com).

