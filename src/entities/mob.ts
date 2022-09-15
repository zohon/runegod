import { EventContent, Movement } from '../userEvent'
import { Need, Needs } from './needs/needs'
import { ActionBox, Coordinate, Item, Obj } from './obj'

interface Aggro {
  target: Mob
  value: number
}

export class Mob extends Obj {
  type: string = 'mob'

  speed: number = 5
  needs = new Needs()

  aggroList: Aggro[] = []

  scanning: boolean = false

  target: Obj

  addNeed(need: Need) {
    this.needs.items.push(Need.Eat)
  }

  scan(allItems: Obj[], targetType: Need) {
    if (this.target || !targetType) return

    const allTarget = allItems.filter(({ data }) => {
      return data?.type === targetType
    })

    if (!allTarget.length) {
      return
    }

    const equilibreCente = this.getEquilibreCenter({
      position: this.position,
      size: this.size,
    })

    let minTarget: { target: Obj; dist: number }

    allTarget.map((target) => {
      const dist = this.getDistance(
        equilibreCente,
        this.getEquilibreCenter({
          position: target.position,
          size: target.size,
        })
      )

      if (!minTarget || minTarget.dist > dist) {
        minTarget = {
          target,
          dist,
        }
      }
    })

    this.target = minTarget.target
  }

  getEquilibreCenter({ position: { x, y }, size: { width, height } }: Item) {
    return {
      x: x + width / 2,
      y: y + height / 2,
    }
  }

  getDistance(
    { x: x1, y: y1 }: Item['position'],
    { x: x2, y: y2 }: Item['position']
  ) {
    const part1 = Math.pow(x2 - x1, 2)
    const part2 = Math.pow(y2 - y1, 2)
    const underRadical = part1 + part2
    return Math.sqrt(underRadical)
  }

  listenNeed = (): Need[] => {
    const actions = this.needs.manageAllNeeds()
    return actions
  }

  listen(userEvent: EventContent, allItems: Mob[]): void {
    this.needs.time(0.1)

    if (this.target) {
      // console.log('GO to target', this.target)
      const movements = this.directionToPosition()
      this.listenMovement(movements, allItems)
      return
    }

    this.listenNeed().find((need) => {
      return this.scan(allItems, need)
    })
  }

  directionToPosition(): any {
    const movement = new Set()
    if (this.target.position.x < this.position.x) {
      movement.add(Movement.West)
    } else if (this.target.position.x > this.position.x) {
      movement.add(Movement.East)
    }
    if (this.target.position.y < this.position.y) {
      movement.add(Movement.North)
    } else if (this.target.position.y > this.position.y) {
      movement.add(Movement.South)
    }

    return movement
  }

  move(movement: Movement): {
    futurPosition: Coordinate
    hitBox: Item
  } {
    const futurPosition = { ...this.position } // the future position of element

    // the box size taken by the movement
    const hitBox = {
      size: { ...this.size },
      position: { ...this.position },
    }

    // movements
    if (movement === Movement.East) {
      futurPosition.x += this.speed
      hitBox.size.width = this.size.width + this.speed
    }

    if (movement === Movement.West) {
      futurPosition.x = hitBox.position.x -= this.speed
      hitBox.size.width = this.size.width + this.speed
    }

    if (movement === Movement.South) {
      futurPosition.y += this.speed
      hitBox.size.height = this.size.height + this.speed
    }

    if (movement === Movement.North) {
      futurPosition.y = hitBox.position.y -= this.speed
      hitBox.size.height = this.size.height + this.speed
    }

    return {
      futurPosition,
      hitBox,
    }
  }

  actionCollide(box: Obj) {
    this.target = null
    if (this.needs.items) {
      if (
        this.needs.items.find((need) => need === Need.Eat) &&
        box.data.type === Need.Eat
      ) {
        console.log(this.needs.vitals)
        box.action(ActionBox.delete)
        this.needs.vitals = this.needs.vitals.map((vit) => {
          if (vit.title === Need.Eat) {
            vit.value = vit.max
          }
          return vit
        })
      }
    }
  }

  listenMovement(movements: Set<Movement>, allItems: Mob[]) {
    if (movements?.size) {
      movements.forEach((movement) => {
        const { futurPosition, hitBox } = this.move(movement) // futur
        const collisions = this.collideCheck(hitBox, allItems) // collide ?

        if (collisions.length) {
          // Rectify
          collisions.forEach((collideBox) => {
            this.actionCollide(collideBox)

            if (movement === Movement.East) {
              futurPosition.x = collideBox.position.x - this.size.width
            }
            if (movement === Movement.West) {
              futurPosition.x = collideBox.position.x + collideBox.size.width
            }
            if (movement === Movement.North) {
              futurPosition.y = collideBox.position.y + collideBox.size.height
            }
            if (movement === Movement.South) {
              futurPosition.y = collideBox.position.y - this.size.height
            }
          })
        }

        // GO
        this.position.x = futurPosition.x
        this.position.y = futurPosition.y
      })
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: Coordinate): void {
    super.render(ctx, camera)

    // render vitals
    if (this.needs?.vitals) {
      this.needs?.vitals.forEach((vital, index) => {
        this.drawBar(
          ctx,
          camera,
          index + 1,
          this.size.width * (vital.value / vital.max),
          vital.title === Need.Drink ? '#0000FF' : '#00FF00'
        )
      })
    }
  }

  drawBar(
    ctx: CanvasRenderingContext2D,
    camera: Coordinate,
    pos: number,
    width: number,
    color: string = '#000000'
  ) {
    if (width > 1) {
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.fillRect(
        Math.round(this.position.x + camera.x),
        Math.round(this.position.y + camera.y) - pos * 5 - 1,
        width,
        5
      )
      ctx.closePath()
    }
  }
}
