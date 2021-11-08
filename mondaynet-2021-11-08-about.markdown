---
layout: page
title: Mondaynet
permalink: /mondaynet-2021-11-08-about
---

A testnet that restarts every Monday launched from tezos/tezos master branch and Granadanet protocol, upgrading to alpha at block 255.

| | |
|-------|---------------------|
| Full network name | `TEZOS-MONDAYNET-2021-11-08T00:00:00.000Z` |
| Tezos docker build | [tezos/tezos:master_ad57ec91_20211105162538](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_ad57ec91_20211105162538) |
| Public RPC endpoint | [https://rpc.mondaynet-2021-11-08.teztnets.xyz](https://rpc.mondaynet-2021-11-08.teztnets.xyz) |
| Faucet | [Mondaynet faucet](https://teztnets.xyz/mondaynet-2021-11-08-faucet) |
| Activated on | 2021-11-08T00:00:00.000Z |
| Protocol at level 0 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |
| Protocol at level 255 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |




### Install the software

#### Using docker

To join Mondaynet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_ad57ec91_20211105162538
```

#### Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b ad57ec91
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Mondaynet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/mondaynet-2021-11-08
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-mondaynet-2021-11-08.log &
> ```


