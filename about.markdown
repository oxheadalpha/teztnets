---
layout: page
title: About Teztnets.xyz
permalink: /about/
---

This is a resource for coordinating Testnets for the [Tezos](https://tezos.com) blockchain, operated by the team at [Oxhead Alpha](https://oxheadalpha.com).

The Tezos blockchain upgrades [every 3 months on average](https://www.tezosagora.org/learn) and this comes with unique constraints regarding protocol testing. This platform aims to facilitate this process.

We have three kind of testnets:

* **permanent testnets** live for a long time, similarly to testnets in other blockchains. Today there is one such testnet, Ghostnet. It is useful to use as a staging environment for your Dapp, knowing that any contract deployed there will persist,
* **protocol testnets** are deployed each time a new protocol is injected (2 months before mainnet activation). Their goal is to test protocols before they get rolled into mainnet. Any team building on Tezos should test their products on these networks,
* **periodic testnets** are bleeding edge networks that restart on a cadence from the development branch. The primary users of these testnets are protocol, library and indexer teams.

Teztnets is powered by [tezos-k8s](https://tezos-k8s.xyz), a collection of helm charts maintained by Oxhead Alpha. It is deployed with [Pulumi](https://pulumi.com).

The [Teztnets Status page](https://status.teztnets.xyz) is powered by [Pyrometer](https://gitlab.com/tezos-kiln/pyrometer), a Tezos monitoring tool by Oxhead Alpha.

The [github repo](https://github.com/oxheadalpha/teztnets) has more information regarding these testnets, how they are configured, and how to deploy new ones.

Relevant Medium articles announcing Teztnets.xyz features:

* [Intro to Mondaynet and Dailynet](https://medium.com/the-aleph/continuous-tezos-protocol-testing-with-dailynet-and-mondaynet-92d4b084a9f6)
* [Intro to Ghostnet](https://medium.com/the-aleph/introducing-ghostnet-1bf39976e61f)
