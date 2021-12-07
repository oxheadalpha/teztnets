---
layout: page
title: Idiazabalnet
permalink: /idiazabalnet-about
---

Third iteration of testnet for future I proposal testing

| | |
|-------|---------------------|
| Full network name | `TEZOS_IDIAZABALNET_2021-12-07T15:00:00Z` |
| Tezos docker build | registry.gitlab.com/nomadic-labs/tezos@sha256:e242f52636fcc4e6704c46e2ea6d3463ad1b5574ad2ccaf15053d6a73060be0c |
| Public RPC endpoint | [https://rpc.idiazabalnet.teztnets.xyz](https://rpc.idiazabalnet.teztnets.xyz) |
| Faucet | [Idiazabalnet faucet](https://teztnets.xyz/idiazabalnet-faucet) |
| Activated on | 2021-12-07T15:00:00Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |


🔥 If you're here, this means you belong to one of the few lucky people to take part into the testnet using the brand new consensus algorithm [Tenderbake](https://blog.nomadic-labs.com/a-look-ahead-to-tenderbake.html). Congratulations and thanks in advance! This page shows you how to set up your system and actively participate in testing Tenderbake.

⚠️  We are maintaining a [`testnet/idiazabalnet`](https://gitlab.com/nomadic-labs/tezos/-/tree/testnet/idiazabalnet) branch with a snapshot of protocol alpha from 2021-11-30. If any upgrades are needed, they will go to this branch. **Do not use most recent master branch**.

⚠️  There are no released packages or binaries for this testnet. You must build from source or use Docker.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  You can not sign with Ledger for now. You need to use a hot wallet address.

⚠️  Idiazabalnet does not upgrade and stays on the same protocol from genesis.

⚠️  initially, 67% of the stake will belong to Nomadic Labs bakers, in order to facilitate debugging.

⚠️  Idiazabalnet restarts regularly. To prepare for a network restart, you must clear your node and client files, backing private keys up if applicable.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="* -> debug"
```

Be aware that Tenderbake is not a final product. The software which is provided may contain bugs that you can report as issues.

1. Check that your issue is not [already referenced](https://gitlab.com/tezos/tezos/-/issues?label_name[]=testnet%3A%3Aidiazabalnet). Your issue is possibly under investigation as of now and we invite you to wait patiently.
2. If not, you can [open a new one](https://gitlab.com/tezos/tezos/-/issues/new?issue%5Bmilestone_id%5D=) and use label **testnet::idiazabalnet**.
3. You can also ask for help on Slack using the [`#idiazabalnet`](https://app.slack.com/client/TAHVDMZ44/C02LCFZLPAP) channel of [tezos-baking.slack.com](https://tezos-baking.slack.com).



### Install the software



#### Alternative: Use docker

To join Idiazabalnet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh registry.gitlab.com/nomadic-labs/tezos@sha256:e242f52636fcc4e6704c46e2ea6d3463ad1b5574ad2ccaf15053d6a73060be0c
```

#### Alternative: Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone https://gitlab.com/nomadic-labs/tezos.git -b testnet/idiazabalnet
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Idiazabalnet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/idiazabalnet
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-idiazabalnet.log &
> ```


### Bake on the Idiazabalnet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/idiazabalnet-faucet).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-alpha run with local node ~/.tezos-node faucet
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-alpha run with local node ~/.tezos-node faucet > ./baker-idiazabalnet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


