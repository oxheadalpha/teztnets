import * as k8s from "@pulumi/kubernetes"
import {
  local
} from "@pulumi/command"
import * as pulumi from "@pulumi/pulumi";
import { Output } from "@pulumi/pulumi"

/**
 * Generates JSON of cluster resources, verbs, apis, and whether they are namespaced or not.
 * @returns jsonObj
 */
function getExistingK8sResources(kubeconfig: string){
  // Generate list of valid resources names
  const getK8sApiOutput = new local.Command("get-k8s-api-output", {
    create: `
    echo $KUBECONFIG_CONTENT > kubeconfig \
    && kubectl api-resources --no-headers -o wide`,
    environment: {
      KUBECONFIG: `kubeconfig`,
      KUBECONFIG_CONTENT: kubeconfig
    },
    update: ""
  },{deleteBeforeReplace: true, replaceOnChanges: ["*"] });

  const output = getK8sApiOutput.stdout;

  let jsonObj: any = {}
  const jsonObjOutput = output.apply(row => {
    if(row === undefined){
      pulumi.log.error(`
getK8sApiOutput.stdout is undefined!
For some reason the getK8sApiOutput command stdout did not succeed and provided no error.
What fixes this is making a valid change to the create section and rerun pulumi up.
For example adding KUBECONFIG=kubeconfig to the beginning of the kubectl command.
      `)
    }
    row.split("\n").forEach(function (row) {
      const splitRow = row.match(/"[^"]*"|\[[^\][]*]|[^\s\][]+/g)
      //
        const resourceName = splitRow![0]

        // if resource has a shortname skip it
        var columnModifier = 0
        if (splitRow!.length == 6) {
          columnModifier++
        }

        const resourceApi = splitRow![1 + columnModifier]
        const namespaced = splitRow![2 + columnModifier]
        const resourceVerbs = splitRow![4 + columnModifier]?.replace(/[\[\]']+/g,'').split(/[ ,]+/)
        const verbs: string[] = []
        resourceVerbs.forEach(verb => {
          verbs.push(verb)
        });

        jsonObj[resourceName] = {
          api: resourceApi,
          verbs: verbs,
          namespaced: namespaced
        }
      //}
    })
    // const output = pulumi.output(jsonObj)
    return jsonObj
  })
  // const jsonObjOutput = output //deleteme
  return jsonObjOutput
}

type k8sPermissions = {
  resources: {
    [key: string]: {
      verbs: {
        name: string
        action: string
      }
    }
  },
  namespaces: {
    [key: string]: {
      action: string
    }
  }
};

// Creates ClusterRole/s/Role/s and/or ClusterRolebinding/RoleBinding allowing or excluding
// permissions to resources, verbs, and namespaces.
export function createK8sRbacRoleObject(namespaces: string[], k8sRbacPermissionsObject: k8sPermissions, roleName: string, clusterProvider: k8s.Provider, kubeconfig: string) {

  // const existingK8sResources=pulumi.interpolate`${getExistingK8sResources()}`

  const validVerbs = [
    "create",
    "delete",
    "deletecollection",
    "get",
    "list",
    "patch",
    "update",
    "watch",
  ]

  // const existingNamespaces=pulumi.interpolate`${getNamespaces()}`
  getExistingK8sResources(kubeconfig).apply(existingK8sResources=> {
    // namespaces.apply(existingNamespaces=> {
      // getVerbs(kubeconfig).apply(existingVerbs=> {

        // Switched to true if namespaced resource is requested or namespce is denied
        // This will bind a Role Binding to the Cluster Role in order to restrict
        // access per namespace
        let needRoleBinding: boolean = false

        // Get namespaces denied or allowed and compare to existing namespaces
        // Construct list of allowed namespaces
        const requestedNamespacesObject = k8sRbacPermissionsObject.namespaces
        const availableNamespaces = namespaces
        let allowedNamespaces = availableNamespaces // Allow all namespaces by default
        Object.entries(requestedNamespacesObject).forEach(function (namespaceEntriesArray){
          const [namespaceName, actionObject] = namespaceEntriesArray
          if(actionObject.action=="deny"){ // Delete namespace from list if denied
            needRoleBinding = true // We will need a Role Binding if not all namespaces are allowed
            if(availableNamespaces.includes(namespaceName)){
              allowedNamespaces.splice(allowedNamespaces.indexOf(namespaceName), 1) // Deletes namespace from list
            } else {
              pulumi.log.error(`Namespace ${namespaceName} does not exist in cluster.  Valid namespaces include ${availableNamespaces}.`)
            }
          }
          // if(actionObject.action!="deny" && actionObject.action!="allow" ){
          //   throwInvalidActionError(actionObject.action,"namespace",namespaceName)
          // }
        })

        const validResources = Object.keys(existingK8sResources)
        let allowedResources = validResources
        //const validVerbs = existingVerbs.split("\n")
        let allowedVerbs = ["*"] // Initialize for deny, and overwrite with * for all.
        let allVerbs: boolean = false
        let specificVerbs: any = []

        //////////

        // Iterates over each requested resource name in k8sRbacPermissionsObject
        Object.entries(k8sRbacPermissionsObject.resources).forEach(function (resourceEntriesArray: any) {
          const [resourceName, verbsObject] = resourceEntriesArray

          // Iterates over an object's requested verb names and actions.
          Object.entries(verbsObject).forEach(function (verbsArray: any) {
            const [verbsObjectKey, verb] = verbsArray
            if(verb.name=="all"){  // all verbs
              allVerbs=true
              if(verb.action=="deny"){ // deny
                if(validResources.includes(resourceName)){
                  allowedResources.splice(allowedResources.indexOf(resourceName),1) // Deletes resource from resource list
                } else {
                  pulumi.log.error(`Resource ${resourceName} does not exist in the cluster. Valid resources are ${validResources}`)
                }
              } else if (verb.action=="allow" && verb.action!="deny"){
                pulumi.log.error(`Verb action ${verb.action} is not valid on resource ${resourceName}. Valid verb actions are "allow" and "deny".`)
              }
            } else { // verb name not all
              if (validVerbs.includes(verb.name)){ // check if it a valid verb name
                specificVerbs.push(verb.name)
              } else {
                pulumi.log.error(`Verb name ${verb.name} is not valid on resource ${resourceName}. Valid verb actions are "all", and ${validVerbs}.`)
              }
            }
          })
        })
        if(!allVerbs){
          allowedVerbs = specificVerbs
        }

        const clusterRole = new k8s.rbac.v1.ClusterRole(`${roleName}-cluster-role`, {
          metadata: {
            name: `${roleName}-cluster-role`,
          },
          rules: [{
            apiGroups: ["*"],
            resources: allowedResources,
            verbs: allowedVerbs,
          }]
        }, {provider: clusterProvider});

        let roleBindings = []

        // If rolebinding was set create a role for each namespace
        if(needRoleBinding){
          allowedNamespaces.forEach(function (namespace) {
            const roleBinding = new k8s.rbac.v1.RoleBinding(`${roleName}-${namespace}-role-binding`, {
              metadata: {
                name: `${roleName}-${namespace}-rolebinding`,
                namespace: namespace,
              },
              subjects: [{
                  kind: "User",
                  name: `${roleName}-usr`,
                  apiGroup: "rbac.authorization.k8s.io",
              }],
              roleRef: {
                kind: "ClusterRole",
                name: clusterRole.metadata.name,
                apiGroup: "rbac.authorization.k8s.io",
              },
            }, {provider: clusterProvider});

            roleBindings.push(roleBinding)
          })
        // Otherwise create a  Cluster Role Binding and bind it to our Cluster Role
        } else {
          const clusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding(`${roleName}-cluster-role-binding`, {
            metadata: {
              name: `${roleName}-cluster-role-binding`,
            },
            subjects: [{
                kind: "User",
                name: `${roleName}-usr`,
            }],
            roleRef: {
              kind: "ClusterRole",
              name: clusterRole.metadata.name,
              apiGroup: "rbac.authorization.k8s.io",
            },
          }, {provider: clusterProvider});

          roleBindings.push(clusterRoleBinding)
        }
    //  })
    })
  // })

}

/**
 * Creates a Kubernetes ClusterRoleBinding that targets a ClusterRole.
 *
 * Great for creating a ClusterRoleBinding for the cluster-admin ClusterRole
 *   in lieu of system:masters.
 *
 * Can be used in the username field of the rolemappings property for a Kubernetes Cluster.
 *
 * @param targetClusterRole Target Kubernetes ClusterRole that the ClusterRoleBinding will reference.
 * @returns clusterRoleBinding Can be used in roleMappings field for cluster. Used to provide permissions
 * over K8s resources for authenticated users.
 */
export function createClusterAdminAuth(name: string, clusterProvider: k8s.Provider) {
  // const provider = new k8s.Provider("k8s-provider", {
  //   kubeconfig: sensitiveClusterKubeconfig
  // })
  const clusterRole: k8s.rbac.v1.ClusterRole = new k8s.rbac.v1.ClusterRole(`${name}`, {
    metadata: {
      name: `${name}`,
    },
    rules: [{
      apiGroups: ["*"],
      resources: ["pods"],
      verbs: ["*"],
    }]
  },{provider: clusterProvider});

  const clusterRoleBinding: k8s.rbac.v1.ClusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding(`${name}`, {
    metadata: {
      name: `${name}`,
    },
    subjects: [{
      kind: "User",
      name: `${name}`,
    }],
    roleRef: {
      kind: "ClusterRole",
      name: `${name}`,
      apiGroup: "rbac.authorization.k8s.io",
    },
  },{provider: clusterProvider});

}
