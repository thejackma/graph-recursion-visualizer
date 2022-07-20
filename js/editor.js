import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';
import { defaultExample, fetchExample } from './example.js'

export const editor = monaco.editor.create(document.getElementById('editor'), {
    value: await fetchExample(defaultExample),
    language: 'javascript',
    automaticLayout: true,
});
