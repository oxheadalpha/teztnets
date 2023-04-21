---
layout: page
title: Nairobinet
permalink: /nairobinet-about
---

Test Chain for the Nairobi Protocol Proposal

| | |
|-------|---------------------|
| Public RPC endpoints | [https://rpc.nairobinet.teztnets.xyz](https://rpc.nairobinet.teztnets.xyz/chains/main/chain_id)<br/> |
| Faucet | [Nairobinet faucet](https://faucet.nairobinet.teztnets.xyz) |
| Full network name | `TEZOS_NAIROBINET_2023-04-20T15:00:00Z` |
| Tezos docker build | [tezos/tezos:v17.0-beta1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=v17.0-beta1) |
| Activated on | 2023-04-20T15:00:00Z |



We welcome bootstrap bakers for Nairobinet! The process is opt-in: please make yourself known in the baking slack, or make a Pull Request against the teztnets repo [Nairobinet definition](https://github.com/oxheadalpha/teztnets/blob/main/nairobinet/values.yaml) file.

Nairobinet will start on Mumbai protocol then upgrade at the end of cycle 2. Please start your Mumbai bakers.

Nairobinet has 8 second blocks (twice faster than mainnet).


### Install the software

⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.


#### Download and install Tezos version v17.0-beta1

Follow instructions from the [Tezos documentation](https://tezos.gitlab.io/introduction/howtoget.html#installing-binaries).


#### Alternative: Use docker

To join Nairobinet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:v17.0-beta1
```

#### Alternative: Build the software

⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git
cd tezos
git checkout v17.0-beta1
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$HOME/tezos/_build/install/default/bin/:$PATH
```

### Join the Nairobinet network

Run the following commands:

```
octez-node config init --network https://teztnets.xyz/nairobinet

octez-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup octez-node run --rpc-addr 127.0.0.1:8732 > ./node-nairobinet.log &
> ```


### Bake on the Nairobinet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://faucet.nairobinet.teztnets.xyz).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./octez-client register key mykey as delegate
```

You may now launch the baker process.
```bash=3
octez-baker-PtNairob run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass
```

You may run the accuser as well:
```bash=3
octez-accuser-PtNairob run
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup octez-baker-PtNairob run with local node ~/.tezos-node mykey --liquidity-baking-toggle-vote pass > ./baker-nairobinet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


