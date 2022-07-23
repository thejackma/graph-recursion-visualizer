export const stack = Vue.createApp({
    data() {
        return {
            stack: [],
            topDown: true,
        };
    },
    computed: {
        stackTopIndex() {
            return this.topDown ? this.stack.length - 1 : 0;
        },
        stackView() {
            if (this.topDown) {
                return this.stack;
            } else {
                return this.stack.slice().reverse();
            }
        },
        stackGrid() {
            if (this.topDown) {
                return {
                    'grid-template-rows': 'auto 1fr',
                    'grid-template-areas': '"frames" "empty"',
                };
            } else {
                return {
                    'grid-template-rows': '1fr auto',
                    'grid-template-areas': '"empty" "frames"',
                };
            }
        },
    },
    methods: {
        reset() {
            this.stack = [];
        },
        push(curr) {
            this.stack.push(curr);
        },
        pop() {
            this.stack.pop();
        },
        top() {
            if (this.stack.length > 0) {
                return this.stack[this.stack.length - 1];
            } else {
                return null;
            }
        },
    },
}).mount('#stack');

const stackControls = Vue.createApp({
    data() {
        return {
            stackMode: stack.topDown ? 'TopDown' : 'BottomUp',
        };
    },
    watch: {
        stackMode(newValue, oldValue) {
            stack.topDown = newValue === 'TopDown';
        },
    },
}).mount('#stack-controls');
