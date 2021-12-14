---
layout: page
title: Dailynet
permalink: /dailynet-2021-12-14-about
---

A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.

| | |
|-------|---------------------|
| Full network name | `TEZOS-DAILYNET-2021-12-14T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_583c8dfe_20211129121831](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_583c8dfe_20211129121831) |
| Public RPC endpoint | [https://rpc.dailynet-2021-12-14.teztnets.xyz](https://rpc.dailynet-2021-12-14.teztnets.xyz) |
| Faucet | [Dailynet faucet](https://teztnets.xyz/dailynet-2021-12-14-faucet) |
| Activated on | 2021-12-14T00:00:00.000Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |




### Install the software



#### Alternative: Use docker

To join Dailynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_583c8dfe_20211129121831
```

#### Alternative: Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b 583c8dfe
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Dailynet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/dailynet-2021-12-14
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-dailynet-2021-12-14.log &
> ```


