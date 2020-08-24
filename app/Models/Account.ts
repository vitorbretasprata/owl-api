import { DateTime } from 'luxon';
import { BaseModel, column, hasOne, HasOne, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import ApiToken from "App/Models/ApiToken";
import Notification from "App/Models/Notification";
import AccountTypeParent from "App/Models/AccountTypeParent";
import AccountTypeStudent from "App/Models/AccountTypeStudent";
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";

export default class Account extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public authenticationId : number;

  @column()
  public type : number; 

  @hasMany(() => Notification)
  public notifications : HasMany<typeof Notification>;

  @hasOne(() => AccountTypeParent)
  public accountTypeParent : HasOne<typeof AccountTypeParent>;

  @hasOne(() => AccountTypeStudent)
  public accountTypeStudent : HasOne<typeof AccountTypeStudent>;

  @hasOne(() => AccountTypeTeacher)
  public accountTypeTeacher : HasOne<typeof AccountTypeTeacher>;

  @column()
  public countryId : number;

  @column({ columnName: "uf" })
  public ufId : number;

  @column()
  public city : String;

}
