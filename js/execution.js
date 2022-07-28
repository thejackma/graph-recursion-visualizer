import { codeExamplePaths, fetchCodeExample } from './code-example.js'

export function initExecutionControls(cy, graphControls, graphSourceControls, editor, stack) {
    return Vue.createApp({
        data() {
            return {
                operations: null,
                stack: [],
                index: -1,
                playIntervalId: 0,
                codeExamples: Object.keys(codeExamplePaths),
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
                    if (!this._runUserFunction()) {
                        return;
                    }
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
                    document.getElementById('monaco-overlay').classList.add('d-none');
                    graphControls.enable();
                    graphSourceControls.enable();
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
                if (!this._runUserFunction()) {
                    return;
                }
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
                    return true;
                }

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
                `;

                const userCode = editor.getValue()
                    .replaceAll('// DFS:in', enter)
                    .replaceAll('// DFS:out', exit);

                const code = `
                    function __dfsRun(nodes) {
                        const __dfsOperations = [];
                        const visited = new Set();

                        function __dfsUserCode() {
                            ${userCode}
                        }

                        __dfsUserCode();

                        return __dfsOperations;
                    }

                    return __dfsRun(__dfsNodes);
                `;

                for (const element of cy.elements()) {
                    if (!element.hasOwnProperty('name')) {
                        Object.defineProperty(element, 'name', {
                            get() {
                                return this.data().name;
                            },
                            set(value) {
                                this.data().name = value;
                            },
                        });
                    }
                    if (!element.hasOwnProperty('weight')) {
                        Object.defineProperty(element, 'weight', {
                            get() {
                                return this.data().weight;
                            },
                            set(value) {
                                this.data().weight = value;
                            },
                        });
                    }
                }

                const func = new Function('__dfsNodes', code);
                try {
                    this.operations = func(cy.nodes());
                } catch (e) {
                    alert(e);
                    return false;
                }

                for (const element of cy.elements()) {
                    element.data(element.data());
                }

                editor.updateOptions({ readOnly: true });
                document.getElementById('monaco-overlay').classList.remove('d-none');
                graphControls.disable();
                graphSourceControls.disable();

                return this.operations.length > 0;
            },
            async applyCodeExample(exampleName) {
                const example = await fetchCodeExample(exampleName);
                editor.setValue(example);
            },
        },
    }).mount('#execution-controls');
};
