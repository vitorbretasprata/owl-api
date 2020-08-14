import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Lecture extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idStudent: number;

  @column()
  public idTeacher: number;

  @column()
  public name: String;

  @column()
  public location: String;

  @column()
  public DateLecture: DateTime;

  @column()
  public needMovement: Boolean;

  @column()
  public totalValue: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
