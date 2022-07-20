export const examplePaths = {
    'Basic': 'dfs-examples/basic.js',
    'Cycle Detection': 'dfs-examples/cycle-detection.js',
};

export const defaultExample = 'Basic';

export async function fetchExample(exampleName) {
    const exampleResp = await fetch(examplePaths[exampleName]);
    return await exampleResp.text();
};
