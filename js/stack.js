export const stack = Vue.createApp({
    data() {
        return {
            stack: [],
        };
    },
    computed: {
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
