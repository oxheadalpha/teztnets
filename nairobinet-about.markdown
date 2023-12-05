---
layout: page
title: Nairobinet
permalink: /nairobinet-about
---

Test Chain for the Nairobi Protocol Proposal

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.nairobinet.teztnets.xyz](https://rpc.nairobinet.teztnets.xyz/chains/main/chain_id)<br/>[https://nairobinet.ecadinfra.com](https://nairobinet.ecadinfra.com/chains/main/chain_id)<br/> |
| Faucet | [Nairobinet faucet](https://faucet.nairobinet.teztnets.xyz) |
| Full network name | `TEZOS_NAIROBINET_2023-04-20T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v18.1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v18.1) |
| Activated on | 2023-04-20T15:00:00Z |
| Block Explorers | [TzKT](https://nairobinet.tzkt.io) - [TzStats](https://nairobi.tzstats.com) |


Nairobinet started on Mumbai protocol then upgraded to Nairobi at the end of cycle 2.

Nairobinet has 8 second blocks (twice faster than mainnet).


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v18.1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Nairobinet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v18.1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
cd
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v18.1
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos:$PATH
```

### Join the Nairobinet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/nairobinet

octez-node run --rpc-addr 127.0.0.1:8732
```






### Bake on the Nairobinet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.nairobinet.teztnets.xyz).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
octez-client register key mykey as delegate
```

You may now launch the baker process.
```bash=3
octez-baker-PtNairob run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
octez-accuser-PtNairob run
```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.

> 💡 Now that you are baking, you are responsible for the network health. Please ensure that the baking processes will keep running in the background. You may want to use screen, tmux, nohup or systemd. Also make sure that the baking processes will restart when your machine restarts.


