const state = null;//最开始为0，plane掉落
// const gameState = 1;//game状态标志，控制游戏开始，死亡
cc.Class({
    extends: cc.Component,

    properties: {
        wallNode: cc.Node,
        wall: cc.Prefab,
        gold: cc.Prefab,
        level: cc.Node,
        tapTick: cc.Node,
        /**
         * @背景循环
         * bg和bg1都是背景node
         */
        bg: cc.Node,
        bg1: cc.Node,
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.startScore = 0;//初始分数
        this.freshPlayer();//判断是否首次进入//关卡定位
        this.canvasWidth = cc.winSize.width;//屏幕宽度 
        this.canvasHeight = cc.winSize.height;//屏幕高度
        this.gameOverNode = this.node.getChildByName('gameOverNode');
        this.gameWinNode = this.node.getChildByName('gameWinNode');
        this.gameStartNode = this.node.getChildByName('gameStartNode');
        this.gameOverNode.active = false;
        this.loadBar = cc.find("Canvas/gameNode/loadBar");
        this.plane = this.node.getChildByName('gameNode').getChildByName('plane');
        cc.director.getPhysicsManager().enabled = true;//开启物理属性
        this.node.on(cc.Node.EventType.TOUCH_START, this.Touch_Start, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.Touch_End, this);
        gameState = 3;
        //非首次进入关卡数据
        let level = cc.sys.localStorage.getItem('level');//拿到关卡存储
        this.level.getComponent(cc.Label).string = "关卡：" + level;
        //金币置零
        let gold = cc.sys.localStorage.getItem('goldNum');//本地保存金币数据
        cc.find("Canvas/gameStartNode/gold/goldLabel").getComponent(cc.Label).string = gold;
        //存档数据清除
        cc.sys.localStorage.removeItem('level');
        cc.sys.localStorage.removeItem('goldNum');
    },
    freshPlayer() {
        let level = cc.sys.localStorage.getItem('level');//拿到关卡存储
        if (!level) {//首次进入，关卡为1//设置金币为0
            let l = 1;
            cc.sys.localStorage.setItem('level', l);
            let gold = 0;
            //cc.find("Canvas/gameStartNode/gold/goldLabel").getComponent(cc.Label).string=gold;
            cc.sys.localStorage.setItem('goldNum', gold);//本地保存金币数据
            // this.tapTick.active = true;//手指显示
        }
    },
    start() {
        this.activeAction = cc.jumpTo(0.5, cc.v2(0, 0), -1000, 1);//node进入动画
        this.hideAction = cc.jumpTo(0.5, cc.v2(0, 950), 1000, 1);//node跳出动画
        this.gameStartNode.runAction(this.activeAction);
        setInterval(() => {
            this.createWall();
        }, 2000);
    },
    Touch_Start() {
        this.state = 1;
    },
    Touch_End() {
        this.state = 0;
        // this.tapTick.active = false;
    },
    createWall() {
        if (gameState == 1) {
            let wallBlock = cc.instantiate(this.wall);
            this.wallNode.addChild(wallBlock);
            wallBlock.x = this.canvasWidth / 2;
            let a = 100 - Math.random() * 200;
            wallBlock.y = a;
            if (Math.random() < 0.3) {
                let gold = cc.instantiate(this.gold);
                this.wallNode.addChild(gold);
                gold.x = this.canvasWidth / 2 + 300;
                let b = 50 - Math.random() * 100;
                gold.y = a + b;
            }
        }
    },
    getBtn(sender, str) {
        let level = cc.sys.localStorage.getItem('level');//拿取本地缓存
        if (str == 'gameReady') {//开始场景的按钮
            gameState = 1;
            this.state = 0;
            this.gameStartNode.runAction(this.hideAction);//node退出
            // this.gameStartNode.active = false;
        } else if (str == 'gameOver') {//死亡场景的按钮
            cc.director.loadScene("game");
        } else if (str == 'gameWin') {//胜利/下一关按钮
            this.gameWinNode.runAction(this.hideAction);
            gameState = 1;
            level++;//关卡数据+1
            this.level.getComponent(cc.Label).string = "关卡：" + level;
            cc.sys.localStorage.setItem('level', level);
        }
    },
    gameOver() {//死亡逻辑，在plane.js中调用
        this.gameOverNode.active = true;
        this.gameOverNode.runAction(this.activeAction);
        this.plane.getComponent(cc.Animation).stop();
    },
    addScore() {//加分逻辑，在plane.js中调用
        this.startScore += 1;//分数+1；
    },
    update(dt) {
        // if (gameState == 1) {//判断游戏标志位状态
        if (this.loadBar.width <= 100) {
            this.loadBar.color = new cc.Color(255, 0, 0);//loadBar颜色变化
        }
        if (this.loadBar.width == 0) {//winNode显示，写入胜利逻辑
            gameState = 0;
            this.gameWinNode.runAction(this.activeAction);
            this.loadBar.width = loadBarWidth;
            this.loadBar.color = new cc.Color(255, 255, 255);
            //胜利金币显示
            cc.find("Canvas/gameWinNode/winGold/goldLabel").getComponent(cc.Label).string = "50 + " + this.startScore * 10;
            let score = cc.sys.localStorage.getItem('goldNum');//拿取本地已经获得的金币数
            let totalScore = parseInt(score) + 50 + parseInt(this.startScore * 10);//金币累加
            cc.sys.localStorage.setItem('goldNum', totalScore);
            //startScore置零
            this.startScore = 0;
        }
        if (this.state == 1 && gameState == 1) {//按下
            this.plane.y += 5;
            this.plane.angle < 20 ? this.plane.angle += 1 : this.plane.angle = 20;
            this.loadBar.width = this.loadBar.width - 0.5;//
            this.bgMove();
        } else if (this.state == 0 && gameState == 1) {//释放
            this.plane.y -= 3;
            this.plane.angle < 0 ? this.plane.angle = 0 : this.plane.angle -= 1;
            this.loadBar.width = this.loadBar.width - 0.5;//
            this.bgMove();
        }
        if (this.plane.y <= -this.canvasHeight / 2 - this.plane.height / 2) {//飞机触地死亡
            gameState = 0;
            this.plane.destroy();//attention
            this.gameOver();
            return;
        }

    },
    bgMove() {//"背景滚动"
        this.bg.x -= 4;
        this.bg1.x -= 4;
        if (this.bg.x <= -(this.bg.width)) {
            this.bg.x = this.bg1.x + this.bg.width - 0.8;
        }
        if (this.bg1.x <= -(this.bg1.width)) {
            this.bg1.x = this.bg.x + this.bg1.width - 0.8
        }
    },
});
