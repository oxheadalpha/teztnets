#!/bin/python
import json
import shutil
import jinja2
import docker

shutil.copytree("src/website", "target/release")

teztnets = {}
with open("./teztnets.json", 'r') as teztnets_file:
    teztnets = json.load(teztnets_file)

networks = {}
with open("./networks.json", 'r') as networks_file:
    networks = json.load(networks_file)

for network_name in networks:
    with open(f"target/release/{network_name}", "w") as out_file:
        print(json.dumps(networks[network_name]), file=out_file)

for teztnet_name in teztnets:
    docker_build = teztnets[teztnet_name]["docker_build"]
    if docker_build == "tezos/tezos:master":
        # replace master tag with a permanent reference as of release time
        client = docker.from_env()
        regdata = client.images.get_registry_data("tezos/tezos:master")
        docker_build = f"tezos/tezos@{regdata.id}"
        teztnets[teztnet_name]["docker_build"] = docker_build

index = jinja2.Template(open('src/release_notes.md.jinja2').read()).render(teztnets=teztnets)
with open("target/release-notes.markdown", "w") as out_file:
    print(index, file=out_file)
with open("target/release/index.markdown", "a") as out_file:
    print(index, file=out_file)
with open("target/release/teztnets.json", "w") as out_file:
    print(json.dumps(teztnets), file=out_file)
