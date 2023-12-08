#!/bin/python
import json
import os
import shutil
import jinja2

shutil.copytree("teztnets_xyz_page/website", "target/release", dirs_exist_ok=True)

teztnets = {}
with open("./teztnets.json", "r") as teztnets_file:
    teztnets = json.load(teztnets_file)

networks = {}
with open("./networks.json", "r") as networks_file:
    networks = json.load(networks_file)

for network_name in networks:
    with open(f"target/release/{network_name}", "w") as out_file:
        print(json.dumps(networks[network_name], indent=2), file=out_file)

# group by category for human rendering
# Order manually. Start with long-running.
category_desc = {
    "Long-running Teztnets": "If you are not sure, pick this one.",
    "Protocol Teztnets": "Testnets deployed specifically to test new Tezos protocol proposals.",
    "Periodic Teztnets": "Testnets that restart regularly and track the development of the master branch of [Octez repo](https://gitlab.com/tezos/tezos/).\n \n☠️ You probably don't want this unless you are a core protocol developer.",
}

nested_teztnets = {
    "Long-running Teztnets": {},
    "Protocol Teztnets": {},
    "Periodic Teztnets": {},
}

for k, v in teztnets.items():
    if v["masked_from_main_page"]:
        continue
    if v["category"] not in nested_teztnets:
        nested_teztnets[v["category"]] = {}
    nested_teztnets[v["category"]][k] = v
    nested_teztnets[v["category"]][k]["activated_on"] = networks[k]["genesis"][
        "timestamp"
    ].split("T")[0]

index = jinja2.Template(open("teztnets_xyz_page/index.md.jinja2").read()).render(
    teztnets=nested_teztnets, category_desc=category_desc
)

with open("target/release/index.markdown", "a") as out_file:
    print(index, file=out_file)
with open("target/release/teztnets.json", "w") as out_file:
    print(json.dumps(teztnets, indent=2), file=out_file)

for k, v in teztnets.items():
    if k == "mainnet":
        continue

    v["release"] = None
    if "tezos/tezos:v" in v["docker_build"]:
        v["release"] = v["docker_build"].split("tezos/tezos:")[1]
    v["docker_build_hyperlinked"] = v["docker_build"]

    if v["docker_build"].startswith("tezos/tezos"):
        # build from docker hub, providing a link
        v["docker_build_hyperlinked"] = (
            "["
            + v["docker_build"]
            + "](https://hub.docker.com/r/tezos/tezos/tags?page=1&ordering=last_updated&name="
            + v["docker_build"].replace("tezos/tezos:", "")
            + ")"
        )

    v["git_repo"] = "git@gitlab.com:tezos/tezos.git"

    readme = ""

    readme_path = f"networks/{k.split('-')[0]}/README.md"
    if os.path.exists(readme_path):
        with open(readme_path) as readme_file:
            readme = readme_file.read()

    teztnet_md = jinja2.Template(open("teztnets_xyz_page/teztnet_page.md.jinja2").read()).render(
        k=k, v=v, network_params=networks[k], readme=readme
    )

    with open(
        f"target/release/{v['human_name'].lower()}-about.markdown", "w"
    ) as out_file:
        print(teztnet_md, file=out_file)
