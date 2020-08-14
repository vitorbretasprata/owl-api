import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Accounts extends BaseSchema {
  protected tableName = 'accounts'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer("authentication_id").unsigned().references("id").inTable("authentications")
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
    })
  }
}
