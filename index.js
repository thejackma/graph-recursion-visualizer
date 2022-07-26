import { fixDropdown } from './js/dropdown.js';
import { editor } from './js/editor.js';
import { initExecutionControls } from './js/execution.js';
import { cy, graphControls } from './js/graph.js';
import { initGrid } from './js/grid.js';
import { stack } from './js/stack.js';
import { graphSource, initGraphSourceControls } from './js/graph-source.js';

async function main() {
    initGrid();

    const graphSourceControls = initGraphSourceControls(cy, graphControls);
    graphControls.setGraphSourceControls(graphSourceControls);

    initExecutionControls(cy, graphControls, graphSourceControls, editor, stack);

    fixDropdown();
}

main();
