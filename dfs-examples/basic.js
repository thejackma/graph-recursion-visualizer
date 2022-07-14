const visited = new Set();

for (let node of nodes) {
    dfs(node);
}

function dfs(node) {
    if (visited.has(node.id())) {
        return;
    }

    // DFS:in

    visited.add(node.id());

    for (let outgoer of node.outgoers('edge')) {
        dfs(outgoer.target());
    }

    // DFS:out
}
