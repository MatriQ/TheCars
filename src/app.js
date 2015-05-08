
/*************************************
 *  Car *
 *  **********************************/
var Car = cc.Sprite.extend({
    type:0,//0 black 1 red
    state:0,//0:停止 1:加速 2:最大速度 3:刹车减速 4:自然减速
    maxSpeed:10,
    accSpeedUp:1,//加速度s
    accAutoSpeedDown:0.1,//自然减速度
    accSpeedDown:3,//刹车减速度
    autoSpeed:10,//默认速度
    speed:0,
    carAngel:0,//车身方向，12点方向为0
    steeredAngle:0,//方向盘旋转角度，12点方向为0
    wheelbase:230,//轴距
    autoTurn:false,//自动转向
    autoRun:false,//自动开
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
            anchorY:0.3
        });
        this.scheduleUpdate();
        //速度控制
        this.schedule(function(){
            if(this.state==0){
                return;
            }
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
            else if(this.state==4){
                if(this.speed<=0){
                    this.speed==0;
                    this.state=4;
                }
                else{
                    this.speed=this.autoSpeed;
                    //this.speed-=this.accAutoSpeedDown;
                }
            }
        },0.1);
    },
    update:function(dt) {
        if(this.speed>=0){
            //更新位置
            this.y+=this.speed;
            //更新车身角度
            if(this.steeredAngle!=0){
                //内半径=轴距/tan(前轮转角)+后轮中点宽度
                var radius1=this.wheelbase/Math.tan( this.steeredAngle*Math.PI/180);
                //行动半径
                var radius2=radius1+this.getContentSize().width/2;

                //转角=弧长/弧度=弧长*180/(PI*半径)
                var ang=this.speed*180/(Math.PI*radius2);
                this.x+=((radius1-Math.cos(ang*Math.PI/180)*radius2)*(this.steeredAngle>0?-1:1))/500*this.speed;
                if(this.x<130+45)
                    this.x=130+45;
                if(this.x>640-(120+45))
                    this.x=640-(120+45);
                //this.rotation=ang*30;
            }

        }
    },
    Refuel:function(){
        //加油
        this.state=1;
    },
    SpeedDown:function(){
        //自然减速
        this.state=4;
    },
    Brake:function(){
        //刹车
        this.state=3;
    },
    Stop:function(){
        //直接停止
        this.state=0;
        this.speed=0;
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
    roadSide:{l:130,r:640-130},//道路边界
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
            spSpiteLine.x=i % 2==0?260:(640-260);
            spSpiteLine.y=0 + 300 * (Math.floor(i / 2) + 1);
            this.addChild(spSpiteLine);
        }

        //植物
        var count=2;
        this.spPlants=new Array(count*2);
        for(var i=0;i<count;i++){
            //左边
            var plant=new cc.Sprite(res.img_grass);
            plant.y=960*i;
            plant.anchorY=0;
            plant.anchorX=0;
            plant.flippedY=i%2!=0;
            this.addChild(plant);
            this.spPlants[i*2]=plant;
            //右边
            var plant=new cc.Sprite(res.img_grass);
            plant.anchorX=1;
            plant.anchorY=0;
            plant.flippedX=true;
            plant.x=640;
            plant.y=960*i;
            plant.flippedY=i%2!=0;
            this.addChild(plant);
            this.spPlants[i*2+1]=plant;
        }

        this.scheduleUpdate();
        return true;
    },
    onEnter:function(){
        this._super();
        //this.runAction(cc.follow(this.carBlack));
        this.schedule(this.updateBlock,4);
    },
    update:function(dt){
        //follow
        this.y=400-this.carBlack.y;
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
            if(spPlant.y+this.y<=-960){
                spPlant.y+=960*2;
                this.spPlants[i*2+1].y=spPlant.y;
            }
        }

        //车辆碰撞检测
        if(cc.rectIntersectsRect( this.carBlack.getBoundingBox(),this.carRed.getBoundingBox())){
            if(this.carRed.y>this.carBlack.y){
                this.carRed.Brake();
                this.carBlack.Stop();
                if(this.carRed.state==0){
                    //如果停止状态 加入被撞位移
                    this.carRed.runAction(cc.moveBy(0.2,cc.p(0,10)));
                }
            }
            else{
                if(this.carBlack.state==0){
                    //如果停止状态 加入被撞位移
                    this.carBlack.runAction(cc.moveBy(0.2,cc.p(0,10)));
                }
                this.carRed.Stop();
                this.carBlack.Brake();
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
    },
    updateBlock:function(){
        //自动阻挡
        //阻挡玩家
        if(this.carRed.state!=0 && this.carBlack.state!=0){
            //黑车在后面 红车随机转向
            if(this.carRed.y-this.carBlack.y>100){
                if(this.carRed.steeredAngle!=40){
                    this.carRed.steeredAngle=40;
                }
                else{
                    this.carRed.steeredAngle=-40;
                }
                /*if(this.carRed.x-this.carBlack.x>30){
                    this.carRed.steeredAngle=-20;
                }
                else if(this.carRed.x-this.carBlack.x<-30){
                    this.carRed.steeredAngle=20;
                }
                else{
                    this.carRed.steeredAngle=0;
                }*/
            }
            //黑车在前面
            if(this.carBlack.y-this.carRed.y>100){
                var dist=Math.sqrt(Math.pow((this.carBlack.x-this.carRed.x),2)+Math.pow((this.carBlack.y-this.carRed.y),2))
                if(dist>300){
                    if(this.carRed.x-this.carBlack.x>30){
                        this.carRed.steeredAngle=30;
                    }
                    else if(this.carRed.x-this.carBlack.x<-30){
                        //if(this.carRed.x)
                        this.carRed.steeredAngle=-30;
                    }
                    else{
                        this.carRed.steeredAngle=0;
                    }
                }
            }
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
        var carBlack=new Car(0,11);
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

        this.road.carRed.autoRun=true;
        this.road.carRed.Refuel();
        this.scheduleUpdate();

        if ('touch' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH,
                onTouchBegin: function (touch, event) {
                    var target = event.getCurrentTarget();
                    target.labDistence.color= cc.color._getGreen();
                    //加油门
                    target.road.carBlack.Refuel();

                    target.touchStartPosi=touch.getLocation();
                    return true;
                },
                onTouchMoved: function (touch,event) {
                    var target = event.getCurrentTarget();
                    if(target.road.carBlack.isRun() && target.touchStartPosi!=null){
                        var newPosi=touch.getLocation();
                        var offsetX=newPosi.x-target.touchStartPosi.x;
                        //target.road.carBlack.steeredAngle= Math.max(-20,Math.min(30,offsetX*3));
                        if(offsetX>=5){
                            target.road.carBlack.steeredAngle=5;
                        }
                        else if(offsetX<=-5){
                            target.road.carBlack.steeredAngle=-5;
                        }
                        else{
                            target.road.carBlack.steeredAngle=0;
                        }
                    }
                },
                onTouchEnded: function (touch,event) {
                    var target = event.getCurrentTarget();
                    target.road.carBlack.SpeedDown();
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

