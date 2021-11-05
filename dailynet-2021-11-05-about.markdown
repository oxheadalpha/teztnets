---
layout: page
title: Dailynet
permalink: /dailynet-2021-11-05-about
---

A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

| | |
|-------|---------------------|
| Full network name | `TEZOS-DAILYNET-2021-11-05T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_a8e1dd3c_20211104172223](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_a8e1dd3c_20211104172223) |
| RPC endpoint | [https://rpc.dailynet-2021-11-05.teztnets.xyz](https://rpc.dailynet-2021-11-05.teztnets.xyz) |
| Faucet | [Dailynet faucet](https://faucet.dailynet-2021-11-05.teztnets.xyz) |
| Activated on | 2021-11-05T00:00:00.000Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |


### How to peer with Dailynet using Docker

To join Dailynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_a8e1dd3c_20211104172223
```

Then run the following commands:

```
tezos-node config init --network https://teztnets.xyz/dailynet-2021-11-05
tezos-node run
```

### How to peer with Dailynet building from source

```
git clone git@gitlab.com:tezos/tezos.git -b a8e1dd3c
cd tezos
make build-deps
eval $(opam env)
make
```

Then run the following commands:

```
./tezos-node config init --network https://teztnets.xyz/dailynet-2021-11-05
./tezos-node run
```
