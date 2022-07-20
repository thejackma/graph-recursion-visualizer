export const codeExamplePaths = {
    'Basic': 'code-examples/basic.js',
    'Cycle Detection': 'code-examples/cycle-detection.js',
};

export const defaultCodeExample = 'Basic';

export async function fetchCodeExample(exampleName) {
    const exampleResp = await fetch(codeExamplePaths[exampleName]);
    return await exampleResp.text();
};
