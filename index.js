import { fixDropdown } from './js/dropdown.js';
import { editor } from './js/editor.js';
import { initExecutionControls } from './js/execution.js';
import { cy, graphControls } from './js/graph.js';
import { initGrid } from './js/grid.js';
import { stack } from './js/stack.js';

async function main() {
    initGrid();

    initExecutionControls(cy, graphControls, editor, stack);

    fixDropdown();
}

main();
