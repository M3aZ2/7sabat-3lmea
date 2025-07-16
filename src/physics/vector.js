var vector={
    _x,
    _y,
    _z,

create: function(xVal,yVal,zVal){
    var object = Object.create(this);
    object.setX(xVal);
    object.setY(yVal);
    object.setZ(zVal);
},
getX: function(){
    return this._x;
},

getY: function(){
    return this._y;
},

getZ: function(){
    return this._z;
},

setX: function(val){
    this._x = val;
},

setY: function(val){
    this._y = val;
},

setZ: function(val){
    this._z = val;
},

sum: function(vec){
    return vector.create(
        this._x + vec.getX(),
        this._y + vec.getY(),
        this._z + vec.getZ()
    );
},

sumBy: function(vec){
    this._x += vec.getX();
    this._y += vec.getY();
    this._z += vec.getZ();
},

multiply: function (val) {
    return vector.create(
        this._x * val,
        this._y * val,
        this._z * val
    );
},

multiplyBy : function (val) {
    this._x *= val;
    this._y *= val;
    this._z *= val;
},

divide: function (val) {
    return vector.create(
        this._x / val,
        this._y / val,
        this._z / val
    );
},

divideBy : function (val) {
    this._x /= val;
    this._y /= val;
    this._z /= val
},

getLength: function () {
    return Math.sqrt(this._x * this._x + this._y * this._y+this._z * this._z);
},

square: function(){
    return this.getLength() * this.getLength();
},

normalize: function () {
return vector.create(
    this._x / this.getLength() || 0,
    this._y / this.getLength() || 0,
    this._z / this.getLength() || 0
    );
},

clone: function () {
    return vector.create(
        this._x,
        this._y,
        this._z
    );
},


}