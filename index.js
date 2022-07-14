import * as Vue from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.js';
import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';
import Split from 'https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm';

async function main() {
    Split({
        minSize: 1,
        columnGutters: [
            {
                track: 1,
                element: document.querySelector('.gutter-col-1'),
            },
            {
                track: 3,
                element: document.querySelector('.gutter-col-3'),
            },
        ],
        onDragEnd() {
            //TODO: save layout
        },
    });

    let exampleResp = await fetch('dfs-examples/basic.js');
    let example = await exampleResp.text();

    let editor = monaco.editor.create(document.getElementById('editor'), {
        value: example,
        language: 'javascript',
        automaticLayout: true,
    });

    let id = 0;

    let layouts = {
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

    const cy = cytoscape({
        container: document.getElementById('graph'),

        layout: layouts['Dagre'],

        style: [
            {
                selector: 'node[name]',
                style: {
                    'content': 'data(name)',
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
                { data: { id: ++id, name: 'Adam' } },
                { data: { id: ++id, name: 'Barry' } },
                { data: { id: ++id, name: 'Charles' } },
                { data: { id: ++id, name: 'Danny' } },
                { data: { id: ++id, name: 'Elena' } },
            ],
            edges: [
                { data: { source: 1, target: 2 } },
                { data: { source: 1, target: 3 } },
                { data: { source: 2, target: 3 } },
                { data: { source: 2, target: 4 } },
                { data: { source: 2, target: 5 } },
            ],
        },
    });

    const defaults = {
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
    };

    const eh = cy.edgehandles(defaults);

    eh.enableDrawMode();

    const graphControls = Vue.createApp({
        data() {
            return {
                clickToCreateNodeEnabled: true,
                layouts: Object.keys(layouts),
                selectedLayout: 'Dagre',
            };
        },
        methods: {
            move() {
                eh.disableDrawMode();
            },
            connect() {
                eh.enableDrawMode();
            },
            applyLayout() {
                cy.layout(layouts[this.selectedLayout]).run();
            },
            selectLayout(layout) {
                this.selectedLayout = layout;
                this.applyLayout();
            },
        },
    }).mount('#graph-controls');

    for (let dropdownToggle of document.querySelectorAll('.dropdown-toggle')) {
        new bootstrap.Dropdown(dropdownToggle);
    }

    let grid = document.querySelector('.grid');
    for (let dropdownMenu of document.querySelectorAll('ul.dropdown-menu')) {
        grid.after(dropdownMenu);
    }

    cy.on('tap', (evt) => {
        if (!graphControls.clickToCreateNodeEnabled) {
            return;
        }

        var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
        if (tgt !== cy) {
            return;
        }

        cy.add({
            data: { id: ++id, name: id },
            position: {
                x: evt.position.x,
                y: evt.position.y,
            },
        });
    });

    cy.on('cxttap', 'node', (evt) => {
        var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
        tgt.remove();
    });

    cy.on('cxttap', 'edge', (evt) => {
        var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
        tgt.remove();
    });

    const executionControls = Vue.createApp({
        data() {
            return {
                operations: null,
                index: -1,
                playIntervalId: 0,
            };
        },
        computed: {
            backwardDisabled() {
                return this.index < 0;
            },
            forwardDisabled() {
                return this.operations && this.index + 1 >= this.operations.length;
            },
            playing() {
                return this.playIntervalId !== 0;
            },
        },
        methods: {
            playOrPause() {
                if (this.playIntervalId) {
                    this._pause();
                } else {
                    this._runUserFunction();
                    this._forwardOrPause();
                    this.playIntervalId = setInterval(() => this._forwardOrPause(), 500);
                }
            },
            _forwardOrPause() {
                if (this.operations && this.index + 1 < this.operations.length) {
                    this._forward();
                }
                if (!this.operations || this.index + 1 >= this.operations.length) {
                    this._pause();
                }
            },
            _pause() {
                clearInterval(this.playIntervalId);
                this.playIntervalId = 0;
            },
            stop() {
                this._pause();
                if (this.operations) {
                    while (this.index >= 0) {
                        this._backward();
                    }
                    this.operations = null;
                }
            },
            replay() {
                this.stop();
                this.playOrPause();
            },
            backward() {
                this._pause();
                this._backward();
            },
            forward() {
                this._pause();
                this._runUserFunction();
                this._forward();
            },
            _backward() {
                let operation = this.operations[this.index];
                if (operation.type === 'push') {
                    operation.node.removeClass('highlighted');
                } else {
                    operation.node.addClass('highlighted');
                }

                this.index--;
            },
            _forward() {
                this.index++;

                let operation = this.operations[this.index];
                if (operation.type === 'push') {
                    operation.node.addClass('highlighted');
                } else {
                    operation.node.removeClass('highlighted');
                }
            },
            _runUserFunction() {
                if (this.operations) {
                    return;
                }

                let enter = `
                    __dfsOperations.push({
                        type: 'push',
                        node,
                    });
                `;

                let exit = `
                    __dfsOperations.push({
                        type: 'pop',
                        node,
                    });
                `

                let userCode = editor.getValue()
                    .replace('// DFS:in', enter)
                    .replace('// DFS:out', exit);

                let code = `
                    function run(nodes) {
                        const __dfsOperations = [];

                        ${userCode}

                        return __dfsOperations;
                    }

                    return run(cyNodes);
                `;

                let func = new Function('cyNodes', code);
                this.operations = func(cy.nodes());
            },
        },
    }).mount('#execution-controls');
}

main();
