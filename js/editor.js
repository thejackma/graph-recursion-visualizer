import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';
import { defaultCodeExample, fetchCodeExample } from './code-example.js'

export const editor = monaco.editor.create(document.getElementById('editor'), {
    value: await fetchCodeExample(defaultCodeExample),
    language: 'javascript',
    automaticLayout: true,
});
