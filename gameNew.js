import { Attrs } from './config'
import anime from 'animejs/lib/anime.es'
import { createError, randomGet } from './utils'
import $ from 'jquery'
import { random, clamp } from 'lodash-es'
import mitt from 'mitt'
class Emitter {
  emitter
  constructor() {
    this.emitter = mitt()
  }
  all(...args) {
    this.emitter.all(...args)
  }
  on(...args) {
    this.emitter.on(...args)
  }
  off(...args) {
    this.emitter.off(...args)
  }
  emit(...args) {
    this.emitter.emit(...args)
  }
}

const AS_TYPE = {
  ATTACKER: 'attacker',
  BULLET: 'bullet'
}

const fragment = document.createDocumentFragment()
class Vector {
  x = 0
  y = 0
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  static toAngle(radian) {
    return radian / Math.PI * 180
  }
  static toRadian(angle) {
    return angle / 180 * Math.PI
  }
  /**
   * 减法
   * @param {Vector} v
   */
  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y)
  }
  /**
   * 加法
   * @param {Vector} v
   */
  add(v) {

    return new Vector(this.x + v.x, this.y + v.y)
  }
  /**
   *
   * @param {number} s
   */
  mul(s) {
    return new Vector(this.x * s, this.y * s)
  }
  /**
   * 点乘
   * @param {Vector} v
   */
  dot(v) {
    return this.x * v.x + this.y * v.y
  }
  /**
   * 长度
   */
  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  /**
   * 投影
   * @param {Vector} v
   */
  proj(v) {
    return this.dot(v) / v.norm()
  }
  /**
   * 向量夹角
   * @param {Vector} v
   */
  angleOf(v) {
    return Math.acos(this.proj(v) / this.norm())
  }

}

class AnimateObj {
  animate(option = {}) {
    this.tween = anime({
      targets: this,
      autoplay: false,
      ...option,
      update: () => {
        this.render()
      }
    })
    return this
  }
  start() {
    this.tween?.play()
    return this
  }
  update(fn) {
    this.tween.update = () => {
      this.render()
      fn && fn()
    }
    return this
  }
  end(fn) {
    this.tween.complete = function () {
      fn && fn()
      this.tween = null
    }
    return this
  }
  render() {
    createError('render method should be override')
  }
}
class Block extends AnimateObj {
  /**
   * 位置
   * @prop {Vector}
   */
  position = new Vector()
  // 位置
  #_x = 0
  #_y = 0
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
  durationSeconds = 1
  // 每一次步进的距离像素
  step = 2
  /**
   * 对象对应的dom
   * @type {HTMLElement}
   */
  dom = null
  /**
   * @type {import('animejs').AnimeInstance|null}
   */
  tween = null
  /**
   * 配置项
   * @param {{type: string, asType: string, step: number, duration: number}} options
   */
  constructor({
    type,
    asType,
    step,
    duration
  }) {
    super()
    this.type = type
    this.as = asType
    this.active = true
    this.durationSeconds = duration || 1
    this.step = step || 10
    this.dom = document.createElement('div')
    this.dom.classList.add('block')
    this.dom.classList.add(type)
    this.timeSpan = random(500, 3000)
  }

  render() {
    this.setStyle()
  }
  reset() {
    this.x = 0
    this.y = 0
    this.width = 10
    this.height = 10
  }

  get x() {
    return this.#_x
  }
  get y() {
    return this.#_y
  }

  set x(val) {
    if (typeof val !== 'number') return
    this.#_x = val
    this.position.x = val
  }
  set y(val) {
    if (typeof val !== 'number') return
    this.#_y = val
    this.position.y = val
  }

