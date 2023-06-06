import './style/index.scss'
import $ from 'jquery'
import { gsap } from 'gsap'

$(function () {
  $('#app').html('hello')
  const $dom = $('<div/>')
  $dom.css({
    background: 'red',
    width: 100,
    height: 100,
    position: 'absolute',
    left: 0,
    top: 0
  })
  $('#app').append($dom)
  const tween = gsap.to($dom.get(0), { x: 100, y: 100 })

})
