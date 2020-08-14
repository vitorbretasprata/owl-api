import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ApiTokens extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer("user_id").unsigned().references("id").inTable("authentications")

    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
    })
  }
}
