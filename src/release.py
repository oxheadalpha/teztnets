#!/bin/python
import json
import os
import shutil
import yaml
import jinja2

shutil.copytree("src/website", "target/release")

teztnets = {}
for network in [ f.path for f in os.scandir(".") if f.is_dir() and f.path[:3] != "./." and
        f.path not in ["./node_modules", "./target", "./src", "./bootstrap_contracts", "./bootstrap_commitments"] ]:
    with open(f"{network}/values.yaml", 'r') as stream:
        network_values = yaml.safe_load(stream)
    node_config_network = network_values["node_config_network"]
    network_name = network.split('./')[1]

    # genesis_pubkey is the public key associated with the $TEZOS_BAKING_KEY private key in github secrets
    # TODO: generate it dynamically based on privkey
    genesis_pubkey = "edpkuix6Lv8vnrz6uDe1w8uaXY7YktitAxn6EHdy2jdzq5n5hZo94n"

    with open(f"{network}/metadata.yaml", 'r') as stream:
        network_metadata = yaml.safe_load(stream)

    default_bootstrap_peers = network_metadata["public_bootstrap_peers"]
    default_bootstrap_peers.insert(0, f"{network_name}.tznode.net")

    network_config = node_config_network
    network_config.pop("activation_account_name")
    network_config["sandboxed_chain_name"] = "SANDBOXED_TEZOS"
    network_config["default_bootstrap_peers"] = default_bootstrap_peers
    network_config["genesis_parameters"] = {
                "values": {
                    "genesis_pubkey": genesis_pubkey
                    }
                }

    with open(f"target/release/{network_name}", "w") as out_file:
        print(json.dumps(network_config), file=out_file)
    teztnets[network_name] = { "chain_name": node_config_network["chain_name"],
            "network_url": f"https://teztnets.xyz/{network_name}",
            "description": network_metadata["description"],
            "docker_build": network_values["images"]["tezos"] }
    if "protocols" in network_values:
        teztnets[network_name]["command"] = ", ".join([ p["command"] for p in network_values["protocols"]])
    else:
        teztnets[network_name]["command"] = network_values["protocol"]["command"]

index = jinja2.Template(open('src/release_notes.md.jinja2').read()).render(teztnets=teztnets)
with open("target/release-notes.markdown", "w") as out_file:
    print(index, file=out_file)
with open("target/release/index.markdown", "a") as out_file:
    print(index, file=out_file)
with open("target/release/teztnets.json", "w") as out_file:
    print(json.dumps(teztnets), file=out_file)
