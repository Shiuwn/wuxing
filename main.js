import './style/index.scss'
import $ from 'jquery'
import { gsap } from 'gsap'
import { Game } from './game'

$(function () {
  const $container = $('#app')
  const game = new Game({
    $container: $container,
    boundary: $container.height() - 100
  })

  game.start()

})
