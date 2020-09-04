import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ScheduledClasses extends BaseSchema {
  protected tableName = 'scheduled_classes'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.boolean("need_movement")
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
    })
  }
}
