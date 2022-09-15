import { filter, fromEvent, map, merge, Observable } from 'rxjs'
export enum Movement {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west',
}

export enum Action {
  Attack = 'Attack',
  Parry = 'parry',
}

enum KeyMappingType {
  Movement = 'movement',
  Action = 'action',
}

interface KeyMapping {
  key: string | number
  type: KeyMappingType
  value: Movement | Action
}

const keyMapping: KeyMapping[] = [
  {
    key: 'q',
    type: KeyMappingType.Movement,
    value: Movement.West,
  },
  {
    key: 'd',
    type: KeyMappingType.Movement,
    value: Movement.East,
  },
  {
    key: 'z',
    type: KeyMappingType.Movement,
    value: Movement.North,
  },
  {
    key: 's',
    type: KeyMappingType.Movement,
    value: Movement.South,
  },
  {
    key: 'p',
    type: KeyMappingType.Action,
    value: Action.Attack,
  },
]

export interface EventContent {
  movements: Set<Movement>
  actions: Set<Action>
}

export class UserEvent {
  event: Observable<any>
  movements: Set<Movement> = new Set<Movement>()
  actions: Set<Action> = new Set<Action>()

  constructor(target: HTMLElement) {
    this.event = merge(this.keyboard(target), this.mouse(target))
  }

  get content(): EventContent {
    return {
      movements: this.movements,
      actions: this.actions,
    }
  }

  keyboard(target: HTMLElement): Observable<EventContent> {
    return merge(
      fromEvent(target, 'keydown').pipe(
        filter(({ repeat }: KeyboardEvent) => !repeat),
        map((event: KeyboardEvent) => {
          const result = keyMapping.find(({ key }) => key === event.key)
          if (result) {
            switch (result.type) {
              case KeyMappingType.Movement:
                this.movements.add(result.value as Movement)
                break
              case KeyMappingType.Action:
                this.actions.add(result.value as Action)
                break
            }
          }
          return this.content
        })
      ),
      fromEvent(target, 'keyup').pipe(
        filter(({ repeat }: KeyboardEvent) => !repeat),
        map((event: KeyboardEvent) => {
          const result = keyMapping.find(({ key }) => key === event.key)
          if (result) {
            switch (result.type) {
              case KeyMappingType.Movement:
                this.movements.delete(result.value as Movement)
                break
              case KeyMappingType.Action:
                this.actions.delete(result.value as Action)
                break
            }
          }
          return this.content
        })
      )
    )
  }

  mouse(target: HTMLElement): Observable<EventContent> {
    return merge(
      fromEvent(target, 'mousedown').pipe(
        filter(({ button }: MouseEvent) => button === 0),
        map((event: MouseEvent) => {
          this.actions.add(Action.Attack)
          return this.content
        })
      ),
      fromEvent(target, 'mouseup').pipe(
        filter(({ button }: MouseEvent) => button === 0),
        map((event: MouseEvent) => {
          this.actions.delete(Action.Attack)
          return this.content
        })
      )
      // fromEvent(target, 'mousemove').pipe(
      //   map((event: MouseEvent) => {
      //     return this.content
      //   })
      // )
    )
  }
}
