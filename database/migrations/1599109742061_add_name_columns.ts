import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AccountTypeStudents extends BaseSchema {
  protected tableName = 'account_type_students'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string("complete_name").notNullable()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
    })
  }
}
