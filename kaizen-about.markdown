---
layout: page
title: Kaizen
permalink: /kaizen-about
---

Long-running Tezos testnet that closely follows mainnet proto upgrades

| | |
|-------|---------------------|
| Full network name | `TEZOS_GRANADANET_2021-05-21T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v11.0](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v11.0) |
| Public RPC endpoint | [https://rpc.kaizen.teztnets.xyz](https://rpc.kaizen.teztnets.xyz) |
| Faucet | [Kaizen faucet](https://faucet.tzalpha.net) |
| Activated on | 2021-05-21T15:00:00Z |
| Protocol at level 4095 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 757759 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |


Tezos changes protocol every few months. By contrast, Tezos testnets have been recreated at each protocol upgrade. Developers have been complaining that the pace of Testnet changes is too fast, and it is tedious to recreate contracts every few months.

**Kaizen** is a new kind of Tezos testnet that upgrades to closely follow Tezos mainnet protocol. We aim to run it for a long time, enough that developers would feel confident publishing contracts into it.

Unlike mainnet, there is no democracy involved: Kaizen upgrades are user-activated. The upgrade blocks are centrally managed on the Teztnets.xyz platform.

Kaizen was previously known as *Granadanet*. Granadanet has been running since May 2021 and has seen significant developer activity. By using Granadanet as a starting point for Kaizen, we benefit from all this prior activity and make developer's lives easier.

Kaizen will hard-fork from Granadanet and upgrade to Hangzhou shortly before mainnet. We encourage all Granadanet bakers to perform the configuration changes described below to participate in the hard fork. Otherwise, you will end up on a different chain where the network never upgraded to If you are running a Granadanet node, here is what you need to do to convert it into a Kaizen node:

1. update Tezos to the most recent release (currently v11.0)
1. update your node's configuration: `tezos-node config update --network https://teztnets.xyz/kaizen`

Your node is now configured to switch protocols to Kaizen at the end of cycle 185 (block 757,759).


### Install the software

#### Using docker

To join Kaizen with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v11.0
```

#### Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b v11.0
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Kaizen network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/kaizen
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-kaizen.log &
> ```


