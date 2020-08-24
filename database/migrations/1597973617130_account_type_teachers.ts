import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AccountTeachers extends BaseSchema {
  protected tableName = 'account_type_teachers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("account_id").unsigned().references("id").inTable("accounts")
      table.integer("lecture_time")
      table.float("lecture_value")
      table.float("movement_value")
      table.string("phone")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}