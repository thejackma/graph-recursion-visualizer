import * as Vue from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.js';
import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';
import Split from 'https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm';

async function main() {
    const configKeyGridColumns = 'split-grid-template-columns';
    const grid = document.querySelector('.grid');

    const gridColumns = localStorage.getItem(configKeyGridColumns);
    if (gridColumns) {
        grid.style['grid-template-columns'] = gridColumns;
    }

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
        onDragEnd(direction, track) {
            localStorage.setItem(configKeyGridColumns, grid.style['grid-template-columns']);
        },
    });

    const examplePaths = {
        'Basic': 'dfs-examples/basic.js',
        'Cycle Detection': 'dfs-examples/cycle-detection.js',
    };
    const defaultExample = 'Basic';

    async function fetchExample(exampleName) {
        const exampleResp = await fetch(examplePaths[exampleName]);
        return await exampleResp.text();
    }

    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: await fetchExample(defaultExample),
        language: 'javascript',
        automaticLayout: true,
    });

    let id = 0;

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

    const cy = cytoscape({
        container: document.getElementById('graph'),

        layout: layouts[defaultLayout],

        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)',
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
                { data: { id: 'Adam' } },
                { data: { id: 'Barry' } },
                { data: { id: 'Charles' } },
                { data: { id: 'Danny' } },
                { data: { id: 'Evan' } },
                { data: { id: 'Felix' } },
                { data: { id: 'George' } },
                { data: { id: 'Harry' } },
            ],
            edges: [
                { data: { source: 'Adam', target: 'Barry' } },
                { data: { source: 'Adam', target: 'Charles' } },
                { data: { source: 'Barry', target: 'Charles' } },
                { data: { source: 'Barry', target: 'Danny' } },
                { data: { source: 'Danny', target: 'Evan' } },
                { data: { source: 'Evan', target: 'Felix' } },
                { data: { source: 'Felix', target: 'George' } },
                { data: { source: 'Barry', target: 'Harry' } },
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
                enabled: true,
                drawMode: 'Connect',
                previousDrawMode: null,
                clickToCreateNodeEnabled: true,
                previousClickToCreateNodeEnabled: null,
                layoutNames: Object.keys(layouts),
                selectedLayoutName: defaultLayout,
            };
        },
        methods: {
            toggleDrawMode() {
                if (this.drawMode === 'Connect') {
                    eh.enableDrawMode();
                } else {
                    eh.disableDrawMode();
                }
            },
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
                this.previousDrawMode = this.drawMode;
                this.drawMode = 'Move';
                this.previousClickToCreateNodeEnabled = this.clickToCreateNodeEnabled;
                this.clickToCreateNodeEnabled = false;
            },
            enable() {
                if (this.enabled) {
                    return;
                }
                this.enabled = true;
                this.drawMode = this.previousDrawMode;
                this.clickToCreateNodeEnabled = this.previousClickToCreateNodeEnabled;
            },
        },
    }).mount('#graph-controls');

    cy.on('tap', (evt) => {
        if (!graphControls.clickToCreateNodeEnabled) {
            return;
        }

        var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
        if (tgt !== cy) {
            return;
        }

        cy.add({
            data: { id: ++id },
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

    const stack = Vue.createApp({
        data() {
            return {
                stack: [],
            };
        },
        computed: {
        },
        methods: {
            reset() {
                this.stack = [];
            },
            push(curr) {
                this.stack.push(curr);
            },
            pop() {
                this.stack.pop();
            },
            top() {
                if (this.stack.length > 0) {
                    return this.stack[this.stack.length - 1];
                } else {
                    return null;
                }
            },
        },
    }).mount('#stack');

    const executionControls = Vue.createApp({
        data() {
            return {
                operations: null,
                stack: [],
                index: -1,
                playIntervalId: 0,
                exampleNames: Object.keys(examplePaths),
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
            progress() {
                if (this.operations) {
                    return Math.round((this.index + 1) / this.operations.length * 100);
                } else {
                    return 0;
                }
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
                    stack.reset();
                    editor.updateOptions({ readOnly: false });
                    graphControls.enable();
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
                const operation = this.operations[this.index];
                if (operation.type === 'push') {
                    this._pop(operation.node);
                } else {
                    this._push(operation.node);
                }

                this.index--;
            },
            _forward() {
                this.index++;

                const operation = this.operations[this.index];
                if (operation.type === 'push') {
                    this._push(operation.node);
                } else {
                    this._pop(operation.node);
                }
            },
            _push(curr) {
                curr.addClass('highlighted');
                const prev = stack.top();
                if (prev) {
                    for (const edge of prev.edgesTo(curr)) {
                        edge.addClass('highlighted');
                    }
                }
                stack.push(curr);
            },
            _pop(curr) {
                curr.removeClass('highlighted');
                stack.pop();
                const prev = stack.top();
                if (prev) {
                    for (const edge of prev.edgesTo(curr)) {
                        edge.removeClass('highlighted');
                    }
                }
            },
            _runUserFunction() {
                if (this.operations) {
                    return;
                }

                editor.updateOptions({ readOnly: true });
                graphControls.disable();

                const enter = `
                    __dfsOperations.push({
                        type: 'push',
                        node,
                    });
                `;

                const exit = `
                    __dfsOperations.push({
                        type: 'pop',
                        node,
                    });
                `

                const userCode = editor.getValue()
                    .replaceAll('// DFS:in', enter)
                    .replaceAll('// DFS:out', exit);

                const code = `
                    function __dfsRun(nodes) {
                        const __dfsOperations = [];

                        function __dfsUserCode() {
                            ${userCode}
                        }

                        __dfsUserCode();

                        return __dfsOperations;
                    }

                    return __dfsRun(__dfsNodes);
                `;

                const func = new Function('__dfsNodes', code);
                this.operations = func(cy.nodes());
            },
            async applyExample(exampleName) {
                const example = await fetchExample(exampleName);
                editor.setValue(example);
            },
        },
    }).mount('#execution-controls');

    for (const dropdownToggle of document.querySelectorAll('.dropdown-toggle')) {
        new bootstrap.Dropdown(dropdownToggle);
    }

    for (const dropdownMenu of document.querySelectorAll('ul.dropdown-menu')) {
        grid.after(dropdownMenu);
    }
}

main();
