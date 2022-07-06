function run(nodes) {
    const operations = [];

    const COMPLETE = "COMPLETE";
    const status = {};

    function dfs(node) {
        if (status[node.id()]) {
            return;
        }

        operations.push({
            type: 'push',
            node,
        });

        status[node.id()] = COMPLETE;

        for (let outgoer of node.outgoers('edge')) {
            dfs(outgoer.target());
        }

        operations.push({
            type: 'pop',
            node,
        });
    }

    for (let node of nodes) {
        dfs(node);
    }

    return operations;
}
