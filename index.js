const query = (sel) => {
  return document.querySelector(sel)
}
const abs = (val) => Math.abs(val)
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

const genNum =
  (start = 0) =>
  () => {
    return start++
  }
const genId = genNum(0)
const genTaskId = genNum(0)

const Attrs = [
  {
    type: 'gold',
    name: '金',
    opposite: 'fire',
    friend: 'soil',
  },
  {
    type: 'wood',
    name: '木',
    opposite: 'gold',
    friend: 'water',
  },
  {
    type: 'water',
    name: '水',
    opposite: 'soil',
    friend: 'gold',
  },
  {
    type: 'fire',
    name: '火',
    opposite: 'water',
    friend: 'wood',
  },
  {
    type: 'soil',
    name: '土',
    opposite: 'wood',
    friend: 'fire',
  },
]

class Game {
  #width = 400
  #height = 600
  #manager = null
  #timer = null
  container = null
  constructor(options = {}) {
    this.#width = options.width || 400
    this.#height = options.height || 600
    this.#manager = new Manager(this)
    this.container = query(options.container || '#app')
    this.container.style.width = `${this.#width}px`
    this.container.style.height = `${this.#height}px`
  }
  start() {
    if (!this.#timer) {
      this.update()
    }
  }
  stop() {
    if (this.#timer) {
      cancelAnimationFrame(this.#timer)
      this.#timer = null
    }
  }
  getSceneSize() {
    return [this.#width, this.#height]
  }
  update() {
    this.#manager.blocks.forEach((block) => block.update(this.#manager))
    this.#timer = requestAnimationFrame(() => {
      this.update()
    })
  }
  produceBlocks() {
    this.#manager.produce()
  }
}

class Manager {
  #count = 5
  blocks = []
  #game = null
  constructor(/**@type {Game} */ game) {
    this.#game = game
  }
  add(block) {
    this.blocks.push(block)
  }
  produce() {
    const [width] = this.getBoundary()
    const interval = Math.floor(width / this.#count)
    for (let i = 0; i < this.#count; i++) {
      const block = new Block()

      const randomIndex = random(0, Attrs.length)
      const length = 20
      this.add(
        block.init({
          length,
          x:
            random(
              interval * i + interval / 4,
              interval * i + (interval * 3) / 4
            ) -
            length / 2,
          y: -20,
          vx: 0,
          vy: random(1, 3),
          a: 0,
          attr: Attrs[randomIndex],
          name: Attrs[randomIndex].name,
        })
      )
      this.#game.container.appendChild(block.dom)
    }
    return this
  }
  getBoundary() {
    return this.#game.getSceneSize()
  }
}

class Block {
  name = ''
  length = 0
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
  hidden = false
  constructor() {
    this.id = genId()
  }

  init(opt) {
    this.name = opt.name
    this.length = opt.length
    this.vx = opt.vx
    this.vy = opt.vy
    this.a = opt.a
    this.x = opt.x
    this.y = opt.y
    this.attr = opt.attr
    this.hidden = false
    this.dom = opt.dom || this.genDom()
    this.dom.style.cssText = `
      line-height: ${this.length}px;
      width: ${this.length}px;
      height: ${this.length}px;
    `
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
    this.attr = null
    return this
  }

  collide() {}

  isOutBoundary(/**@type {Manager} */ manager) {
    const [width, height] = manager.getBoundary()

    if (
      this.x + this.length < 0 ||
      this.x > width ||
      this.y + this.length < 0 ||
      this.y > height
    )
      return true
    return false
  }

  update(/**@type {Manager} */ manager) {
    this.tasks.slice().forEach((frame) => {
      frame && frame.perform && frame.perform()
    })

    this.vx += this.a
    this.vy += this.a
    this.x += this.vx
    this.y += this.vy

    this.dom.style.left = this.x + 'px'
    this.dom.style.top = this.y + 'px'

    if (this.isOutBoundary(manager)) {
      this.remove()
    }
    return this
  }
  toV(v, dir = 'vx') {
    if (abs(v, this[dir]) < this.a) return
    const oldV = this[dir]
    const task = {
      id: genTaskId(),
      perform: () => {
        if (abs(v, this[dir]) < this.a) {
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
  addTask(task) {
    this.tasks.push(task)
  }
  removeTask(task) {
    const index = this.tasks.findIndex((t) => task && t.id === task.id)
    index > -1 && this.tasks.splice(index, 1)
  }
  genDom() {
    const div = document.createElement('div')
    div.className = `block ${this.attr.type}`
    div.textContent = this.attr.name

    return div
  }
  remove() {
    this.hidden = true
    this.dom.style.display = 'none'
    this.dom.remove()
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

function main() {
  const game = new Game({
    width: 400,
    height: 600,
  })
  game.produceBlocks()
  game.start()
}

main()
