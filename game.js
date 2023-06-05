import { Attrs } from './config'

const AS_TYPE = {
  ATTACKER: 'attacker',
  BOMB: 'bomb'
}

const fragment = document.createDocumentFragment()
class Vector {
  x = 0
  y = 0
  constructor(x, y) {
    this.x = x
    this.y = y
  }

}
class Block {
  /**
   * 位置
   * @prop {Vector}
   */
  position = new Vector()
  /**
   * 速度
   * @prop {Vector}
   */
  velocity = new Vector()
  /**
   * 加速度
   * @prop {Vector}
   */
  accelerate = new Vector()
  /**
   * 高度
   * @prop {number}
   */
  height = 10
  /**
   * 宽度
   * @prop {number}
   */
  width = 10
  // 作为进攻者或者炮弹
  as = AS_TYPE.ATTACKER
  #_active = false
  /**
   * @prop {string} 类型
   */
  type
  /**
   * 负载的分数
   * @type {number}
   */
  payload = 10
  // 动画间隔时长
  duration = 1000
  // 每一次步进的距离像素
  step = 10
  /**
   * 对象对应的dom
   * @type {HTMLElement}
   */
  dom = null
  constructor({
    type,
    asType,
    step,
    duration
  }) {
    this.type = type
    this.as = asType
    this.active = true
    this.duration = duration
    this.step = step
  }

  /**
   * 碰撞
   * @param {Block} block
   */
  collided(block) {
    if (block.as == this.as) return
    const pos1 = block.position
    const pos2 = this.position
    const width1 = block.width
    const height1 = block.height
    const width2 = this.width
    const height2 = this.height
    return !((pos1.x > pos2.x + width2 || pos2.x > pos1.x + width1) && (
      pos1.y > pos2.y + height2 || pos2.y > pos1.y + height1
    ))
  }

  set active(val) {
    this.#_active = !!val
    this.onInactive()
  }
  get active() {
    return this.#_active
  }
  /**
   * 更新位置
   */
  update() { }
  /**
   * 失活时触发的事件
   */
  onInactive() {
    dom && fragment.appendChild(this.dom)
  }
}


/**
 * 收集器
 */
class Collector {
  limit = 5
  /**
   * block数组
   * @type {Block[]}
   */
  lists = []
  /**
   * 收集block
   * @param {Block} block
   */
  collect(block) {
    // 超过数量停止收集
    if (this.lists.length >= this.limit) return false

    // 同类型停止收集
    if (this.lists.map(d => d.type).indexOf(block.type) > -1) return false

    this.lists.push(block)
    return true
  }

  /**
   * 置顶
   * @param {number} index
   */
  top(index) {
    if (this.lists.length <= 1) return
    if (index === 0) return
    if (index > this.lists.length - 1) return
    const temp1 = this.lists[index]
    const temp2 = this.lists[0]
    this.lists[index] = temp2
    this.lists[0] = temp1
  }
}

// 管理生成块
class Manager {
  /**
   * @type {Block[]} 生成的块的集合
   */
  blocks = []
  /**
   * @param {string} type 类型
   * @param {number} num 生成的数量
   */
  make(type, num = 1) {
    let blocks = this.blocks.filter((d) => !d.active)
    const increment = num - blocks.length
    if (increment < 0) {
      blocks = blocks.slice(0, -increment)
    } else {
      const added = Array(increment).fill(null).map(() => new Block(type))
      blocks.push(...added)
      this.blocks.push(...added)
    }
    return blocks
  }
}

// 游戏
class Game {
  // 安全区的位置
  safeZone = 100
  // 分数
  score = 0
  /**
   * 配置
   * @param {{zone: number, duration: number}} options
   */
  constructor(options) {
    this.safeZone = options.zone
    this.duration = duration
    /**@type {Collector} */
    this.collector = new Collector()
    /**@type {Manager} */
    this.manager = new Manager()
  }
  // 更新
  update() {
    const activeBlock = this.manager.blocks.filter((d) => d.active)
    // TODO: 更新attacker位置
    activeBlock.forEach((a) => {
      a.position.x += a.velocity.x
      a.position.y += a.velocity.y
      a.velocity.x += a.accelerate.x
      a.velocity.y += a.accelerate.y
    })

  }
  tick() {

  }
  // 开火
  fire() {


  }
  // 切换炮弹
  toggle() {

  }
  /**
   * 是否进入安全区
   * @param {Block} block
   * @returns
   */
  intoSafeZone(block) {
    return block.position.y + block.height >= this.safeZone
  }

}

export const init = () => {

}
