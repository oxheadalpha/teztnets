---
layout: page
title: Mondaynet
permalink: /mondaynet-about
---

A testnet that restarts every Monday launched from tezos/tezos master branch. It runs Oxford for 8 cycles then upgrades to proto Alpha.

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.mondaynet-2023-08-21.teztnets.xyz](https://rpc.mondaynet-2023-08-21.teztnets.xyz/chains/main/chain_id)<br/> |
| Faucet | [Mondaynet faucet](https://faucet.mondaynet-2023-08-21.teztnets.xyz) |
| Full network name | `TEZOS-MONDAYNET-2023-08-21T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_87fed084_20230819150450](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_87fed084_20230819150450) |
| Activated on | 2023-08-21T00:00:00.000Z |





### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Mondaynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_87fed084_20230819150450
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout 87fed084
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Mondaynet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/mondaynet-2023-08-21

octez-node run --rpc-addr 127.0.0.1:8732
```




### Data Availability Layer

The Teztnets baker for this network is running a Data Availability Layer node.

For more info, read this [blog post from Nomadic Labs](https://research-development.nomadic-labs.com/data-availability-layer-tezos.html).

The DAL node is accessible with the following endpoints:

| | |
|-------|---------------------|
| Octez DAL Node RPC URL | [`https://dal-rpc.mondaynet-2023-08-21.teztnets.xyz`](https://dal-rpc.mondaynet-2023-08-21.teztnets.xyz) |
| DAL P2P Endpoint | `dal.mondaynet-2023-08-21.teztnets.xyz:11732` |




