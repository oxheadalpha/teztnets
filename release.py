#!/bin/python
import json
import os
import json
import yaml

os.makedirs("target/release", exist_ok=True)

for network in [ f.path for f in os.scandir(".") if f.is_dir() and f.path[:3] != "./." and f.path != "./node_modules" and f.path != "./target" ]:
    with open(f"{network}/values.yaml", 'r') as stream:
        network_values = yaml.safe_load(stream)
    node_config_network = network_values["node_config_network"]
    network_name = network.split('./')[1]

    # genesis_pubkey is the public key associated with the $TEZOS_BAKING_KEY private key in github secrets
    # TODO: generate it dynamically based on privkey
    genesis_pubkey = "edpkuix6Lv8vnrz6uDe1w8uaXY7YktitAxn6EHdy2jdzq5n5hZo94n"

    network_config = { "sandboxed_chain_name": "SANDBOXED_TEZOS",
            "chain_name": node_config_network["chain_name"],
            "default_bootstrap_peers": [ f"{network_name}.tznode.net" ],
            "genesis": node_config_network["genesis"],
            "genesis_parameters": {
                "values": {
                    "genesis_pubkey": genesis_pubkey
                    }
                }
            }

    with open(f"target/release/{network_name}", "w") as out_file:
        print(json.dumps(network_config), file=out_file)
