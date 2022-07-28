for (const node of nodes) {
    dfs(node);
}

function dfs(node) {
    if (visited.has(node.id())) {
        return;
    }

    // DFS:in

    visited.add(node.id());

    for (const nextNode of node.outgoers('node')) {
        dfs(nextNode);
    }

    // DFS:out
}
