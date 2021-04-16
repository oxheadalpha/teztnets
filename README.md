# Teztnets

Infrastructure-as-code repo to activate and bootstrap tezos testnets in a repeatable, automated way.

## Currently deployed Teztnets

Deployment of new testnets is performed with Github Releases.

The most recent release on the [Release page](https://github.com/tqtezos/teztnets/releases) has a list of currently deployed testnets, with URLs to connect to them.

## Automate on Teztnets

You are encouraged to build automation to ensure your Tezos project keeps running with the future versions of Tezos shell and/or protocol.

1. monitor this repo's releases using your monitoring tool of choice
1. this endpoint lists the current active testnets: [https://tqtezos.github.io/teztnets/teztnets.json](https://tqtezos.github.io/teztnets/teztnets.json)

## Add new Teztnets or modify existing Teztnets

Every teztnet is defined in a directory in this repository and deployed using the [Tezos-k8s project](https://github.com/tqtezos/tezos-k8s).

Open a pull request against teztnets to:

* modify the values.yaml file to add a bootstrap baker, or add contracts that are pre-populated at genesis
* add a new Teztnet against your Tezos branch/fork of choice
