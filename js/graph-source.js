import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';

export const graphSource = monaco.editor.create(document.getElementById('graph-source'), {
    value: '',
    language: 'text',
    automaticLayout: true,
});

export function initGraphSourceControls(cy, graphControls) {
    return Vue.createApp({
        data() {
            return {
                enabled: true,
            };
        },
        computed: {
            disabled() {
                return !this.enabled;
            }
        },
        methods: {
            enable() {
                this.enabled = true;
            },
            disable() {
                this.enabled = false;
            },
            show(source) {
                graphSource.setValue(source);
                document.querySelector('#stack-controls').classList.add('d-none');
                document.querySelector('#stack').classList.add('d-none');
                document.querySelector('#graph-source-controls').classList.remove('d-none');
                document.querySelector('#graph-source').classList.remove('d-none');
            },
            save() {
                this._showGraph(graphSource.getValue());
            },
            cancel() {
                graphControls.viewSource = false;
            },
            _showGraph(source) {
                const graph = graphlibDot.read(source);
                const nodes = [];
                const edges = [];

                for (const node of graph.nodes()) {
                    nodes.push({
                        data: {
                            id: node,
                            data: graph.node(node),
                        },
                    });
                }

                for (const edge of graph.edges()) {
                    edges.push({
                        data: {
                            source: edge.v,
                            target: edge.w,
                            data: graph.edge(edge.v, edge.w),
                        },
                    });
                }

                const elements = {
                    nodes,
                    edges,
                };

                cy.remove(cy.elements());
                cy.add(elements);
                graphControls.applyLayout();
            },
            hide() {
                document.querySelector('#graph-source-controls').classList.add('d-none');
                document.querySelector('#graph-source').classList.add('d-none');
                document.querySelector('#stack-controls').classList.remove('d-none');
                document.querySelector('#stack').classList.remove('d-none');
            },
        },
    }).mount('#graph-source-controls');
}
