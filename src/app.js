/*************************************
 *  Manager *
 *  **********************************/
var Manager={
    CarRed:null,
    CarBlack:null,
    LabDistance:null
}
/*************************************
 *  Car *
 *  **********************************/
var Car = cc.Sprite.extend({
    type:0,//0 black 1 red
    state:0,//0:停止 1:加速 2:最大速度 3:刹车减速
    maxSpeed:10,
    accSpeedUp:1,//加速度s
    accAutoSpeedDown:0.1,//自然减速度
    accSpeedDown:3,//刹车减速度
    speed:0,
    ctor:function(type,_maxspeed){
        this.type=type;
        if(type==0){
            this._super(res.img_carBlack);
            this.setPositionX(500/3*2);
        }
        else{
            this._super(res.img_carRed);
            this.setPositionX(500/3);
        }
        if(_maxspeed!=null && _maxspeed!=undefined){
            this.maxSpeed=_maxspeed;
        }

        this.attr({
            anchorX:0.5,
            anchorY:0
        });
        this.scheduleUpdate();
        //速度控制
        this.schedule(function(){
            if(this.state==1){
                if(this.speed>=this.maxSpeed){
                    this.speed=this.maxSpeed;
                    this.state=2;
                }
                else{
                    this.speed+=this.accSpeedUp;
                }
            }
            else if(this.state==3){
                if(this.speed<=0){
                    this.speed==0;
                    this.state=0;
                }
                else{
                    this.speed-=this.accSpeedDown;
                }
            }
        },0.1);
    },
    update:function(dt) {
       if(this.speed>=0){
           this.setPositionY(this.getPositionY()+this.speed);
       }
    },
    Refuel:function(){
        //加油
        this.state=1;
    },
    Brake:function(){
        //刹车
        this.state=3;
    }
});

/*************************************
 *  Road *
 *  **********************************/
var Road=cc.Layer.extend({
    carRed:null,
    carBlack:null,
    spBaks:{},
    spLines:new Array(6),
    ctor:function() {
        this._super();

        //背景
        var spBg1 =this.spBaks.bg1= new cc.Sprite(res.img_BG);
        spBg1.anchorX=0;
        spBg1.anchorY=0.5;
        this.addChild(spBg1);

        var spBg2 =this.spBaks.bg2= new cc.Sprite(res.img_BG);
        spBg2.anchorX=0;
        spBg2.anchorY=0.5;
        spBg2.flippedY=true;
        spBg2.y=960;
        this.addChild(spBg2);

        for (var i = 0; i < 8; i++) {
            var spSpiteLine=this.spLines[i] = new cc.Sprite(res.img_roadLine);
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
        this.runAction(cc.follow(Manager.CarBlack));
    },
    update:function(dt){
        //背景
            if(this.spBaks.bg2.y+this.y<=960/2){
                this.spBaks.bg1.y=this.spBaks.bg2.y+960;
            }
            if(this.spBaks.bg1.y+this.y<=960/2){
                this.spBaks.bg2.y=this.spBaks.bg1.y+960;
            }
        //车道线
        for(var i=0;i<4;i++){
            var spLine=this.spLines[i*2];
            if(spLine.y+this.y<-180){
                spLine.y+=300*4;
                this.spLines[i*2+1].y=spLine.y;
            }
        }
    },
    setCars:function(car1,car2){
        this.carRed=car1;
        this.addChild(this.carRed);
        this.carBlack=car2;
        this.addChild(this.carBlack);
    },
    getCarDistance:function(){
        if(this.carRed!=null && this.carBlack!=null){
            return Math.abs(this.carRed.getPositionY()-this.carBlack.getPositionY());
        }
    }
});
/*************************************
 *  MainScene *
 *  **********************************/
var MainScene = cc.Scene.extend({
    labDistence:null,
    road:null,
    ctor:function(){
        this._super();

        this.road = new Road();

        var carRed=new Car(1);
        var carBlack=new Car(0,13);
        this.road.setCars(carRed,carBlack);
        Manager.CarBlack=carBlack;
        Manager.CarRed=carRed;

        this.addChild(this.road);

        var followTarget=new cc.Node();
        followTarget.setContentSize(1,1);
        this.addChild(followTarget);

        this._initGUI();
        return true;
    },
    onEnter:function () {
        this._super();

        this.road.carRed.Refuel();
        this.scheduleUpdate();

        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function (event) {
                    if(Manager.LabDistance==null){
                        alert("labDistence is null");
                    }
                    Manager.LabDistance.color = cc.color._getGreen();

                    /*var winSize = cc.director.getWinSize();
                    var pos = touch.getLocation();
                    if(this.carBlack==null){
                        alert("carBlack is null");
                    }*/
                    Manager.CarBlack.Refuel();
                },
                onMouseMove: function (event) {
                    /*var pos = event.getLocation(), target = event.getCurrentTarget();
                    cc.log("onMouseMove at: " + pos.x + " " + pos.y);
                    target.sprite.x = pos.x;
                    target.sprite.y = pos.y;*/
                },
                onMouseUp: function (event) {
                    /*var pos = event.getLocation(), target = event.getCurrentTarget();
                    target.sprite.x = pos.x;
                    target.sprite.y = pos.y;
                    cc.log("onMouseUp at: " + pos.x + " " + pos.y);*/
                    Manager.CarBlack.Brake();
                    Manager.LabDistance.color = cc.color._getRed();
                }
            }, this);
        } else {
            alert("MOUSE Not supported");
            cc.log("MOUSE Not supported");
        }
    },
    _initGUI:function(){
        var winSize=cc.director.getWinSize();
        Manager.LabDistance=this.labDistence= new cc.LabelTTF("Dictance:0", "Times New Roman", 30);
        this.labDistence.color=cc.color._getRed();
        this.labDistence.x = winSize.width / 2;
        this.labDistence.y = winSize.height - 50;
        this.addChild(this.labDistence, 100);
    },
    update:function(){
        this.labDistence.setString("Dictance:"+this.road.getCarDistance());
    }
});

