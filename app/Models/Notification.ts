import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({ columnName: "account_id" })
  public idAccount: number;

  @column({ columnName: "account_student_id" })
  public idAccountStudent : number;

  @column()
  public seen : boolean;

  @column()
  public message: string;  

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
