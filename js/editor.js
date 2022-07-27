import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33/+esm';
import { defaultCodeExample, fetchCodeExample } from './code-example.js'

const configKeyCode = 'code';

let code = localStorage.getItem(configKeyCode);
if (!code) {
    code = await fetchCodeExample(defaultCodeExample);
}

export const editor = monaco.editor.create(document.getElementById('monaco'), {
    value: code,
    language: 'javascript',
    automaticLayout: true,
});

addEventListener('beforeunload', e => {
    localStorage.setItem(configKeyCode, editor.getValue());
});
