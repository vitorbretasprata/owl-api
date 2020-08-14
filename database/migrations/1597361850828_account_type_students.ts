import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AccountTypeStudents extends BaseSchema {
  protected tableName = 'account_type_students'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("account_id").unsigned().references("id").inTable("accounts")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
