import { Attrs } from './config'

class Block {
  // 位置
  position = { x: 0, y: 0 }
  // 速度
  velocity = { x: 0, y: 0 }
  // 加速度
  accelerate = { x: 0, y: 0 }

  constructor(type) {
    this.type = type
  }
}

// 进攻者
class Attacker extends Block {
  constructor(type) {
    super(type)
  }
}

class Bomb extends Block {
  constructor(type) {
    super(type)
  }
}

export const init = () => {

}
