/**
 * Created by Matri on 5/7/15.
 */

var Car=cc.Sprite.extend({
    /*_textureLoaded:false,
    _className:"Car",*/
    ctor:function(type){
        var self = this;
        this._super(type==0?res.img_carBlack:res.img_carRed);
        /*self._shouldBeHidden = false;
        self._offsetPosition = cc.p(0, 0);
        self._unflippedOffsetPositionFromCenter = cc.p(0, 0);
        self._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        self._rect = cc.rect(0, 0, 0, 0);*/

        //var filename=res.img_carRed;
        /*if(type!=0){
            filename=res.img_carBlack;
        }*/
        //self.setPositionX(500/3);
        //self._softInit(filename, rect, rotated);
    }

});

Car.create=function(type){
    var sp=new Car();
    sp.initWithFile();
    return sp;
}