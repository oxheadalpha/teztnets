---
layout: page
title: Dailynet
permalink: /dailynet-about
---

A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.dailynet-2024-01-07.teztnets.xyz](https://rpc.dailynet-2024-01-07.teztnets.xyz/chains/main/chain_id)<br/> |
| Faucet | [Dailynet faucet](https://faucet.dailynet-2024-01-07.teztnets.xyz) |
| Full network name | `TEZOS-DAILYNET-2024-01-07T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_2f7b6c60_20240105172958](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_2f7b6c60_20240105172958) |
| Activated on | 2024-01-07T00:00:00.000Z |





### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Dailynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_2f7b6c60_20240105172958
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
cd
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout 2f7b6c60
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos:$PATH
```

### Join the Dailynet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/dailynet-2024-01-07

octez-node run --rpc-addr 127.0.0.1:8732
```


### Ethereum Virtual Machine Rollup

This network is running a bleeding-edge [EVM Rollup](https://docs.etherlink.com/welcome/what-is-etherlink) from the most recent [kernel code](https://gitlab.com/tezos/tezos/-/tree/master/etherlink) in the Octez repository.

This is not to be confused with [Etherlink](https://docs.etherlink.com/get-started/connect-your-wallet-to-etherlink) which currently runs on Ghostnet.

[For Etherlink test network, go here](https://docs.etherlink.com/get-started/connect-your-wallet-to-etherlink).

| | |
|-------|---------------------|
| EVM RPC URL | [`https://evm.dailynet-2024-01-07.teztnets.xyz`](https://evm.dailynet-2024-01-07.teztnets.xyz) |
| Bare Rollup RPC URL | [`https://evm-rollup-node.dailynet-2024-01-07.teztnets.xyz`](https://evm-rollup-node.dailynet-2024-01-07.teztnets.xyz/global/block/head) |




### Data Availability Layer

This network is running [Data Availability Layer](https://tezos.gitlab.io/shell/dal.html) nodes.


The DAL nodes are accessible with the following endpoints:

| | RPC | P2P Endpoint |
|------------|---------|--------------|
| DAL Bootstrap | [Link](https://dal-bootstrap-rpc.dailynet-2024-01-07.teztnets.xyz) | `dal.dailynet-2024-01-07.teztnets.xyz:11732` |
| DAL Teztnets Attester | [Link](https://dal-attester-rpc.dailynet-2024-01-07.teztnets.xyz) | `dal1.dailynet-2024-01-07.teztnets.xyz:11732` |


For more info, read this [blog post from Nomadic Labs](https://research-development.nomadic-labs.com/data-availability-layer-tezos.html).



