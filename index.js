import * as Vue from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import cytoscape from 'https://cdn.jsdelivr.net/npm/cytoscape/+esm';
import edgehandles from 'https://cdn.jsdelivr.net/npm/cytoscape-edgehandles/+esm';
import chroma from 'https://cdn.jsdelivr.net/npm/chroma-js/+esm';
import { v4 as uuid } from 'https://cdn.jsdelivr.net/npm/uuid/+esm';

cytoscape.use(edgehandles);

let id = 0;

const container = document.getElementById('cy');

const cy = cytoscape({
    container: container,

    layout: {
        name: 'concentric',
        concentric: (n) => { 0; },
        levelWidth: (nodes) => { return 100; },
        minNodeSpacing: 100,
    },

    style: [
        {
            selector: 'node[name]',
            style: {
                'content': 'data(name)',
            },
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
            },
        },
        {
            selector: '.eh-handle',
            style: {
                'background-color': 'red',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12, // makes the handle easier to hit
                'border-opacity': 0,
            },
        },
        {
            selector: '.eh-hover',
            style: {
                'background-color': 'red',
            },
        },
        {
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        {
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red',
            },
        },
        {
            selector: '.eh-ghost-edge.eh-preview-active',
            style: {
                'opacity': 0,
            },
        },
    ],

    elements: {
        nodes: [
            { data: { id: ++id, name: 'Adam' } },
            { data: { id: ++id, name: 'Barry' } },
            { data: { id: ++id, name: 'Charles' } },
            { data: { id: ++id, name: 'Danny' } },
            { data: { id: ++id, name: 'Elena' } },
        ],
        edges: [
            { data: { source: 1, target: 2 } },
        ],
    },
});

const defaults = {
    canConnect(sourceNode, targetNode) {
        return true;
    },
    edgeParams(sourceNode, targetNode) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        return {};
    },
    hoverDelay: 0, // time spent hovering over a target node before it is considered selected
    snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
    noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
    disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
};

const eh = cy.edgehandles(defaults);

eh.enableDrawMode();

const controls = Vue.createApp({
    data() {
        return {
            clickToCreateNodeEnabled: true,
        };
    },
    methods: {
        move() {
            eh.disableDrawMode();
        },
        connect() {
            eh.enableDrawMode();
        },
    },
}).mount('#controls');

cy.on('tap', (evt) => {
    if (!controls.clickToCreateNodeEnabled) {
        return;
    }

    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    if (tgt !== cy) {
        return;
    }

    cy.add({
        data: { id: ++id, name: id },
        position: {
            x: evt.position.x,
            y: evt.position.y,
        },
    });
});

cy.on('cxttap', 'node', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    tgt.remove();
});

cy.on('cxttap', 'edge', (evt) => {
    var tgt = evt.target || evt.cyTarget; // 3.x || 2.x
    tgt.remove();
});
