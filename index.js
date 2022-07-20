import * as Vue from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.js';
import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';
import { examplePaths, defaultExample, fetchExample } from './js/example.js'
import { initGrid } from './js/grid.js';
import { names, layouts, defaultLayout, cy, eh } from './js/graph.js';

async function main() {
    initGrid();

    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: await fetchExample(defaultExample),
        language: 'javascript',
        automaticLayout: true,
    });

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

    const remainingNames = new Set(names);
    for (let node of cy.nodes()) {
        remainingNames.delete(node.data().data);
    }
    let id = cy.nodes().length;

    cy.on('tap', (evt) => {
        if (!graphControls.clickToCreateNodeEnabled) {
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
            data: { id: ++id, data: name },
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
        if (names.has(data)) {
            remainingNames.add(data);
        }
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

    const grid = document.querySelector('.grid');
    for (const dropdownMenu of document.querySelectorAll('ul.dropdown-menu')) {
        grid.after(dropdownMenu);
    }
}

main();
