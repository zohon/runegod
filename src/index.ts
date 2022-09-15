import { Mob } from './entities/mob'
import { Need } from './entities/needs/needs'
import { Obj } from './entities/obj'
import { Player } from './entities/player'
import { Global } from './global'

export interface Data {
  id: string
  name: string
  type: string
  img: string
}

import * as items from './entities/data/item.json'

const canvas = document.createElement('canvas')
canvas.tabIndex = 1
document.body.appendChild(canvas)
const global = new Global(canvas)

window.addEventListener('load', () => {
  const player = new Player()
  player.position.x = global.canvas.width / 2
  player.position.y = global.canvas.height / 2
  player.addNeed(Need.Eat)
  global.addItem(player)

  const applit = new Obj()
  applit.position = {
    x: 300,
    y: 70,
  }
  applit.addData(items.find(({ name }) => name === 'apple'))
  global.addItem(applit)

  const apple = new Obj()
  apple.position = {
    x: 100,
    y: 20,
  }
  apple.addData(items.find(({ name }) => name === 'apple'))
  global.addItem(apple)

  const water = new Obj()
  water.position = {
    x: 100,
    y: 20,
  }
  water.size = {
    width: 200,
    height: 150,
  }
  water.addData(items.find(({ name }) => name === 'water'))
  global.addItem(water)

  const badGuy = new Mob()
  badGuy.position = {
    x: 0,
    y: 0,
  }
  badGuy.addNeed(Need.Eat)
  global.addItem(badGuy)

  global.resize({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  global.loop()
})

window.addEventListener('resize', () => {
  global.resize({
    width: window.innerWidth,
    height: window.innerHeight,
  })
})
