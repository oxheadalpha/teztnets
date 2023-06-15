---
layout: page
title: Ghostnet
permalink: /ghostnet-about
---

Ghostnet is the long-running testnet for Tezos.

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.ghostnet.teztnets.xyz](https://rpc.ghostnet.teztnets.xyz/chains/main/chain_id)<br/>[https://ghostnet.ecadinfra.com](https://ghostnet.ecadinfra.com/chains/main/chain_id)<br/>[https://ghostnet.tezos.marigold.dev](https://ghostnet.tezos.marigold.dev/chains/main/chain_id)<br/> |
| Faucet | [Ghostnet faucet](https://faucet.ghostnet.teztnets.xyz) |
| Full network name | `TEZOS_ITHACANET_2022-01-25T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v17.1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v17.1) |
| Activated on | 2022-01-25T15:00:00Z |
| Block Explorers | [TzKT](https://ghostnet.tzkt.io) - [TzStats](https://ghost.tzstats.com) |


Ghostnet is centrally managed to follow Tezos Mainnet protocol upgrades. It generally updates to the same protocol than Mainnet one week before Mainnet update itself.


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v17.1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Ghostnet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v17.1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v17.1
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Ghostnet network

Run the following commands:

```
octez-node config init --network ghostnet

octez-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup octez-node run --rpc-addr 127.0.0.1:8732 > ./node-ghostnet.log &
> ```




### Bake on the Ghostnet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.ghostnet.teztnets.xyz).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./octez-client register key mykey as delegate
```

You may now launch the baker process.
```bash=3
octez-baker-PtNairob run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
octez-accuser-PtNairob run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup octez-baker-PtNairob run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass > ./baker-ghostnet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


