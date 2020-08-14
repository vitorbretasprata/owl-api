import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne, HasMany, hasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm';
import ScheduledClass from "App/Models/ScheduledClass";
import LectureName from "App/Models/LectureName";
import AccountBank from "App/Models/AccountBank";
import Transaction from "App/Models/Transaction";

export default class AccountTypeTeacher extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public idAccount: number;

  @manyToMany(() => LectureName)
  public lectures : ManyToMany<typeof LectureName>;

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
  public phone : number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
