import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TeacherLectures extends BaseSchema {
  protected tableName = 'teacher_lectures'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("account_id").unsigned().references("id").inTable("accounts")
      table.integer("lecture_id").unsigned().references("id").inTable("lectures")
      table.integer("year_code")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
