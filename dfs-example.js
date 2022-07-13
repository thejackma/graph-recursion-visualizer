const COMPLETE = "COMPLETE";
const status = {};

function dfs(node) {
    if (status[node.id()]) {
        return;
    }

    // DFS:in

    status[node.id()] = COMPLETE;

    for (let outgoer of node.outgoers('edge')) {
        dfs(outgoer.target());
    }

    // DFS:out
}

for (let node of nodes) {
    dfs(node);
}
