import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AccountBanks extends BaseSchema {
  protected tableName = 'account_banks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("account_id").unsigned().references("id").inTable("accounts")
      table.integer("bank_id").unsigned().references("id").inTable("banks")
      table.integer("cpf")
      table.integer("complete_name")
      table.integer("agency")
      table.integer("account_number")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
