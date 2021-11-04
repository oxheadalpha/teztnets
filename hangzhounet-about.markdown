---
layout: page
title: Hangzhounet
permalink: /hangzhounet-about
---

Long-running testnet for Hangzhou proposal.

| | |
|-------|---------------------|
| Full network name | `TEZOS_HANGZHOUNET_2021-11-04T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v11.0-rc2](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v11.0-rc2) |
| RPC endpoint | [https://rpc.hangzhounet.teztnets.xyz](https://rpc.hangzhounet.teztnets.xyz) |
| Faucet | [Hangzhounet faucet](https://faucet.hangzhounet.teztnets.xyz) |
| Activated on | 2021-11-04T15:00:00Z |
| Protocol at level 8191 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |


### How to peer with Hangzhounet using Docker

To join Hangzhounet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v11.0-rc2
```

Then run the following commands:

```
tezos-node config init --network https://teztnets.xyz/hangzhounet
tezos-node run
```

### How to peer with Hangzhounet building from source

```
git clone git@gitlab.com:tezos/tezos.git -b v11.0-rc2
cd tezos
make build-deps
eval $(opam env)
make
```

Then run the following commands:

```
./tezos-node config init --network https://teztnets.xyz/hangzhounet
./tezos-node run
```
