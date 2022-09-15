import { EventContent } from '../userEvent'
import { Mob } from './mob'

export interface Coordinate {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export class Player extends Mob {
  speed = 5
  type = 'player'

  listen(event: EventContent, allItems: Mob[]) {
    this.needs.time(0.1)
    this.listenMovement(event?.movements, allItems)
  }
}
