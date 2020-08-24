import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class AccountBank extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({
    columnName: "account_teacher_id"
  })
  public accountTypeTeacherId: number;

  @column()
  public bankId : number;

  @column()
  public completeName: string;

  @column()
  public agency: number;

  @column()
  public accountNumber: number;

  @column()
  public cpf: number;

}
