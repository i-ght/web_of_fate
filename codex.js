const PHI = 1.618033;
const width = 1337;
const height = 826;


function dequeue(selections) {
  const ret = selections.shift();
  selections.push(ret);
  return ret;
}

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

function getGfxCtx() {
  /** @type {HTMLCanvasElement}  */
  const canvas = document.getElementById("canvas0");
  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext("2d");
  
  return [canvas, ctx];
}

function fillRect(
  /** @type {CanvasRenderingContext2D}*/ 
  gfx,
  color,
  x,
  y,
  w,
  h
) {
  gfx.clearRect(x, y, w, h);
  gfx.fillStyle = color;
  gfx.fillRect(x, y, w, h);
}

const OptionOfXAndOrY = 
  Object.freeze({
    NONE:  0,
    X:     1,
    Y:     2
  });

class Bounds {
  static notOut(a) { return a === OptionOfXAndOrY.NONE; }
  static outX(a) { return a & OptionOfXAndOrY.X; }
  static outY(a) { return a & OptionOfXAndOrY.Y; }
  static outXY(a) { return a & OptionOfXAndOrY.X && a & OptionOfXAndOrY.Y; }
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Domain extends Vector { }
class Momentum extends Vector { }

class Force {
  constructor(gfx, domain, momentum) {
    this.gfx = gfx;
    this.domain = domain;
    this.momentum = momentum;
  }

  radiate() { 
    throw new TypeError("needs definition.");
  }
  
  advance() {
    this.domain.x = this.domain.x + this.momentum.x;
    this.domain.y = this.domain.y + this.momentum.y;
  }

  changeDir(dir) {
    this.momentum.x = this.momentum.x * dir.x;
    this.momentum.y = this.momentum.y * dir.y;  
  }
  
  outOfBounds() {
    let x = false;
    let y = false;

    if (this.domain.x > width || this.domain.x < 0) {
      x = true;
    }
    
    if (this.domain.y > height || this.domain.y < 0) {
      y = true;
    }
    
    if (x && y)  {
      return OptionOfXAndOrY.X | OptionOfXAndOrY.Y;
    }
    else if (x && !y) {
      return OptionOfXAndOrY.X;
    }
    else if (y && !x) {
      return OptionOfXAndOrY.Y;
    } 
      
    return OptionOfXAndOrY.NONE;

  }
}

const DIR_CHANGES = Object.freeze({
  [OptionOfXAndOrY.X]: {x:-1, y: 1},
  [OptionOfXAndOrY.Y]: {x:1, y:-1},
  [OptionOfXAndOrY.X | OptionOfXAndOrY.Y]: {x: -1, y: -1}
});

const colors =  [
  "black",
  "red",
  "yellow",
  "whitesmoke",
  "green",
  "blue",
  "cyan",
  "purple"
];

/*
Mightily wove they | the web of fate,
While Bralund's towns | were trembling all;
And there the golden | threads they wove,
And in the moon's hall | fast they made them.
*/

class WebOfFate extends Force {
  constructor(gfx, domain, momentum, sideLength) {
    super(gfx, domain, momentum);
    this.sideLength = sideLength;
  }

  radiate() {
    const mymy = this;
    const xyOrNone = mymy.outOfBounds();

    if (Bounds.outXY(xyOrNone)) {
        mymy.changeDir(
          DIR_CHANGES[OptionOfXAndOrY.X | OptionOfXAndOrY.Y]
        );  
    } else if (Bounds.outY(xyOrNone)) {
      mymy.changeDir(
          DIR_CHANGES[OptionOfXAndOrY.Y]
      );
    } else if (Bounds.outX(xyOrNone)) {
      mymy.changeDir(
          DIR_CHANGES[OptionOfXAndOrY.X]
      );
    }

    fillRect(this.gfx, dequeue(colors), mymy.domain.x, mymy.domain.y, mymy.sideLength, mymy.sideLength);
  }
}

function changePhase(phase) {
  const {space} = phase;
  space.advance();
  space.radiate();
  
}

function codex() {
  const [_, gfx] = getGfxCtx();
  const space = new WebOfFate(gfx, new Domain(x=0, y=0), new Momentum(x=6, y=9), 9);
  const phase = {space};

  setInterval(changePhase, 1000/144, phase)
}
