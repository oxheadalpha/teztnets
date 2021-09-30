#!/bin/python
import json
import shutil
import jinja2

shutil.copytree("src/website", "target/release", dirs_exist_ok=True)

teztnets = {}
with open("./teztnets.json", 'r') as teztnets_file:
    teztnets = json.load(teztnets_file)

networks = {}
with open("./networks.json", 'r') as networks_file:
    networks = json.load(networks_file)

for network_name in networks:
    with open(f"target/release/{network_name}", "w") as out_file:
        print(json.dumps(networks[network_name]), file=out_file)

# group by category for human rendering
nested_teztnets = {}
for k,v in teztnets.items():
    if v["category"] not in nested_teztnets:
        nested_teztnets[v["category"]] = {}
    nested_teztnets[v["category"]][k] = v

index = jinja2.Template(open('src/release_notes.md.jinja2').read()).render(teztnets=nested_teztnets)
with open("target/release-notes.markdown", "w") as out_file:
    print(index, file=out_file)
with open("target/release/index.markdown", "a") as out_file:
    print(index, file=out_file)
with open("target/release/teztnets.json", "w") as out_file:
    print(json.dumps(teztnets), file=out_file)
