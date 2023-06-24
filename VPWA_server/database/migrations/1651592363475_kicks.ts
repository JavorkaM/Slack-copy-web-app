import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kicks extends BaseSchema {
  protected tableName = 'kicks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')
      table.unique(['user_id', 'channel_id'])
      table
        .integer('kicker_user_id_1')
        .unsigned()
        .defaultTo(null)
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('kicker_user_id_2')
        .unsigned()
        .defaultTo(null)
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('kicker_user_id_3')
        .unsigned()
        .defaultTo(null)
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
