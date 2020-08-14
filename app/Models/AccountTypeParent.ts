import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import Lecture from "App/Models/Lecture";
import Transaction from "App/Models/Transaction";
import Dependent from "App/Models/Dependent";

export default class AccountTypeParent extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public idAccount: number;

  @hasOne(() => Lecture)
  public lectures : HasOne<typeof Lecture>;

  @hasMany(() => Transaction)
  public transactions : HasMany<typeof Transaction>;

  @hasMany(() => Dependent)
  public dependents : HasMany<typeof Dependent>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
