import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AuthenticationsSchema extends BaseSchema {
  protected tableName = 'authentications'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('email', 255).unique().notNullable()
      table.string('password', 180).notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
