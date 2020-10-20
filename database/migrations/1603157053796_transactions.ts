import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Transactions extends BaseSchema {
  protected tableName = 'transactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("student_id").unsigned().references("id").inTable("account_type_students")
      table.integer("teacher_id").unsigned().references("id").inTable("account_type_teachers")
      table.float("amount")
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
