import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ScheduledClasses extends BaseSchema {
  protected tableName = 'scheduled_classes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("student_id").unsigned().references("id").inTable("account_type_students")
      table.integer("teacher_id").unsigned().references("id").inTable("account_type_teachers")
      table.dateTime("date")
      table.integer("status")
      table.string("location").nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
