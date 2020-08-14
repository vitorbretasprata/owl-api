import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class AccountBank extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public idAccountTeacher: number;

  @column()
  public bankId : number;

  @column()
  public agency: number;

  @column()
  public bankAccount: number;

  @column()
  public cpf: number;

}
