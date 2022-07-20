const names = [
    'Adam',
    'Beth',
    'Charles',
    'Dabby',
    'Evan',
    'Fiona',
    'George',
    'Helen',
    'Issac',
    'Jane',
    'Kayden',
    'Laura',
    'Mike',
    'Nico',
    'Oscar',
    'Penny',
    'Quinto',
    'Rose',
    'Steven',
    'Tracy',
    'Ulysses',
    'Vivian',
    'Will',
    'Xavia',
    'Yuri',
    'Zoey',
];

export const layouts = {
    'Concentric': {
        name: 'concentric',
        concentric: (n) => { 0; },
        levelWidth: (nodes) => { return 100; },
        minNodeSpacing: 100,
    },
    'Dagre': {
        name: 'dagre',
    },
    'fCoSE': {
        name: 'fcose',
    },
    'Klay': {
        name: 'klay',
    },
    'Random': {
        name: 'random',
    },
};
export const defaultLayout = 'Dagre';

export const cy = cytoscape({
    container: document.getElementById('graph'),

    layout: layouts[defaultLayout],

    style: [
        {
            selector: 'node[data], edge[data]',
            style: {
                'label': 'data(data)',
            },
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
            },
        },
        {
            selector: '.eh-handle',
            style: {
                'background-color': 'red',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12, // makes the handle easier to hit
                'border-opacity': 0,
            },
        },
        {
            selector: '.eh-hover',
            style: {
                'background-color': 'red',
            },
        },
        {
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        {
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red',
            },
        },
        {
            selector: '.eh-ghost-edge.eh-preview-active',
            style: {
                'opacity': 0,
            },
        },
        {
            selector: 'node, edge',
            style: {
                'transition-property': 'background-color, line-color, target-arrow-color',
                'transition-duration': '0.25s',
            },
        },
        {
            selector: '.highlighted',
            style: {
                'background-color': '#61bffc',
                'line-color': '#61bffc',
                'target-arrow-color': '#61bffc',
            },
        },
    ],

    elements: {
        nodes: [
            { data: { id: 0, data: names[0] } },
            { data: { id: 1, data: names[1] } },
            { data: { id: 2, data: names[2] } },
            { data: { id: 3, data: names[3] } },
            { data: { id: 4, data: names[4] } },
            { data: { id: 5, data: names[5] } },
            { data: { id: 6, data: names[6] } },
            { data: { id: 7, data: names[7] } },
        ],
        edges: [
            { data: { source: 0, target: 1 } },
            { data: { source: 0, target: 2 } },
            { data: { source: 1, target: 2 } },
            { data: { source: 1, target: 3 } },
            { data: { source: 3, target: 4 } },
            { data: { source: 4, target: 5 } },
            { data: { source: 5, target: 6 } },
            { data: { source: 1, target: 7 } },
        ],
    },
});

export const eh = cy.edgehandles({
    canConnect(sourceNode, targetNode) {
        return true;
    },
    edgeParams(sourceNode, targetNode) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        return {};
    },
    hoverDelay: 0, // time spent hovering over a target node before it is considered selected
    snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
    noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
    disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
});

eh.enableDrawMode();

const nameSet = new Set(names);
const remainingNames = new Set(names);
let id = cy.nodes().length;
let newNodesEnabled = true;

for (let node of cy.nodes()) {
    remainingNames.delete(node.data().data);
}

export function setNewNodesEnabled(value) {
    newNodesEnabled = value;
}

cy.on('tap', (evt) => {
    if (!newNodesEnabled) {
        return;
    }

    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    if (tgt !== cy) {
        return;
    }

    let name = remainingNames.values().next().value;
    if (name) {
        remainingNames.delete(name);
    } else {
        name = 'New';
    }

    cy.add({
        data: { id: id++, data: name },
        position: {
            x: evt.position.x,
            y: evt.position.y,
        },
    });
});

cy.on('dbltap', 'node', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    const data = prompt('Node data', tgt.data().data);
    tgt.data('data', data);
});

cy.on('dbltap', 'edge', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    const data = prompt('Edge data', tgt.data().data);
    tgt.data('data', data);
});

cy.on('cxttap', 'node', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    const data = tgt.data().data;
    if (nameSet.has(data)) {
        remainingNames.add(data);
    }
    tgt.remove();
});

cy.on('cxttap', 'edge', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    tgt.remove();
});
