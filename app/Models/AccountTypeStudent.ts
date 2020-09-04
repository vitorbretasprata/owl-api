import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import Transaction from "App/Models/Transaction";
import ScheduledClass from "App/Models/ScheduledClass";

export default class AccountTypeStudent extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({
    columnName: "account_id"
  })
  public idAccount: number;

  @column()
  public completeName: string;

  @hasMany(() => Transaction)
  public transactions : HasMany<typeof Transaction>;

  @hasMany(() => ScheduledClass)
  public scheduledClasses : HasMany<typeof ScheduledClass>;
}
