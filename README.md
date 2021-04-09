# Teztnets

Infrastructure-as-code repo to deploy tezos testnets in a repeatable, automated way.

## Differences with tqinfra

* repo is public
* we define vpc manually. This is necessary to ensure that the proper tags will be present to allow application load balancing. It may cause 2 vpcs to be created. Note that we don't need ALB for a teztnet for now, but tqinfra needed it and I added the tags manually there.
* we don't deploy from submodules (for now), we deploy from a release version of tezos-k8s
* the component resource has been renamed to tezosK8s (since PrivateChain name is not always accurate)

## TODO

This repo is untested and probably contains bugs as of this commit.

First thing is to set us up with Pulumi enterprise so all of us can do `pulumi preview` from working directory on laptop.

Deploy the teztnet with github actions. Make sure it works at least as well as tqinfra

Add network load balancers for public access.

Add route53 automation so the testnets deployed here would be exposed by <teztnetname>.tznode.net

Automate creation of json snipplets to pass to tezos `--network` argument for easy teztnet deployment.

## Prototype

We will start with a basic `mondaynet` with just 2 entities creating blocks: us and ecadlabs.

`mondaynet` is a weekly, short-lived testnet that boots every sunday night/monday morning with the most recent protocol alpha in tezos/tezos master.
