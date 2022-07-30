var cutMask = [];
var wImg,hImg
var pg;
var d = 1;

const frameNum = 10;
var pFrame = 0;
var topImg;
var backImgs = [];
var frameImg;

var pKeyIsPressed = false;

function preload(){
  topImg = loadImage('./image/cassis.jpg');
  // backImg = loadImage("./image/cassis_bg.jpg");
  for(var p = 0; p < frameNum; p++){
    backImgs.push(loadImage('./image/cassis_bg/kimo10_'+ ('00000' + p).slice(-5) + '.jpg'));
  }
  frameImg = loadImage('./image/frame.png');
}
function setup(){
  wImg = Math.floor(topImg.width / 5);
  hImg = Math.floor(topImg.height / 5);
  
  for(var p = 0; p < frameNum; p++){
    backImgs[p].resize(wImg, hImg);
  }
  topImg.resize(wImg, hImg);
  frameImg.resize(wImg,hImg);
  createCanvas(window.outerWidth, window.outerHeight);
  noStroke();
  smooth();

  pg = createGraphics(wImg, hImg);
  pg.noStroke();
  pgFrame = createGraphics(wImg, hImg);
  pgFrame.noStroke();

}
function draw(){
  // background(255,10,110);
  image(backImgs[pFrame], (width - wImg) / 2, 30);
  pg.background(topImg);
  if(keyIsPressed && !pKeyIsPressed){
    Cut(true, false);
  }
  else if(keyIsPressed && pKeyIsPressed){
    Cut(false, false);
  }
  else if(!keyIsPressed && pKeyIsPressed){
      Cut(false, true);
  }
  if(cutMask.length > 0){
    for(var p = 1; p < cutMask.length; p++){
      cutMask[p].displayBlood();
    }
    for(var p = 1; p < cutMask.length; p++){
      cutMask[p].display();
    }
  }
  
  // pgFrame.fill(255,10,110);
  // pgFrame.rect(0, 0, wImg, hImg)
  // pgFrame.erase();
  // pgFrame.rect(20,20,wImg - 40, hImg - 40);
  // pgFrame.noErase();
  
  image(pg,(width - wImg) / 2, 30);
  
  // image(frameImg, (width - wImg) / 2, 30);
  // image(pgFrame,(width - wImg) / 2, 30);
  
  pKeyIsPressed = keyIsPressed;
  pFrame = (pFrame + 1) % frameNum;
}

function Cut(start, end){
  let s = Math.round(randMinMax(5, 10));
  cutMask.push(new mask(mX(mouseX), mY(mouseY), s, Math.round(randMinMax(50,500))));
  
  var distX = mouseX - pmouseX;
  var distY = mouseY - pmouseY;
  var dist = Math.sqrt(distX**2 + distY**2);
  var plotNum = dist / d;
  var dX = distX / plotNum;
  var dY = distY / plotNum;

  for(var p = 1; p <= plotNum; p++){
    cutMask.push(new mask(mX(pmouseX) + p * dX, mY(pmouseY) + p * dY, Math.round(randMinMax(5, 10)), 0));
    // print(pmouseX + p * dX, pmouseY + p * dY, cutSize(), 0)
  }

  if(start){
    for(var p = 1; p <= 100; p++){
      cutMask.push(new mask(mX(mouseX) - p * dX, mY(mouseY) - p * dY, s * Math.pow(0.99, p),0 ));
    }
    
  }
  else if(end){
    for(var p = 1; p <= 100; p++){
      cutMask.push(new mask(mX(mouseX) + p * dX, mY(mouseY) + p * dY, s * Math.pow(0.99, p),0 ));
    }
  }

}

function cutSize(){
  // return Math.round(randMinMax(1, 10));
  return Math.round(randMinMax(1, 40));
}

function randMinMax(min, max){
  return Math.random() * (max - min) + min
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
  
  display(){
    pg.erase();
    pg.ellipse(this.x, this.y, this.s);
    pg.noErase();
  }
  
  displayBlood(){
    pg.fill(255,10,110,90);
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
  }
  
  display(){
    pg.fill(255,10,110,90);
    pg.ellipse(this.x, this.y, this.s * randMinMax(1.2, 1.5));
    this.t++;
  }

  drop(){
    if(this.t < 50){
      this.s *= 1.01;
    }
    else{
      this.y += this.v;
      this.v = 0.05 * this.g * this.t;
    }
  }
}

function windowResized() {
  resizeCanvas(window.outerWidth, window.outerHeight);
}

function mX(x) {
  return x - (width - wImg) / 2;
}

function mY(y) {
  return y - 30;
}