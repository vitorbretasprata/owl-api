import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import Transaction from "App/Models/Transaction";
import ScheduledClass from "App/Models/ScheduledClass";

export default class AccountTypeStudent extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public idAccount: number;

  @hasMany(() => Transaction)
  public transactions : HasMany<typeof Transaction>;

  @hasMany(() => ScheduledClass)
  public scheduledClasses : HasMany<typeof ScheduledClass>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
