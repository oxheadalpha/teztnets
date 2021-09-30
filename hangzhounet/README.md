# Hangzhounet

This folder contains the yaml file that was used to activate hangzhounet.

## Post-mortem

Here are notes in what went well in hangzhounet deployment, what went not so well. 4 months is a lot of time to forget things, so better keep them documented.

### Zero faucets

Chain was initially instantiated with zero faucets. Despite having the faucet creation infrastructure all automated, I mistakenly copied `number_of_faucets=0` from Granadanet. Nomadic helped me reactivate the chain by pushing an activation block with a higher fitness.

No action needed: when doing I network launch, I will be copy-pasting from H which now has the currect number of faucets.

### Wait until baking the network parameters into tezos-node binary

It is probably better to let bootstrap bakers gather their parameters from `--network https://teztnets.xyz/blah` for a while. This would allow for emergency network restarts, where the bakers just have to reboot the node to pick up the new, correct chain. Only one release later should the chain params be hardcoded.

### Wrong value for bootstrap paran

`"hard_storage_limit_per_operation":"32768"`: should have been 60000.

TODO: for next network, verify that every parameter matches mainnet.

### Too high balance for bakers

Considering we had 18 bootstrap bakers, 2 million tez per baker would have been enough. We gave 5 million to everyone, so it will be hard for the newcomers to become bakers and get a lot of rights by just using the faucet.

### Fresh genesis hash

I re-used the genesis block has from Granadanet but Romain [corrected me](https://github.com/oxheadalpha/teztnets/pull/51#discussion_r713088372).

It is better to generate a new hash. Must understand how to do it, and maybe find ways to automate new hash creation.

The [PR](https://github.com/oxheadalpha/teztnets/pull/51) has more comments from Romain.

### Block 0 protocol should be mainnet

Our block 0 is alays `PtYuensgYBb3G3x1hLLbCmcav8ue8Kyd2khADcL5LsT5R1hcXex` which is the proto genesis of carthagenet. Instead, we should switch to using mainnet's genesis proto `proto_000_Ps9mPmXa`. We will do it first in dailynet/mondaynet and if it works, do I network this way.

### Faucet should have a manual

The faucet has no explanation whatsoever on how to use it. Fix this.
