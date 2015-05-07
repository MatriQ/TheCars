
var Car = cc.Sprite.extend({
    type:0,//0 black 1 red
    state:0,//0 stop 1 running
    ctor:function(type){
        this.type=type;
        if(type==0){
            this._super(res.img_carBlack);
            this.setPositionX(500/3*2);
        }
        else{
            this._super(res.img_carRed);
            this.setPositionX(500/3);
        }

        this.attr({
            anchorX:0.5,
            anchorY:0
        });
        this.scheduleUpdate();
    },
    update:function(dt) {
        if(this.state==1) {
            this.setPositionY(this.getPositionY() + 2);
        }
    },
    Run:function(){
        this.state=1;
    },
    Stop:function(){
        this.state=0;
    }
});

var Road=cc.Layer.extend({
    car1:null,
    car2:null,
    ctor:function() {
        this._super();

        //背景
        var spBg = new cc.Sprite(res.img_BG);
        spBg.anchorX = 0;
        spBg.anchorY = 0;
        this.addChild(spBg);

        for (var i = 0; i < 1000; i++) {
            var spSpiteLine = new cc.Sprite(res.img_roadLine);
            spSpiteLine.setScaleY(190 / 30);
            spSpiteLine.setPositionX(70+500 / 3 * (i % 2 + 1));
            spSpiteLine.setPositionY(0 + 300 * (Math.floor(i / 2) + 1));
            this.addChild(spSpiteLine);
        }
        this.scheduleUpdate();
        return true;
    },
    onEnter:function(){
        this._super();
        this.runAction(cc.follow(this.car1));
    },
    update:function(dt){
        if(this.follower==null || this.car1==null){
            return;
        }

        /*this.follower.setPositionY(this.car1.getPositionY());
        var posi=this.follower.getPositionY();
         if(posi+this.getPositionY()<50 ||posi+this.getPositionY()>900){
            this.setPositionY(-posi);
        }
        var camera = this.getCamera();
        var eyeZ = cc.Camera.getZEye();
        //camera.setEye(eyeX, 0, eyeZ);
        camera.setCenter(0, posi, 0);*/
    },
    getCarDistance:function(){
        if(this.car1!=null && this.car2!=null){
            return Math.abs(this.car1.getPositionY()-this.car2.getPositionY());
        }
    }
});

var MainScene = cc.Scene.extend({
    labDistence:null,
    road:null,
    carRed:null,
    carBlack:null,
    ctor:function(){
        this._super();

        this.road = new Road();

        this.carRed=new Car(1);
        this.road.addChild(this.carRed);

        this.carBlack=new Car(0);
        this.road.addChild(this.carBlack);

        this.road.car1=this.carBlack;
        this.road.car2=this.carRed;
        this.addChild(this.road);

        var followTarget=new cc.Node();
        followTarget.setContentSize(1,1);
        this.addChild(followTarget);

        this._initGUI();
        return true;
    },
    onEnter:function () {
        this._super();


        this.carRed.Run();
        this.scheduleUpdate();

        if( 'touches' in cc.sys.capabilities ) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan,
                onTouchMoved: this.onTouchMoved,
                onTouchEnded: this.onTouchEnded,
                onTouchCancelled: this.onTouchCancelled
            }, this);
        } else {
            alert("TOUCH-ONE-BY-ONE test is not supported on desktop");
            cc.log("TOUCH-ONE-BY-ONE test is not supported on desktop");
        }
    },
    _initGUI:function(){
        var winSize=cc.director.getWinSize();
        this.labDistence= new cc.LabelTTF("Dictance:0", "Times New Roman", 30);
        this.labDistence.color=cc.color._getRed();
        this.labDistence.x = winSize.width / 2;
        this.labDistence.y = winSize.height - 50;
        this.addChild(this.labDistence, 100);
    },
    update:function(dt){
        this.labDistence.setString("Dictance:"+this.road.getCarDistance());
    },
    onTouchBegan:function(touch, event){
        var winSize=cc.director.getWinSize();
        var pos = touch.getLocation();
        var id = touch.getID();
        cc.log("onTouchBegan at: " + pos.x + " " + pos.y + " Id:" + id );
        /*if( pos.x < winSize.width/2) {
            event.getCurrentTarget().new_id(id,pos);
            return true;
        }*/
        this.carBlack.Run();
        return false;
    },
    onTouchMoved:function(touch, event){

    },
    onTouchEnded:function(touch, event){
        this.carBlack.Stop();
    },
    onTouchCancelled:function(touch, event){

    }
});

