import { DateTime } from 'luxon';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class ScheduledClass extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({ columnName: "student_id" })
  public idStudent: number;

  @column({ columnName: "teacher_id" })
  public idTeacher: number;

  @column()
  public date: DateTime;

  @column()
  public status: number;

  @column()
  public location: String;

  @column()
  public needMovement: Boolean;

  @column()
  public totalValue: number;
  
}
