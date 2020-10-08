
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    update(dt) {
        if (gameState == 1) {

            this.node.x -= 5;
            if (this.node.x < -1000) {
                this.node.removeFromParent();
                this.node.destroy();
            }
        }
    },
});
