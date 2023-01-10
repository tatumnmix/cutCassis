var cutMask = [];
var wImg,hImg
var pg;
var d = 4;

const frameNum = 10;
var pFrame = 0;
var topImg;
var backImgs = [];
var frameImg;

var sMax = 15;
var sMin = 9;

var f = 0;
var started = null;
var tipLen = 5;

function preload(){
  topImg = loadImage('./image/cassis.jpg');
  // backImg = loadImage("./image/cassis_bg.jpg");
  for(var p = 0; p < frameNum; p++){
    backImgs.push(loadImage('./image/cassis_bg/kimo10_'+ ('00000' + p).slice(-5) + '.jpg'));
  }
  frameImg = loadImage('./image/frame.png');
}
function setup(){
  // 縦横対応
  if(innerWidth >= innerHeight ){
    hImg = Math.floor(innerHeight * 0.9);
    wImg = Math.floor(hImg * float(topImg.width / topImg.height));
  }
  else{
    wImg = Math.floor(innerWidth * 0.9);
    hImg = Math.floor(wImg * float(topImg.height / topImg.width))
  }
  // 背景アニメーションの設定
  for(var p = 0; p < frameNum; p++){
    backImgs[p].resize(wImg, hImg);
  }
  topImg.resize(wImg, hImg);
  frameImg.resize(wImg,hImg);
  createCanvas(innerWidth, innerHeight);
  noStroke();
  smooth();

  pg = createGraphics(wImg, hImg);
  pg.noStroke();
  pgFrame = createGraphics(wImg, hImg);
  pgFrame.noStroke();
}

function draw(){
  image(backImgs[pFrame], (innerWidth - wImg) / 2, (innerHeight - hImg) / 2);
  pg.background(topImg);
  
  if(cutMask.length > 0){
    for(var p = 1; p < cutMask.length; p++){
      cutMask[p].displayBlood();
    }
    for(var p = 1; p < cutMask.length; p++){
      cutMask[p].display();
    }
  }
  image(pg, (innerWidth - wImg) / 2, (innerHeight - hImg) / 2);

  pFrame = (pFrame + 1) % frameNum;
}

function touchMoved(){
  Cut(false);
}

function touchStarted(){
  Cut(false);
  started = f;
}

function touchEnded(){
  Cut(true);
}

function Cut(end){
  // 切り傷の太さ
  let s = Math.round(randMinMax(sMin, sMax));

  cutMask.push(new mask(mX(mouseX), mY(mouseY), s, Math.round(randMinMax(50,200))));
  
  //補完
  var distX = mouseX - pmouseX;
  var distY = mouseY - pmouseY;
  var dist = Math.sqrt(distX**2 + distY**2);
  var plotNum = dist / d;
  var dX = distX / plotNum;
  var dY = distY / plotNum;

  for(var p = 1; p <= plotNum; p++){
    cutMask.push(new mask(mX(mouseX) + p * dX, mY(mouseY) + p * dY, Math.round(randMinMax(sMin, sMax)), 0));
  }

  //先端の処理
  if(f == started + 1){
    for(var p = 1; p <= int(dist*tipLen); p++){
      cutMask.push(new mask(mX(mouseX) - p * dX, mY(mouseY) - p * dY, s * Math.pow(0.96, p),0 ));
    }
    started = null;
  }
  
  if(end){
    for(var p = 1; p <= int(dist*tipLen); p++){
      cutMask.push(new mask(mX(mouseX) + p * dX, mY(mouseY) + p * dY, s * Math.pow(0.98, p),0 ));
    }
  }
  f++;
}

const mask = class{
  constructor(x, y, s, dropFreq) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.dropFreq = dropFreq;
    this.dropBloods = [];
    this.lifeTime = 0;
  }
  //切り傷の描画
  display(){
    pg.erase();
    pg.ellipse(this.x, this.y, this.s);
    pg.noErase();
  }
  //血液
  displayBlood(){
    pg.fill(255,10,110+randMinMax(-15,15),90 + randMinMax(-10, 100));
    // pg.ellipseMode(CORNER);
    pg.ellipse(this.x, this.y, this.s * randMinMax(1.3, 1.9));
    if(this.lifeTime % this.dropFreq == 0){
      this.dropBloods.push(new blood(this.x, this.y, this.s));
    }
    if(this.dropBloods.length > 0){
      for(var p = 0; p < this.dropBloods.length; p++){
        if(this.dropBloods[p].y <= hImg){
          this.dropBloods[p].display();
          this.dropBloods[p].drop();
        }
        else{
          // this.dropBloods[p] = null;
          // this.pStart++;
          this.dropBloods = this.dropBloods.slice(1, this.dropBloods.length);
        }
      }
    }
    this.lifeTime++;

  }
}

const blood = class{
  constructor(x, y, s) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.g = 9.8;
    this.v = 0;
    this.t = 0;
    this.sizeMax = s * randMinMax(1.1, 1.5);
  }
  
  display(){
    pg.fill(255,10,110,90 + randMinMax(-10, 100));
    // pg.ellipseMode(CORNER);
    pg.ellipse(this.x, this.y, this.s * randMinMax(0.8, 1.2), this.s * randMinMax(1.2, 1.5));
    this.t++;
  }

  drop(){
    if(this.s < this.sizeMax){
      this.s *= 1.01;
    }
    else{
      this.y += this.v;
      this.v = 0.01 * this.g * this.t;
    }
  }
}

function windowResized() {
  resizeCanvas(window.outerWidth, window.outerHeight);
}

function mX(x) {
  return x - (innerWidth - wImg) / 2;
}

function mY(y) {
  return y - (innerHeight - hImg) / 2;
}

function disableScroll(event) {
  event.preventDefault();
}

function randMinMax(min, max){
  return Math.random() * (max - min) + min;
}

// イベントと関数を紐付け
document.addEventListener('touchmove', disableScroll, { passive: false });