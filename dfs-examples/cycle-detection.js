const Status = {
    PENDING: 1,
    COMPLETE: 2,
};

const status = {};

for (const node of nodes) {
    if (hasCycle(node)) {
        return true;
    }
}

function hasCycle(node) {
    if (status[node.id()]) {
        return status[node.id()] === Status.PENDING;
    }

    // DFS:in

    status[node.id()] = Status.PENDING;

    for (const nextNode of node.outgoers('node')) {
        if (hasCycle(nextNode)) {
            // DFS:out
            return true;
        }
    }

    status[node.id()] = Status.COMPLETE;

    // DFS:out
    return false;
}
