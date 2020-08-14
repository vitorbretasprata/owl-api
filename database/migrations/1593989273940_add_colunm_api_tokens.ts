import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ApiTokens extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer("account_id").unsigned().references("id").inTable("accounts")
    });
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.integer("account_id").unsigned().references("id").inTable("accounts")
    })
  }
}
