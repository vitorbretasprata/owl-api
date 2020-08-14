import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Accounts extends BaseSchema {
  protected tableName = 'accounts'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer("country_id").unsigned().references("id").inTable("countries")
      table.integer("state_id").unsigned().references("id").inTable("states")
    });
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.integer("country_id").unsigned().references("id").inTable("countries")
      table.integer("state_id").unsigned().references("id").inTable("states")
    });
  }
}
