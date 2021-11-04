---
layout: page
title: Mondaynet
permalink: /mondaynet-2021-11-01-about
---

A testnet that restarts every Monday launched from tezos/tezos master branch and Granadanet protocol, upgrading to alpha at block 255.

| | |
|-------|---------------------|
| Full network name | `TEZOS-MONDAYNET-2021-11-01T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_507ff54c_20211029163546](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_507ff54c_20211029163546) |
| RPC endpoint | [https://rpc.mondaynet-2021-11-01.teztnets.xyz](https://rpc.mondaynet-2021-11-01.teztnets.xyz) |
| Faucet | [Mondaynet faucet](https://faucet.mondaynet-2021-11-01.teztnets.xyz) |
| Activated on | 2021-11-01T00:00:00.000Z |
| Protocol at level 0 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |
| Protocol at level 255 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |


### How to peer with Mondaynet using Docker

To join Mondaynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_507ff54c_20211029163546
```

Then run the following commands:

```
tezos-node config init --network https://teztnets.xyz/mondaynet-2021-11-01
tezos-node run
```

### How to peer with Mondaynet building from source

```
git clone git@gitlab.com:tezos/tezos.git -b 507ff54c
cd tezos
make build-deps
eval $(opam env)
make
```

Then run the following commands:

```
./tezos-node config init --network https://teztnets.xyz/mondaynet-2021-11-01
./tezos-node run
```
