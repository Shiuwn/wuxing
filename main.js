import './style/index.scss'
import $ from 'jquery'
import { gsap } from 'gsap'
import { Game } from './game'

$(function () {
  const game = new Game({
    $container: $('#app'),
    boundary: 100
  })

  game.start()

})
