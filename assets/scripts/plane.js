
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    onBeginContact: function (contact, selfCollider, otherCollider) {
        
        if(otherCollider.node.group == 'wall'){
            cc.director.getPhysicsManager().enabled = false;
            gameState = 0;
            cc.log("死亡");
            cc.find("Canvas").getComponent('game').gameOver();
        }
        if(otherCollider.node.group == 'gold'){
            otherCollider.node.active = false;
            cc.log("金币+1");
            cc.find("Canvas").getComponent('game').addScore();
        }
    },

    // update (dt) {},
});
