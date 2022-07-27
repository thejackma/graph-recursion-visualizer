export const stack = Vue.createApp({
    data() {
        return {
            stack: [],
            topDown: true,
            stackControl: null,
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
            this.stackControls.show = false;
        },
        push(curr) {
            this.stack.push(curr);
            this.stackControls.show = true;
        },
        pop() {
            this.stack.pop();
            if (this.stack.length === 0) {
                this.stackControls.show = false;
            }
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
            show: false,
            stackMode: stack.topDown ? 'TopDown' : 'BottomUp',
        };
    },
    watch: {
        stackMode(newValue, oldValue) {
            stack.topDown = newValue === 'TopDown';
        },
    },
}).mount('#stack-controls');

stack.stackControls = stackControls;
