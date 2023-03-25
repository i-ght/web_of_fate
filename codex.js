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

  add(value) {
    this.x = this.x + value.x;
    this.y = this.y + value.y;
  }
  mult(value) {
    this.x = this.x * value.x;
    this.y = this.y * value.y;
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
    this.domain.add(this.momentum);
  }

  changeDir(dir) {
    this.momentum.mult(dir);
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
    fillRect(
      this.gfx,
      dequeue(colors),
      mymy.domain.x,
      mymy.domain.y,
      mymy.sideLength,
      mymy.sideLength
    );
  }
}

function changePhase(phase) {
  for (const web of phase.fate) {
    web.advance();

    const xyOrNone = web.outOfBounds();
    if (xyOrNone != OptionOfXAndOrY.NONE) {
      if (Bounds.outXY(xyOrNone)) {
        web.changeDir(
          DIR_CHANGES[OptionOfXAndOrY.X | OptionOfXAndOrY.Y]
        );  
      } else if (Bounds.outY(xyOrNone)) {
        web.changeDir(
            DIR_CHANGES[OptionOfXAndOrY.Y]
        );
      } else if (Bounds.outX(xyOrNone)) {
        web.changeDir(
            DIR_CHANGES[OptionOfXAndOrY.X]
        );
      }
    }
    web.radiate();
  }
}

function codex() {
  const [_, gfx] = getGfxCtx();
  const fate = [];
  for (let i = 0; i < 1; i++) { 
    const web = new WebOfFate(
      gfx,
      new Domain(x=i*223, y=i*232),
      new Momentum(x=6, y=9),
      9
    );
    fate.push(web);
  }
  const phase = {fate};

  setInterval(changePhase, 1000/144, phase)
}
