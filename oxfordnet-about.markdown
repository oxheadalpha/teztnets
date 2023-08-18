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
| Full network name | `TEZOS_OXFORDNET_2023-08-21T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v18.0-rc1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v18.0-rc1) |
| Activated on | 2023-08-21T15:00:00Z |



Oxfordnet starts on Nairobi protocol then upgrades to Oxford at the end of cycle 2.

We welcome bootstrap bakers for Oxfordnet! The process is opt-in: please make yourself known in the baking slack, or make a Pull Request against the teztnets repo [Nairobinet definition](https://github.com/oxheadalpha/teztnets/blob/main/oxfordnet/values.yaml) file.

Oxfordnet has 8 second blocks (twice faster than mainnet).


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v18.0-rc1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Oxfordnet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v18.0-rc1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v18.0-rc1
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

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup octez-node run --rpc-addr 127.0.0.1:8732 > ./node-oxfordnet.log &
> ```






### Bake on the Oxfordnet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.oxfordnet.teztnets.xyz).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./octez-client register key mykey as delegate
```

You may now launch the baker process.
```bash=3
octez-baker-Proxford run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
octez-accuser-Proxford run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup octez-baker-Proxford run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass > ./baker-oxfordnet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


