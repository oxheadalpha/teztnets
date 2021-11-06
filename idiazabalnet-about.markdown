---
layout: page
title: Idiazabalnet DRY RUN
permalink: /idiazabalnet-about
---

Dry-run for Idiazabalnet. Do not use! The real one starts on 11/09

| | |
|-------|---------------------|
| Full network name | `TEZOS_IDIAZABALNET_2021-11-04T15:00:00Z` |
| Tezos docker build | [tezos/tezos:master_a8e1dd3c_20211104172223](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name=master_a8e1dd3c_20211104172223) |
| Public RPC endpoint | [https://rpc.idiazabalnet.teztnets.xyz](https://rpc.idiazabalnet.teztnets.xyz) |
| Faucet | [Idiazabalnet DRY RUN faucet](https://teztnets.xyz/idiazabalnet-faucet) |
| Activated on | 2021-11-04T15:00:00Z |
| Protocol at level 0 |  `ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK` |


🔥 If you're here, this means you belong to one of the few lucky people to take part into the testnet using the brand new consensus algorithm [Tenderbake](https://blog.nomadic-labs.com/a-look-ahead-to-tenderbake.html). Congratulations and thanks in advance! This page shows you how to set up your system and actively participate in testing Tenderbake.

You may want to run the software in debug mode:

```
export TEZOS_LOG="* -> debug"
```

Note: Idiazabalnet does not upgrade and stays on the same protocol from genesis.

Note: tenderbake has been megred to octez master branch. This testnet runs the "alpha protocol" as of 2021-11-09 which contains tenderbakenet as well as a [few other changes](https://tezos.gitlab.io/protocols/alpha.html).

### Report bugs

Be aware that Tenderbake is not a final product. The software which is provided may contain bugs that you can report as issues.

1. Check that your issue is not [already referenced](https://gitlab.com/tezos/tezos/-/issues?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=%5BConsensus%5D%20Tenderbake). Your issue is possibly under investigation as of now and we invite you to wait patiently.
2. If not, you can [open a new one](https://gitlab.com/tezos/tezos/-/issues/new?issue%5Bassignee_id%5D=&issue%5Bmilestone_id%5D=1980085).
3. You can also ask for help on Slack using the [`#idiazabalnet`](https://app.slack.com/client/TAHVDMZ44/C02LCFZLPAP) channel of [tezos-baking.slack.com](https://tezos-baking.slack.com).



### Install the software

#### Using docker

To join Idiazabalnet DRY RUN with docker, open a shell in the container:

```
docker run -it --entrypoint=/bin/sh tezos/tezos:master_a8e1dd3c_20211104172223
```

#### Build the software


- ⚠️  If you already have an existing Tezos installation, do not forget to backup and delete your `~/.tezos-node` and `~/.tezos-client`.
- ⚠️  If this is your first time installing Tezos, you may need to [install a few dependencies](https://tezos.gitlab.io/introduction/howtoget.html#setting-up-the-development-environment-from-scratch).

```
git clone git@gitlab.com:tezos/tezos.git -b a8e1dd3c
cd tezos
opam init # if this is your first time using OPAM
make build-deps
eval $(opam env)
make
export PATH=$(pwd):$PATH
```

### Join the Idiazabalnet DRY RUN network

Run the following commands:

```
tezos-node config init --network https://teztnets.xyz/idiazabalnet
tezos-node run --rpc-addr 127.0.0.1:8732
```

> 💡 A simple way to keep your process alive is to use `screen` or `nohup` to keep it running in the background while redirecting logs into files at the same time. For example:
>[color=purple]
> ```bash=13
> nohup tezos-node run --rpc-addr 127.0.0.1:8732 > ./node-idiazabalnet.log &
> ```


### Bake on the Idiazabalnet DRY RUN network

To improve reliability of the chain, you can take part in the consensus by becoming a baker. In that case, you will need some test tokens from the [faucet](https://teztnets.xyz/idiazabalnet-faucet).

Register your key as a delegate using your alias or `pkh`. For instance:
```bash=2
./tezos-client register key faucet as delegate
```

You may now launch the baker process.
```bash=3
tezos-baker-alpha run with local node ~/.tezos-node faucet
```

> 💡 Again, to keep your processes alive in background:
> [color=purple]
> ```bash=4
> nohup tezos-baker-alpha run with local node ~/.tezos-node faucet > ./baker-idiazabalnet.log &
> ```

Note that you need a minimum amount of tez to get rights.


