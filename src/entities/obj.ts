import { Data } from '..'
import { EventContent } from '../userEvent'
import { generateUUID } from '../util'

export interface Coordinate {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Item {
  position: Coordinate
  size: Size
}

export enum ActionBox {
  delete,
}

export enum StatusBox {
  live,
  dead,
}

export class Obj {
  id: string = generateUUID()
  type: string = 'obj'
  status: StatusBox = StatusBox.live

  data: Data

  position: Coordinate = {
    x: 0,
    y: 0,
  }

  size: Size = {
    width: 16,
    height: 23,
  }

  hitBox: Item

  ctx: CanvasRenderingContext2D
  isListening = false

  constructor() {}

  addData(data: Data) {
    this.data = data
    this.generateImg()
  }

  action(action: ActionBox) {
    console.log('action', action)
    if (action === ActionBox.delete) {
      this.status = StatusBox.dead
    }
  }

  listen(userEvent: EventContent, allItems: Obj[]) {
    const collide = this.collideCheck(
      {
        position: this.position,
        size: this.size,
      },
      allItems
    )
  }

  collideCheck(target: Item, allItems: Obj[]): Obj[] {
    const allCollision = allItems
      .filter((item) => item.id !== this.id)
      .map((item) => {
        const collisionEvent = []

        if (target.position.x + target.size.width > item.position.x) {
          // right
          collisionEvent.push('east')
        }

        if (target.position.x < item.position.x + item.size.width) {
          // left
          collisionEvent.push('west')
        }

        if (target.position.y + target.size.height > item.position.y) {
          // top
          collisionEvent.push('noth')
        }

        if (target.position.y < item.position.y + item.size.height) {
          // bottom
          collisionEvent.push('south')
        }

        if (collisionEvent.length === 4) {
          return item
        }

        return null
      })
    return allCollision.filter((resp) => resp)
  }

  img: HTMLImageElement
  generateImg() {
    if (!this.img && this.data?.img) {
      var newImg = new Image()
      newImg.onload = () => {
        this.img = newImg
      }
      newImg.src = this.data?.img
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: Coordinate) {
    if (this.hitBox) {
      ctx.beginPath()
      ctx.fillStyle = '#FF00FF'
      ctx.fillRect(
        Math.round(this.hitBox.position.x),
        Math.round(this.hitBox.position.y),
        this.hitBox.size.width,
        this.hitBox.size.height
      )
      ctx.closePath()
    }

    ctx.beginPath()
    if (this.img) {
      ctx.drawImage(
        this.img,
        0,
        0,
        this.img.width,
        this.img.height,
        Math.round(this.position.x + camera.x),
        Math.round(this.position.y + camera.y),
        this.size.width,
        this.size.height
      )
    } else {
      ctx.beginPath()
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(
        Math.round(this.position.x + camera.x),
        Math.round(this.position.y + camera.y),
        this.size.width,
        this.size.height
      )
    }
    ctx.closePath()
  }
}
