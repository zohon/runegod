import { Obj, StatusBox } from './entities/obj'
import { EventContent, UserEvent } from './userEvent'

export class Global {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D | null
  actualEvent: any

  listItems: Obj[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    const dpi = window.devicePixelRatio
    this.ctx.canvas.width = window.innerWidth
    this.ctx.canvas.height = window.innerHeight
    // this.ctx.scale(dpi, dpi)

    new UserEvent(this.canvas).event.subscribe((data: EventContent) => {
      this.actualEvent = data
    })
  }

  loop() {
    this.render()
    requestAnimationFrame(() => this.loop())
  }

  addItem(item: Obj) {
    this.listItems.push(item)
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const { position: camera } = this.listItems.find(
      ({ type }) => type === 'player'
    )

    this.listItems = this.listItems.filter(
      (item) => item.status !== StatusBox.dead
    )

    this.listItems.map((item) => item.listen(this.actualEvent, this.listItems))
    this.listItems.map((item) =>
      item.render(this.ctx, {
        x: -camera.x + this.canvas.width / 2,
        y: -camera.y + this.canvas.height / 2,
      })
    )
  }

  resize({ height, width }: { height: number; width: number }) {
    this.canvas.height = height
    this.canvas.width = width
  }
}
