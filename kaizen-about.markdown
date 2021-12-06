---
layout: page
title: Kaizen
permalink: /kaizen-about
---

Experimental - long-running Tezos testnet that closely follows mainnet proto upgrades

| | |
|-------|---------------------|
| Full network name | `TEZOS_GRANADANET_2021-05-21T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v11.0](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v11.0) |
| Public RPC endpoint | [https://rpc.kaizen.teztnets.xyz](https://rpc.kaizen.teztnets.xyz) |
| Faucet | [Kaizen faucet](https://faucet.tzalpha.net) |
| Activated on | 2021-05-21T15:00:00Z |
| Protocol at level 4095 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |
| Protocol at level 757759 |  `PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx` |


Tezos changes protocol every few months. By contrast, Tezos testnets have been recreated at each protocol upgrade. Smart contract developers have been complaining that the pace of Testnet changes is too fast, and it is tedious to recreate contracts every few months.

**Kaizen** is a new kind of experimental Tezos testnet that upgrades to closely follow Tezos mainnet protocol. We aim to run it for a long time.

Unlike mainnet, there is no democracy involved: Kaizen upgrades are user-activated. The upgrade schedule is centrally managed on the Teztnets.xyz platform.

Kaizen was previously known as *Granadanet*. Granadanet has been running since May 2021 and has seen significant developer activity. By using Granadanet as a starting point for Kaizen, we benefit from all this prior activity and make developer's lives easier.

Kaizen hard-forked from Granadanet and upgraded to Hangzhou at cycle 185.

Some bakers have not upgraded and are on an alternative chain that remained on the granada protocol. You can tell which protocol you are running by issuing a RPC request. For example, to query a local node, do:

```
curl http://localhost:8732/chains/main/blocks/head/header | jq -r .protocol
```

If you see PtHangz..., you are on Kaizen. If you see PtGRANAD... you are on an alternative chain that didn't upgrade to Hangzhou.

If you operate a node or baker and are still on granada protocol, you can remediate and join kaizen by:

* upgrading to octez v11
* flushing your node storage (data dir)
* configuring the node to run on kaizen: tezos-node config init --network https://teztnets.xyz/kaizen
* importing a snapshot (optional, not currently available)
* finally tezos-node run

To start a new baker on Kaizen, follow instructions below.


### Install the software


#### Download and install Tezos version v11.0

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Kaizen with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v11.0
```

#### Alternative: Build the software


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


### Bake on the Kaizen network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.tzalpha.net).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-011-PtHangz2 run with local node ~/.tezos-node faucet
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-011-PtHangz2 run with local node ~/.tezos-node faucet > ./baker-kaizen.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


