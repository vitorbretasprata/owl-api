import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AccountBanks extends BaseSchema {
  protected tableName = 'account_banks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("account_teacher_id").unsigned().references("id").inTable("account_type_teachers")
      table.integer("bank_id").unsigned().references("id").inTable("banks")
      table.string("cpf")
      table.string("complete_name")
      table.integer("agency")
      table.integer("account_number")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
