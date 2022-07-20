import Split from 'https://cdn.jsdelivr.net/npm/split-grid@1.0.11/+esm';

const configKeyGridColumns = 'split-grid-template-columns';

export function initGrid() {
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
};
