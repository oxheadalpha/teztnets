---
layout: page
title: Ithacanet
permalink: /ithacanet-about
---

Testnet for the Ithaca protocol proposal

| | |
|-------|---------------------|
| Full network name | `TEZOS_ITHACANET_2021-12-22T15:00:00Z` |
| Tezos docker build | [tezos/tezos:amd64_v12.0-rc1](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=amd64_v12.0-rc1) |
| Public RPC endpoint | [https://rpc.ithacanet.teztnets.xyz](https://rpc.ithacanet.teztnets.xyz) |
| Faucet | [Ithacanet faucet](https://teztnets.xyz/ithacanet-faucet) |
| Activated on | 2021-12-22T15:00:00Z |
| Protocol at level 8191 |  `PsiThaCaT47Zboaw71QWScM8sXeMM7bbQFncK9FLqYc6EKdpjVP` |


Ithacanet will launch on **Wednesday, December 22nd at 15:00 UTC**. We expect Octez release `v12.0-rc1` to be out on Tuesday, December 21st. Octez v12 is needed to run Ithacanet.


We are looking for as many Tezos bakers as possible to participate in this testnet. Please make yourself known in the Tezos Baking Slack #test-networks channel if you wish to participate as a bootstrap baker.

If you choose to participate as a bootstrap baker, **you must run a node** from genesis. Ithaca is introducing a new consensus mechanism called Tenderbake, where the chain will not produce new blocks if more than one third of the bakers are offline. If you participate, it is your responsibility to keep your node in good working order, so that the chain does not stall.

We are tracking the list of bootstrap bakers at the bottom of [this file](https://github.com/oxheadalpha/teztnets/blob/v6.18/ithacanet/values.yaml). You must provide your public key (starting with `edpk`, NOT the hash starting with `tz`) to get rights at genesis.

You can run ithaca testnet by passing the argument `--network ithacanet` to `tezos-node run`.

⚠️  Ithacanet will run Hangzhou for two cycles then perform an upgrade to Ithaca at block 8192. You must run the **Hangzhou baker and endorser** for the first few days.

⚠️  Tenderbake has no endorser. The endorser binary does not exist. This is normal. Running the baker daemon is enough.

⚠️  You can not sign with Ledger for now. You need to use a hot wallet address.

⚠️  If you participated in the previous Tenderbake test networks (Idiazabalnet), you are presumed to be participating in Ithacanet. If this is not the case, please let us know in the slack channel.

### Advanced

Tenderbake consensus algorithm significantly increases the amount of consensus messages. There are 7000 endorsing slots per block. On mainnet, we expect several hundred preendorsements and endorsement messages to be gossiped at every block.

To simulate this behavior, it is important to have many participating bakers in Ithacanet. If you desire, you may run several bakers, in order to generate more consensus messages. If you choose to run several bakers, you must ensure that each one of them is in good working order during the lifecycle of the testnet.

### Report bugs

You are encouraged to run the baker in debug mode:

```
export TEZOS_LOG="* -> debug"
```


### Install the software



#### Alternative: Use docker

To join Ithacanet with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:amd64_v12.0-rc1
```

#### Alternative: Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b amd64_v12.0-rc1
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Ithacanet network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/ithacanet
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-ithacanet.log &
> ```


### Bake on the Ithacanet network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/ithacanet-faucet).

If you are not a bootstrap baker, you need to register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-012-PsiThaCa run with local node ~/.tezos-node faucet
```

> 💡 Again, to keep your processes alive in background:
>
> ```bash=4
> nohup tezos-baker-012-PsiThaCa run with local node ~/.tezos-node faucet > ./baker-ithacanet.log &
> ```

Note that you need a minimum amount of tez to get baking rights. If you are not a bootstrap baker, it will take you several cycles to start baking.


