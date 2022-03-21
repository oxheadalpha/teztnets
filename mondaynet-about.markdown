---
layout: page
title: Mondaynet
permalink: /mondaynet-about
---

A testnet that restarts every Monday launched from tezos/tezos master branch and alpha protocol with TORU + SCORU feature flags on.

| | |
|-------|---------------------|
| Full network name | `TEZOS-MONDAYNET-2022-03-21T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_254a9bdd_20220319194930](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_254a9bdd_20220319194930) |
| Public RPC endpoint | [https://rpc.mondaynet-2022-03-21.teztnets.xyz](https://rpc.mondaynet-2022-03-21.teztnets.xyz) |
| Faucet | [Mondaynet faucet](https://teztnets.xyz/mondaynet-2022-03-21-faucet) |
| Activated on | 2022-03-21T00:00:00.000Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |




### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.



#### Alternative: Use docker

To join Mondaynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_254a9bdd_20220319194930
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout 254a9bdd
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Mondaynet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/mondaynet-2022-03-21

tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-mondaynet-2022-03-21.log &
> ```


