#!/bin/python
import json
import os
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
# Order manually. Start with long-running.
category_desc = {"Protocol Teztnets":"Testnets deployed specifically to test new Tezos protocol proposals.",
        "Periodic Teztnets": "Testnets that restart regularly and track the development of the master branch of [Octez repo](https://gitlab.com/tezos/tezos/)." }
nested_teztnets = {"Protocol Teztnets":{}}
for k,v in teztnets.items():
    if v["masked_from_main_page"]:
        continue
    if v["category"] not in nested_teztnets:
        nested_teztnets[v["category"]] = {}
    nested_teztnets[v["category"]][k] = v
    nested_teztnets[v["category"]][k]["activated_on"] = networks[k]["genesis"]["timestamp"].split("T")[0]

index = jinja2.Template(open('src/release_notes.md.jinja2').read()).render(teztnets=nested_teztnets, category_desc=category_desc)
with open("target/release-notes.markdown", "w") as out_file:
    print(index, file=out_file)
with open("target/release/index.markdown", "a") as out_file:
    print(index, file=out_file)
with open("target/release/teztnets.json", "w") as out_file:
    print(json.dumps(teztnets), file=out_file)

for k,v in teztnets.items():
    # guessing git version based on docker naming convention (could fail later)
    v["git_ref"] = v["docker_build"].split(":")[1]
    if "master_" in v["docker_build"]:
       v["git_ref"] = v["git_ref"].split("_")[1]
    readme = ""
    if os.path.exists(f"{k.split('-')[0]}/README.md"):
        with open(f"{k.split('-')[0]}/README.md") as readme_file:
            readme = readme_file.read()
    teztnet_md = jinja2.Template(open('src/teztnet_page.md.jinja2').read()).render(k=k,v=v, network_params=networks[k], readme=readme)
    faucet_md = jinja2.Template(open('src/teztnet_faucet.md.jinja2').read()).render(k=k,v=v, faucet_recaptcha_site_key=os.environ["FAUCET_RECAPTCHA_SITE_KEY"])
    with open(f"target/release/{k}-about.markdown", "w") as out_file:
        print(teztnet_md, file=out_file)
    with open(f"target/release/{k}-faucet.markdown", "w") as out_file:
        print(faucet_md, file=out_file)
