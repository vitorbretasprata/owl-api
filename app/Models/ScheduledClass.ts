import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ScheduledClass extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public idStudent: number;

  @column()
  public idTeacher: number;

  @column()
  public date: Date;

  @column()
  public status: number;

  @column()
  public location: String;
  
}
