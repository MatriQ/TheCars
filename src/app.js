
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
            this.x=320;
        }
        else{
            this._super(res.img_carRed);
            this.x=320-170;
        }
        if(_maxspeed!=null && _maxspeed!=undefined){
            this.maxSpeed=_maxspeed;
        }
        this.y=400;

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
            this.y+=this.speed;
        }
    },
    Refuel:function(){
        //加油
        this.state=1;
    },
    Brake:function(){
        //刹车
        this.state=3;
    },
    //是否在运行
    isRun:function(){
        return this.speed>0;
    }
});

/*************************************
 *  Road *
 *  **********************************/
var Road=cc.Layer.extend({
    carRed:null,
    carBlack:null,
    spBaks:{},
    spLines:null,
    spPlants:null,
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

        //车道线
        this.spLines=new Array(8);
        for (var i = 0; i < 8; i++) {
            var spSpiteLine=this.spLines[i] = new cc.Sprite(res.img_roadLine);
            spSpiteLine.x=i % 2==0?230:(640-230);
            spSpiteLine.y=0 + 300 * (Math.floor(i / 2) + 1);
            this.addChild(spSpiteLine);
        }

        //植物
        var count=Math.ceil(960/250)+1;
        this.spPlants=new Array(count*2);
        for(var i=0;i<count;i++){
            //左边
            var plant=new cc.Sprite(res.img_grass);
            plant.y=-10+i*250;
            plant.anchorY=0;
            plant.anchorX=0;
            this.addChild(plant,30,30+i*2);
            this.spPlants[i*2]=plant;
            //右边
            var plant=new cc.Sprite(res.img_grass);
            plant.anchorX=1;
            plant.anchorY=0;
            plant.flippedX=true;
            plant.x=640;
            plant.y=-10+i*250;
            this.addChild(plant,30,30+i*2+1);
            this.spPlants[i*2+1]=plant;
        }

        this.scheduleUpdate();
        return true;
    },
    onEnter:function(){
        this._super();
        this.runAction(cc.follow(this.carBlack));
    },
    update:function(dt){
        //背景
        if(this.spBaks.bg2.y+this.y<=960/2){
            this.spBaks.bg1.y=this.spBaks.bg2.y+960;
        }
        if(this.spBaks.bg1.y+this.y<=960/2){
            this.spBaks.bg2.y=this.spBaks.bg1.y+960;
        }
        //车道边界线
        for(var i=0;i<0;i++){
            var spLine=this.spLines[i*2];
            if(spLine.y+this.y<-180){
                spLine.y+=300*4;
                this.spLines[i*2+1].y=spLine.y;
            }
        }
        //车道线
        for(var i=0;i<4;i++){
            var spLine=this.spLines[i*2];
            if(spLine.y+this.y<-180){
                spLine.y+=300*4;
                this.spLines[i*2+1].y=spLine.y;
            }
        }
        //植物
        var count=this.spPlants.length/2;
        for(var i=0;i<count;i++){
            var spPlant=this.spPlants[i*2];
            if(spPlant.y+this.y+260<=0){
                spPlant.y+=250*count;
                this.spPlants[i*2+1].y=spPlant.y;
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
    touchStartPosi:null,
    ctor:function(){
        this._super();

        this.road = new Road();

        var carRed=new Car(1);
        var carBlack=new Car(0,13);
        this.road.setCars(carRed,carBlack);

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
                    var target = event.getCurrentTarget();
                    target.labDistence.color= cc.color._getGreen();
                    //加油门
                    target.road.carBlack.Refuel();

                    target.touchStartPosi=event.getLocation();
                },
                onMouseMove: function (event) {
                    var target = event.getCurrentTarget();
                    if(target.road.carBlack.isRun() && target.touchStartPosi!=null){
                        var newPosi=event.getLocation();
                        var offsetX=newPosi.y-target.touchStartPosi.y;
                        target.road.carBlack.x+=offsetX*0.1;
                    }
                },
                onMouseUp: function (event) {
                    var target = event.getCurrentTarget();
                    target.road.carBlack.Brake();
                    target.touchStartPosi=null;
                    target.labDistence.color = cc.color._getRed();
                }
            }, this);
        } else {
            alert("MOUSE Not supported");
            cc.log("MOUSE Not supported");
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
    update:function(){
        this.labDistence.setString("Dictance:"+this.road.getCarDistance());
    }
});

