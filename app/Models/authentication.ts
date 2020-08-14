import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  HasOne,
  hasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Account from "App/Models/authentication";

export default class authentication extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @hasOne(() => Account)
  public account: HasOne<typeof Account>;

  @column()
  public name: string;

  @column()
  public email: string;

  @column()
  public password: string;


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword (authentication: authentication) {
    if (authentication.$dirty.password) {
      authentication.password = await Hash.make(authentication.password)
    }
  }
}
