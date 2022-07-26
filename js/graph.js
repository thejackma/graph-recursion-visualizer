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

const layouts = {
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
const defaultLayout = 'Dagre';

function getLabel(data) {
    if (!data) {
        return null;
    }
    const name = data.hasOwnProperty('name') ? data.name : '';
    const weight = data.hasOwnProperty('weight') ? `: ${data.weight}` : '';
    return `${name}${weight}`;
}

export const cy = cytoscape({
    container: document.getElementById('graph'),

    layout: layouts[defaultLayout],

    style: [
        {
            selector: 'node[label], edge[label]',
            style: {
                'label': 'data(label)',
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
        nodes: _.range(8).map(i => {
            const data = {
                name: names[i],
                weight: i,
            };
            return {
                data: {
                    id: i,
                    data,
                    label: getLabel(data),
                },
            };
        }),
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

const eh = cy.edgehandles({
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

function safeParseInt(s) {
    try {
        return parseInt(s);
    } catch (e) {
        return s;
    }
}

export const graphControls = Vue.createApp({
    data() {
        eh.enableDrawMode();

        return {
            enabled: true,
            drawMode: 'Connect',
            drawModePrev: null,
            newNodesEnabled: true,
            newNodesEnabledPrev: null,
            layoutNames: Object.keys(layouts),
            selectedLayoutName: defaultLayout,
            directed: true,
            viewSource: false,
            graphSourceControls: null,
        };
    },
    computed: {
        disabled() {
            return !this.enabled;
        },
    },
    watch: {
        drawMode(newValue, oldValue) {
            if (newValue === 'Connect') {
                eh.enableDrawMode();
            } else {
                eh.disableDrawMode();
            }
        },
        directed(newValue, oldValue) {
            const shape = newValue ? 'triangle' : 'none';
            cy.style().selector('edge').style({
                'target-arrow-shape': shape,
            }).update();
        },
        viewSource(newValue, oldValue) {
            if (newValue) {
                const source = this.serialize();
                this.graphSourceControls.show(source);
            } else {
                this.graphSourceControls.hide();
            }
        },
    },
    methods: {
        applyLayout() {
            cy.layout(layouts[this.selectedLayoutName]).run();
        },
        selectLayout(layoutName) {
            this.selectedLayoutName = layoutName;
            this.applyLayout();
        },
        disable() {
            if (!this.enabled) {
                return;
            }
            this.enabled = false;
            this.drawModePrev = this.drawMode;
            this.drawMode = 'Move';
            this.newNodesEnabledPrev = this.newNodesEnabled;
            this.newNodesEnabled = false;
        },
        enable() {
            if (this.enabled) {
                return;
            }
            this.enabled = true;
            this.drawMode = this.drawModePrev;
            this.newNodesEnabled = this.newNodesEnabledPrev;
        },
        serialize() {
            const digraph = new graphlib.Graph();

            for (const node of cy.nodes()) {
                const id = safeParseInt(node.id());
                const data = node.data().data;
                if (data && data.hasOwnProperty('weight')) {
                    data.weight = safeParseInt(data.weight);
                }
                digraph.setNode(id, data);
            }

            for (const edge of cy.edges()) {
                const source = safeParseInt(edge.source().id());
                const target = safeParseInt(edge.target().id());
                const data = edge.data().data;
                if (data && data.hasOwnProperty('weight')) {
                    data.weight = safeParseInt(data.weight);
                }
                digraph.setEdge(source, target, data);
            }

            return graphlibDot.write(digraph);
        },
        deserialize(source) {
            const graph = graphlibDot.read(source);
            const nodes = [];
            const edges = [];

            for (const id of graph.nodes()) {
                const data = graph.node(id);
                nodes.push({
                    data: {
                        id,
                        data,
                        label: getLabel(data),
                    },
                });
            }

            for (const edge of graph.edges()) {
                const data = graph.edge(edge.v, edge.w);
                edges.push({
                    data: {
                        source: edge.v,
                        target: edge.w,
                        data: data,
                        label: getLabel(data),
                    },
                });
            }

            const elements = {
                nodes,
                edges,
            };

            cy.remove(cy.elements());
            cy.add(elements);
            this.applyLayout();
        },
        setGraphSourceControls(value) {
            this.graphSourceControls = value;
        },
    },
}).mount('#graph-controls');

const nameSet = new Set(names);
const remainingNames = new Set(names);
let id = cy.nodes().length;

for (let node of cy.nodes()) {
    remainingNames.delete(node.data().data.name);
}

cy.on('tap', (evt) => {
    if (!graphControls.newNodesEnabled) {
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
        data: { id: id++, data: { name: name } },
        position: {
            x: evt.position.x,
            y: evt.position.y,
        },
    });
});

function doubleTap(evt) {
    if (graphControls.disabled) {
        return;
    }

    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    const dataStr = prompt('Data', JSON.stringify(tgt.data().data));
    if (dataStr == null) {
        return;
    }
    let data;
    try {
        data = JSON.parse(dataStr);
        if (typeof data !== 'object') {
            data = { name: dataStr };
        }
    } catch (e) {
        data = { name: dataStr };
    }
    tgt.data('data', data);
    tgt.data('label', getLabel(data));
}

cy.on('dbltap', 'node', doubleTap);
cy.on('dbltap', 'edge', doubleTap);

cy.on('cxttap', 'node', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    const name = tgt.data().data.name;
    if (nameSet.has(name)) {
        remainingNames.add(name);
    }
    tgt.remove();
});

cy.on('cxttap', 'edge', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    tgt.remove();
});