  setStyle() {
    this.dom.style.cssText = `
      width: ${this.width}px;
      height: ${this.height}px;
      left: ${this.position.x}px;
      top: ${this.position.y}px;
    `
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
    !val && this.onInactive()
  }
  get active() {
    return this.#_active
  }
  pause() {
    this.tween?.pause()
    return this
  }
  resume() {
    this.tween?.resume()
    return this
  }
  /**
   * 失活时触发的事件
   */
  onInactive() {
    this.dom && fragment.appendChild(this.dom)
  }
  tick(fn) {
    if (!this.#_active) return this
    this.timer = setTimeout(() => {
      this.tick(fn)
    }, this.timeSpan)
    fn && fn()
    return this
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
  constructor() {
    this.$bullets = $('<div class="bullets"/>')
  }
  /**
   * 收集block
   * @param {Block} block
   */
  collect(block) {
    // 超过数量停止收集
    if (this.lists.length >= this.limit) return false

    // 同类型停止收集
    if (this.lists.map(d => d.type).indexOf(block.type) > -1) return false
    fragment.appendChild(block.dom)

    this.lists.push(block)
    this.$bullets.append($(block.dom))
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
   * @param {number} num 生成的数量
   * @param {string} type 类型
   * @param {string} asType 扮演的角色
   */
  make(num = 1, type, asType = AS_TYPE.ATTACKER) {
    let blocks = this.blocks.filter((d) => !d.active)
    const increment = num - blocks.length
    if (increment < 0) {
      blocks = blocks.slice(0, -increment)
    } else {
      const added = Array(increment).fill(null).map(() => new Block({ type: type ? type : randomGet(Attrs).type, asType }))
      blocks.push(...added)
      this.blocks.push(...added)
    }
    return blocks
  }
}

// 炮台
export class Fort extends Emitter {
  angle = 0
  power = 0
  $container = null
  position = new Vector(0, 0)
  width = 20
  height = 60
  /**
   *
   * @param {JQuery} $container
   * @param {Vector} pos
   */

  constructor($container, pos) {
    super()
    this.$container = $container

    this.$guideline = $('<div class="guideline" />')
    this.$fort = $('<div class="fort" />')
    this.$container.append(this.$guideline)
    this.$container.append(this.$fort)
    this.maxAngleSpan = 120
    if (pos) {
      this.position.x = pos.x
      this.position.y = pos.y
    } else {
      this.position.x = this.$container.width() / 2 - this.width / 2
      this.position.y = this.$container.height() - this.height
    }
    this.bindEvent()
    this.render()
  }
  showGuideline() {
    const fort = this
    this.$guideline.css({
      display: 'block',
      left: fort.position.x + fort.width / 2,
      top: fort.position.y,
      transformOrigin: '50% 100%',
      transform: `rotate(${this.angle}rad)`
    })
  }
  updateGuideline() {
    this.$guideline
  }
  bindEvent() {
    const oldPos = new Vector(0, 0)
    const newPos = new Vector(0, 0)
    const center = new Vector(0, 0)
    let initialAngle = 0
    let startAngle = 0
    const mousemove = (e) => {
      newPos.x = e.clientX - center.x
      newPos.y = e.clientY - center.y
      let deltaAngle = Math.atan2(newPos.y, newPos.x) - startAngle
      this.angle = initialAngle + deltaAngle
      this.angle = clamp(this.angle, Vector.toRadian(-this.maxAngleSpan/2), Vector.toRadian(this.maxAngleSpan/2))
      this.emit('rotating', this.angle)
      this.render()
    }
    const mouseup = () => {
      $(window).off('mousemove', mousemove)
      this.emit('rotating.end')
    }
    this.$fort.on('mousedown', (e) => {
      initialAngle = this.angle
      this.emit('rotating.start')
      const ref = this.$fort.get(0).getBoundingClientRect()
      center.x = ref.left + this.width / 2
      center.y = ref.top + this.height
      oldPos.x = e.clientX - center.x
      oldPos.y = e.clientY - center.y
      startAngle = Math.atan2(oldPos.y, oldPos.x)
      $(window).on('mousemove', mousemove)
      $(window).one('mouseup', mouseup)
    })

    this.on('rotating.start', () => {
      this.showGuideline()
    })
    this.on('rotating.end', () => {
      this.$guideline.css({
        display: 'block'
      })
    })
    this.on('rotating', (angle) => {
      this.$guideline.css({
        transform: `rotate(${angle}rad)`
      })
    })
  }
  render() {
    this.$fort.css({
      transform: `rotate(${this.angle}rad)`,
      width: this.width + 'px',
      height: this.height + 'px',
      left: this.position.x + 'px',
      top: this.top + 'px'
    })
  }
  fire() {
    this.emit('fire')
  }
}

// 游戏
export class Game {
  // 安全区的位置
  boundary = 100
  // 分数
  score = 0
  /**
   * 配置
   * @param {{boundary: number, duration: number, $container: JQuery|string}} options
   */
  constructor(options) {
    this.boundary = options.boundary || 100
    this.durationSeconds = options.duration || 1
    this.collector = new Collector()
    this.manager = new Manager()
    this.$container = $(options.$container)
    this.$container.append(this.collector.$bullets)
    this.createBoundary()
    this.fort = new Fort(this.$container)

  }
  createBoundary() {
    this.$boundary = $('<div class="boundary"/>')
    this.$boundary.css({ top: this.boundary })
    this.$container.append(this.$boundary)
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
  // 装填
  fillBullet() {
    if (!this.collector.lists.length) return
    const bullet = this.collector.lists.shift()
    bullet.as = AS_TYPE.BULLET
    this.bullet = bullet
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
    return block.position.y + block.height >= this.boundary
  }

  /**
   * 开始
   */
  start() {
    const containerWidth = this.$container.width()
    const blocks = this.manager.make(3)
    const step = containerWidth / 3
    const frag = document.createDocumentFragment()
    blocks.forEach((b, i) => {
      b.x = random(step * i, step * (i + 1))
      b.y = -10
      frag.appendChild(b.dom)
      this.$container.get(0).appendChild(frag)
      b.tick(() => {
        b.animate({
          y: b.y + b.step,

        })
          .update(() => {
            if (this.intoSafeZone(b)) {
              const success = this.collector.collect(b)
              if (!success) {
                blocks.forEach((b) => b.tween.pause())
              }
            }
          })
          .start()
      })


    })
  }

}


