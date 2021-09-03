# Teztnets

Infrastructure-as-code repo to activate and bootstrap Tezos testnets in a repeatable, automated way.

See [teztnets.xyz](https://teztnets.xyz) for the list of active Teztnets.

## Features

### Based on tezos-k8s

[tezos-k8s](https://github.com/oxheadalpha/tezos-k8s) is a framework to deploy Tezos nodes or chains using Kubernetes and Helm.

See the [tezos-k8s documentation](https://github.com/oxheadalpha/tezos-k8s/blob/master/README.md)

### Faucet support

The [commitments](https://github.com/oxheadalpha/teztnets/tree/main/bootstrap_commitments) are precursor accounts that can be used to fund real account with the faucet.

### Injection of contracts at genesis

A [collection of raw Michelson contracts](https://github.com/oxheadalpha/teztnets/tree/main/bootstrap_contracts) can be optionally deployed in any Teztnet at genesis.

### Bootstrap baker and bootstrap p2p endpoint

Upon deployment of a Teztnet, a genesis baker will run and its p2p and rpc endpoints will be exposed externally.
Example:

- p2p: `granadanet.teztnets.xyz`
- rpc `rpc.granadanet.teztnets.xyz`

### `--network` endpoint for Tezos node

Tezos nodes supports downloading of network specification from a json endpoint: `tezos-node config init --network https://teztnets.xyz/<TEZTNET NAME>`

The Teztnet platform creates and exposes such endpoints.

## Currently deployed Teztnets

Deployment of new testnets is performed with Github Releases.

The most recent release on the [Release page](https://github.com/oxheadalpha/teztnets/releases) has a list of currently deployed testnets, with URLs to connect to them.

## Automate on Teztnets

You are encouraged to build automation to ensure your Tezos project keeps running with the future versions of Tezos shell and/or protocol.

1. monitor this repo's releases using your monitoring tool of choice
1. this endpoint lists the current active testnets: [https://teztnets.xyz/teztnets.json](https://teztnets.xyz/teztnets.json)

## Add new Teztnets or modify existing Teztnets

Every Teztnet is defined in a directory in this repository. The Teztnet directory must contain the following files:

- A Helm chart `values.yaml` file
- optionally, a submodule of tezos-k8s (in case you need an unreleased or custom version of the tezos-k8s software)

### Helm chart values.yaml

The Helm chart values.yaml lets you customize your chain in many ways:

- specify activation parameters, such as:
  - list of genesis bakers
  - list of accounts funded at genesis
  - chains parameters (blocks per cycle, time between blocks...)
- specify user-activated upgrades for hard-forks at a given length
- specify the list of baker/endorser binaries to run.

Look in any Teztnet directory's values.yaml file for reference as to how to configure your own Teztnet.

The [default Helm values.yaml](https://github.com/oxheadalpha/tezos-k8s/blob/master/charts/tezos/values.yaml) has details on every possible way to customize your teztnet.
