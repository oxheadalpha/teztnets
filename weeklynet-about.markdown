---
layout: page
title: Weeklynet
permalink: /weeklynet-about
---

A testnet that restarts every Wednesday launched from tezos/tezos master branch. It runs Nairobi for 8 cycles then upgrades to proto Alpha.

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.weeklynet-2023-11-01.teztnets.xyz](https://rpc.weeklynet-2023-11-01.teztnets.xyz/chains/main/chain_id)<br/> |
| Faucet | [Weeklynet faucet](https://faucet.weeklynet-2023-11-01.teztnets.xyz) |
| Full network name | `TEZOS-WEEKLYNET-2023-11-01T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_710d8f4a_20231031234225](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_710d8f4a_20231031234225) |
| Activated on | 2023-11-01T00:00:00.000Z |





### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Weeklynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_710d8f4a_20231031234225
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout 710d8f4a
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Weeklynet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/weeklynet-2023-11-01

octez-node run --rpc-addr 127.0.0.1:8732
```




### Data Availability Layer

The Teztnets baker for this network is running a Data Availability Layer node.

For more info, read this [blog post from Nomadic Labs](https://research-development.nomadic-labs.com/data-availability-layer-tezos.html).

The DAL node is accessible with the following endpoints:

| | |
|-------|---------------------|
| Octez DAL Node RPC URL | [`https://dal-rpc.weeklynet-2023-11-01.teztnets.xyz`](https://dal-rpc.weeklynet-2023-11-01.teztnets.xyz) |
| DAL P2P Endpoint | `dal.weeklynet-2023-11-01.teztnets.xyz:11732` |




