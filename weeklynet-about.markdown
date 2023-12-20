---
layout: page
title: Weeklynet
permalink: /weeklynet-about
---

A testnet that restarts every Wednesday launched from tezos/tezos master branch. It runs Oxford for 4 cycles then upgrades to proto Alpha.

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.weeklynet-2023-12-20.teztnets.xyz](https://rpc.weeklynet-2023-12-20.teztnets.xyz/chains/main/chain_id)<br/> |
| Faucet | [Weeklynet faucet](https://faucet.weeklynet-2023-12-20.teztnets.xyz) |
| Full network name | `TEZOS-WEEKLYNET-2023-12-20T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_d0dfb3fb_20231219224419](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_d0dfb3fb_20231219224419) |
| Activated on | 2023-12-20T00:00:00.000Z |





### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Weeklynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_d0dfb3fb_20231219224419
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
cd
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout d0dfb3fb
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos:$PATH
```

### Join the Weeklynet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/weeklynet-2023-12-20

octez-node run --rpc-addr 127.0.0.1:8732
```




### Data Availability Layer

This network is running [Data Availability Layer](https://tezos.gitlab.io/shell/dal.html) nodes.


The DAL nodes are accessible with the following endpoints:

| | RPC | P2P Endpoint |
|------------|---------|--------------|
| DAL Bootstrap | [Link](https://dal-bootstrap-rpc.weeklynet-2023-12-20.teztnets.xyz) | `dal.weeklynet-2023-12-20.teztnets.xyz:11732` |
| DAL Teztnets Attester | [Link](https://dal-attester-rpc.weeklynet-2023-12-20.teztnets.xyz) | `dal1.weeklynet-2023-12-20.teztnets.xyz:11732` |


For more info, read this [blog post from Nomadic Labs](https://research-development.nomadic-labs.com/data-availability-layer-tezos.html).



