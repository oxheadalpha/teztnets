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
| Public RPC endpoint | [https://rpc.granadanet.teztnets.xyz](https://rpc.granadanet.teztnets.xyz) |
| Faucet | [Granadanet faucet](https://faucet.tzalpha.net) |
| Activated on | 2021-05-21T15:00:00Z |
| Protocol at level 4095 |  `PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV` |




### Install the software

#### Using docker

To join Granadanet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v10.3
```

#### Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b v10.3
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Granadanet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/granadanet
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-granadanet.log &
> ```


### Bake on the Granadanet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.tzalpha.net).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-010-PtGRANAD run with local node ~/.tezos-node faucet
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-010-PtGRANAD run with local node ~/.tezos-node faucet > ./baker-granadanet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


