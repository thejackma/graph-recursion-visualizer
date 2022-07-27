import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';

export const graphSource = monaco.editor.create(document.getElementById('graph-source'), {
    value: '',
    language: 'text',
    automaticLayout: true,
});

export function initGraphSourceControls(graphControls) {
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
                graphControls.showGraph(graphSource.getValue());
            },
            cancel() {
                graphControls.viewSource = false;
            },
            hide() {
                document.querySelector('#graph-source-controls').classList.add('d-none');
                document.querySelector('#graph-source').classList.add('d-none');
                document.querySelector('#stack-controls').classList.remove('d-none');
                document.querySelector('#stack').classList.remove('d-none');
            },
            upload() {
                const fileInput = document.getElementById('formFile');
                fileInput.click();
            },
            fileSelected(e) {
                const file = e.target.files[0];
                if (!file) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = e => {
                    var contents = e.target.result;
                    graphSource.setValue(contents);
                    this.save();
                };
                reader.readAsText(file);
            },
            download() {
                const source = graphSource.getValue();
                const blob = new Blob([source], {
                    type: 'text/plain',
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'graph.gv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
        },
    }).mount('#graph-source-controls');
}
