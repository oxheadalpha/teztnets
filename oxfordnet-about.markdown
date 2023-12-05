---
layout: page
title: Oxfordnet
permalink: /oxfordnet-about
---

Test Chain for the Oxford Protocol Proposal

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.oxfordnet.teztnets.xyz](https://rpc.oxfordnet.teztnets.xyz/chains/main/chain_id)<br/> |
| Faucet | [Oxfordnet faucet](https://faucet.oxfordnet.teztnets.xyz) |
| Full network name | `TEZOS_OXFORDNET_2023-12-07T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v19.0-rc1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v19.0-rc1) |
| Activated on | 2023-12-07T15:00:00Z |





### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v19.0-rc1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Oxfordnet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v19.0-rc1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v19.0-rc1
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Oxfordnet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/oxfordnet

octez-node run --rpc-addr 127.0.0.1:8732
```






### Bake on the Oxfordnet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.oxfordnet.teztnets.xyz).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./octez-client register key mykey as delegate
```

Then, you need to **stake** some amount of tez greater than 6,000 (this only applies to Oxford protocol and beyond). For example, to stake 10,000 tez, issue the following command:
```bash=2
./octez-client stake 10000 for mykey
```

You may now launch the baker process.
```bash=3
octez-baker-Proxford run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
octez-accuser-Proxford run
```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.

> 💡 Now that you are baking, you are responsible for the network health. Please ensure that the baking processes will keep running in the background. You may want to use screen, tmux, nohup or systemd. Also make sure that the baking processes will restart when your machine restarts.


