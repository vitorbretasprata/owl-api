import { BaseModel, column, hasOne, HasOne, HasMany, hasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm';
import ScheduledClass from "App/Models/ScheduledClass";
import Lectures from "App/Models/Lecture";
import AccountBank from "App/Models/AccountBank";
import Transaction from "App/Models/Transaction";

export default class AccountTypeTeacher extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public accountId: number;

  @manyToMany(() => Lectures, {
    pivotTable: 'teacher_lectures',
    pivotColumns: ['year_code'],
    localKey: 'id',
    pivotForeignKey: 'account_teacher_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'lecture_id',
  })
  public lectures : ManyToMany<typeof Lectures>;

  @hasMany(() => ScheduledClass)
  public scheduledClasses : HasMany<typeof ScheduledClass>;

  @hasOne(() => AccountBank)
  public bankingAccount : HasOne<typeof AccountBank>;

  @hasMany(() => Transaction)
  public transaction : HasMany<typeof Transaction>;

  @column()
  public lectureTime: number;

  @column()
  public lectureValue: number;

  @column()
  public movementValue: number;

  @column()
  public completeName: string;

  @column()
  public phone : string;

}
