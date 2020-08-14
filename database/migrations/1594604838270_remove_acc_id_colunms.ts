import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Apitoken extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up () {
    this.schema.dropTable(this.tableName)
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer("account_id").unsigned().references("id").inTable("accounts")
    })
  }
}
