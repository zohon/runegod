export enum Need {
  Drink = 'drink',
  Eat = 'eat',
  Sleep = 'sleep',
}
// type NeedItem = Need.Drink | Need.Eat | Need.Sleep

export class Needs {
  public items: Need[] = []
  vitals: { title: Need; value: number; max: number }[] = [
    {
      title: Need.Drink,
      value: 10,
      max: 10,
    },
    {
      title: Need.Eat,
      value: 10,
      max: 10,
    },
  ]

  constructor() {}

  manageAllNeeds = (): Need[] => {
    const actions = this.items.flatMap(this.manageNeed)
    return actions
  }

  time = (time: number) => {
    this.vitals = this.vitals.map(({ value, ...vital }) => ({
      ...vital,
      value: value <= 0 ? value : value - time,
    }))
  }

  private manageNeed = (need: Need): Need[] => {
    return this.vitals
      .map((vital) => {
        switch (vital.title) {
          case Need.Drink:
            if (vital.value / vital.max < 0.2) {
              return Need.Drink
            }
            break
          case Need.Eat:
            if (vital.value / vital.max < 0.2) {
              return Need.Eat
            }
            break
        }
      })
      .filter((e) => e)
  }
}
