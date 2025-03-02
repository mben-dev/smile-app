import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'request_files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relationship with requests
      table
        .integer('request_id')
        .unsigned()
        .references('id')
        .inTable('requests')
        .onDelete('CASCADE')

      // File information
      table.string('file_name').notNullable()
      table.string('file_path').notNullable()
      table.enum('file_type', ['radiography', 'photos', 'scan', 'stl', 'final']).notNullable()
      table.integer('file_size').notNullable()
      table.string('mime_type').notNullable()
      table.string('url').notNullable()

      // Timestamps
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
