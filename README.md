# Teztnets

Infrastructure-as-code repo to activate and bootstrap Tezos testnets in a repeatable, automated way.

See [teztnets.xyz](https://teztnets.xyz) for the list of active Teztnets.

## Features

### Based on tezos-k8s

[tezos-k8s](https://github.com/oxheadalpha/tezos-k8s) is a framework to deploy Tezos nodes or chains using Kubernetes and Helm.

See the [tezos-k8s documentation](https://github.com/oxheadalpha/tezos-k8s/blob/master/README.md)

### Faucet support

We support the beacon-compatible Tezos Faucet.

### Injection of contracts at genesis

A [collection of raw Michelson contracts](https://github.com/oxheadalpha/teztnets/tree/main/bootstrap_contracts) can be optionally deployed in any Teztnet at genesis.

### Bootstrap baker and bootstrap p2p endpoint

Upon deployment of a Teztnet, a genesis baker will run and its p2p and rpc endpoints will be exposed externally.
Example:

- p2p: `ghostnet.teztnets.xyz`
- rpc `rpc.ghostnet.teztnets.xyz`

### `--network` endpoint for Tezos node

Tezos nodes supports downloading of network specification from a json endpoint: `octez-node config init --network https://teztnets.xyz/<TEZTNET NAME>`

The Teztnet platform creates and exposes such endpoints.

## Automate on Teztnets

You are encouraged to build automation to ensure your Tezos project keeps running with the future versions of Tezos shell and/or protocol.

This endpoint lists the current active testnets: [https://teztnets.xyz/teztnets.json](https://teztnets.xyz/teztnets.json)

## Add new Teztnets or modify existing Teztnets

Each Teztnet is defined within a subdirectory of the `/networks` directory in this repository. The Teztnet directory must contain the following files:

- A Helm chart `values.yaml` file
- Optionally, a Helm chart `faucet_values.yaml` file if deploying a faucet
- Optionally, a submodule of tezos-k8s (in case you need an unreleased or custom version of the tezos-k8s software)

### Helm chart values.yaml

The Helm chart values.yaml lets you customize your chain in many ways:

- specify activation parameters, such as:
  - list of genesis bakers
  - list of accounts funded at genesis
  - chains parameters (blocks per cycle, time between blocks...)
- specify user-activated upgrades for hard-forks at a given length
- specify the list of baker/endorser binaries to run.

Look in any Teztnet directory's values.yaml file in [`/networks`](/networks) for reference as to how to configure your own Teztnet.

The [default Helm values.yaml](https://github.com/oxheadalpha/tezos-k8s/blob/master/charts/tezos/values.yaml) has details on every possible way to customize your teztnet.

## Teztnets.xyz website

The website is created with Jekyll from Markdown files generated from Jinja templates based on Pulumi outputs.

To build the website locally, from the top-level dir of the repo:

1. run `pulumi stack output networks > networks.json`
1. run `pulumi stack output teztnets > teztnets.json`
1. run `python src/release.py`
1. `cd target/release`
1. run `bundle install`
1. run `bundle exec jekyll serve`

The website will be rendered on `localhost:4000`.
