import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Notifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer("account_student_id").references("id").inTable("account_type_students").defaultTo(0)
    });
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
    })
  }
}
