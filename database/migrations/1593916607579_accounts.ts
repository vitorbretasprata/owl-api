import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Accounts extends BaseSchema {
  protected tableName = 'accounts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string("city").defaultTo("-")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
