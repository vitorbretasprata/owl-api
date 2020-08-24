import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Banks extends BaseSchema {
  protected tableName = 'banks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code')
      table.string("name")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
