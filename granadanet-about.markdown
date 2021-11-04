---
layout: page
title: Granadanet
permalink: /granadanet-about
---

Long-running testnet for Granada proposal.

| | |
|-------|---------------------|
| Full network name | `TEZOS_GRANADANET_2021-05-21T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v10.3](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v10.3) |
| RPC endpoint | [https://rpc.granadanet.teztnets.xyz](https://rpc.granadanet.teztnets.xyz) |
| Faucet | [Granadanet faucet](https://faucet.tzalpha.net) |
| Activated on | 2021-05-21T15:00:00Z |
| Protocol at level 4095 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |


### How to peer with Granadanet using Docker

To join Granadanet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v10.3
```

Then run the following commands:

```
tezos-node config init --network https://teztnets.xyz/granadanet
tezos-node run
```

### How to peer with Granadanet building from source

```
git clone git@gitlab.com:tezos/tezos.git -b v10.3
cd tezos
make build-deps
eval $(opam env)
make
```

Then run the following commands:

```
./tezos-node config init --network https://teztnets.xyz/granadanet
./tezos-node run
```
