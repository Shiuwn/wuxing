const query = (sel) => {
  return document.querySelector(sel)
}
const abs = (val) => Math.abs(val)

const genNum =
  (start = 0) =>
  () => {
    return start++ % Number.MAX_SAFE_INTEGER
  }
const genId = genNum(0)
const genTaskId = genNum(0)

const Attrs = [
  {
    type: 'gold',
    opposite: 'fire',
    friend: 'soil',
  },
  {
    type: 'wood',
    opposite: 'gold',
    friend: 'water',
  },
  {
    type: 'water',
    opposite: 'soil',
    friend: 'gold',
  },
  {
    type: 'fire',
    opposite: 'water',
    friend: 'wood',
  },
  {
    type: 'soil',
    opposite: 'wood',
    friend: 'fire',
  },
]

class Game {
  constructor() {}
  start() {}
  perform() {}
  stop() {}
}

class Manager {
  collection = []
  constructor() {}

  add(dom) {
    this.collection.push(dom)
  }
}

class Block {
  name = ''
  edge = 0
  vx = 0
  vy = 0
  a = 0
  x = 0
  y = 0
  bullet = false
  scale = 1
  buff = 1
  dom = null
  tasks = []
  constructor() {
    this.id = genId()
  }

  init(opt) {
    this.name = opt.name
    this.edge = opt.edge
    this.vx = opt.vx
    this.vy = opt.vy
    this.a = opt.a
    this.x = opt.x
    this.y = opt.y
    this.dom = opt.dom
    return this
  }

  reset() {
    this.name = ''
    this.edge = 0
    this.vx = 0
    this.vy = 0
    this.a = 0
    this.x = 0
    this.y = 0
    this.bullet = false
    this.scale = 1
    this.buff = 1
    this.dom = null
    this.tasks.length = 0
    return this
  }

  collide() {}

  update() {
    this.tasks.slice().forEach((frame) => {
      frame && frame.perform && frame.perform()
    })
    this.vx += this.a
    this.vy += this.a
    this.x += this.vx
    this.y += vy
    return this
  }
  toV(v, dir = 'vx') {
    if (abs(v, this[dir]) < this.a) return
    const oldV = this[dir]
    const task = {
      id: genTaskId(),
      perform: () => {
        if(abs(v, this[dir]) < this.a) {
          this.removeTask(task)
          return
        }
        if (oldV > v) {
          this[dir] = oldV - this.a
        } else {
          this[dir] = oldV + this.a
        }
      },
    }
    this.addTask(task)
  }
  resize() {}
  remove() {}
  addTask(task) {
    this.tasks.push(task)
  }
  removeTask(task) {
    const index = this.tasks.findIndex((t) => task && t.id === task.id)
    index>-1 && this.tasks.splice(index, 1)
  }
}

class Package {
  list = []
  attrList = []
  constructor() {}
  add(block) {
    if (this.attrList.indexOf(block.attr) < 0) {
      this.list.push(block)
    } else {
      // end
    }
  }
  remove(block) {
    const index = this.list.findIndex((b) => b === block)
    if (index > -1) {
      this.list.splice(index, 1)
    }
  }
  swap() {
    if (this.list.length) {
      this.list.push(this.list.shift())
    }
  }
}

function main() {}

main()
