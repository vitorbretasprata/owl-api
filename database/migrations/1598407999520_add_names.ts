import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AccountTypeTeachers extends BaseSchema {
  protected tableName = 'account_type_teachers'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('complete_name', 255).notNullable()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
    })
  }
}
