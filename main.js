import './style/index.scss'
import $ from 'jquery'
import { Game } from './gameNew'

$(function () {
  const $container = $('#app')
  const game = new Game({
    $container: $container,
    boundary: $container.height() - 100
  })

  game.start()

})
