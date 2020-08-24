import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'

export default class Lecture extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @computed()
  public get yearCode() {
    return this.$extras.pivot_year_code;
  }

}
