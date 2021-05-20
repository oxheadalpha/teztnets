# Teztnets

Infrastructure-as-code repo to activate and bootstrap tezos testnets in a repeatable, automated way.

Deployed at [Teztnets.xyz](https://teztnets.xyz)

## Features

### Based on Tezos-k8s

[Tezos-k8s](https://github.com/tqtezos/tezos-k8s) is a framework to deploy Tezos nodes or chains using Kubernetes and Helm.

See the [Tezos-k8s documentation](https://github.com/tqtezos/tezos-k8s/blob/master/README.md)
### Faucet support

The [commitments](https://github.com/tqtezos/teztnets/tree/main/bootstrap_commitments) are precursor accounts that can be used to fund real account with the faucet.

### Injection of contracts at genesis

A [collection of raw Michelson contracts](https://github.com/tqtezos/teztnets/tree/main/bootstrap_contracts) can be optionally deployed in any Teztnet at genesis.

### Bootstrap baker and bootstrap p2p endpoint

Upon deployment of a teztnet, a genesis baker will run and its p2p endpoint will be exposed externally.

### `--network` endpoint for Tezos node

Tezos nodes supports downloading of network specification from a json endpoint: `tezos-node config init --network https://teztnets.xyz/teztnet_name`

The Teztnet platform creates and exposes such endpoints.

## Currently deployed Teztnets

Deployment of new testnets is performed with Github Releases.

The most recent release on the [Release page](https://github.com/tqtezos/teztnets/releases) has a list of currently deployed testnets, with URLs to connect to them.

## Automate on Teztnets

You are encouraged to build automation to ensure your Tezos project keeps running with the future versions of Tezos shell and/or protocol.

1. monitor this repo's releases using your monitoring tool of choice
1. this endpoint lists the current active testnets: [https://teztnets.xyz/teztnets.json](https://teztnets.xyz/teztnets.json)

## Add new Teztnets or modify existing Teztnets

Every teztnet is defined in a directory in this repository. The teztnet directory must contain the following files:

* `values.yaml`
* `metadata.yaml`
* optionally, a submodule of Tezos-k8s (in case you need an unreleased or custom version of the tezos-k8s software)

### Helm chart values.yaml

The Helm chart values.yaml lets you customize your chain in many ways:

* specify activation parameters, such as:
  * list of genesis bakers
  * list of accounts funded at genesis
  * chains parameters (blocks per cycle, time between blocks...)
* specify user-activated upgrades for hard-forks at a given length
* specify the list of baker/endorser binaries to run.

 The [default Helm values.yaml](https://github.com/tqtezos/tezos-k8s/blob/master/charts/tezos/values.yaml) has details on every possible way to customize your teztnet.

 ### Metadata.yaml file

This metadata file specifies:

* the external bootstrap peers p2p endpoints (not managed by the teztnets platform)
* description of the teztnet
* the commitments file (for faucet), if desired
* the list of Michelson contracts to inject at genesis, if desired

[Example of metadata.yaml](https://github.com/tqtezos/teztnets/blob/main/mondaynet/metadata.yaml)
