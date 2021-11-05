---
layout: page
title: Idiazabalnet DRY RUN
permalink: /idiazabalnet-about
---

Dry-run for Idiazabalnet. Do not use! The real one starts on 11/09

| | |
|-------|---------------------|
| Full network name | `TEZOS_IDIAZABALNET_2021-11-04T15:00:00Z` |
| Tezos docker build | [tezos/tezos:master_a8e1dd3c_20211104172223](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_a8e1dd3c_20211104172223) |
| RPC endpoint | [https://rpc.idiazabalnet.teztnets.xyz](https://rpc.idiazabalnet.teztnets.xyz) |
| Faucet | [Idiazabalnet DRY RUN faucet](https://faucet.idiazabalnet.teztnets.xyz) |
| Activated on | 2021-11-04T15:00:00Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |


### How to peer with Idiazabalnet DRY RUN using Docker

To join Idiazabalnet DRY RUN with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_a8e1dd3c_20211104172223
```

Then run the following commands:

```
tezos-node config init --network https://teztnets.xyz/idiazabalnet
tezos-node run
```

### How to peer with Idiazabalnet DRY RUN building from source

```
git clone git@gitlab.com:tezos/tezos.git -b a8e1dd3c
cd tezos
make build-deps
eval $(opam env)
make
```

Then run the following commands:

```
./tezos-node config init --network https://teztnets.xyz/idiazabalnet
./tezos-node run
```
