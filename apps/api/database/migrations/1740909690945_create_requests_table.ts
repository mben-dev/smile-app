import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // User relationship
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Patient information
      table.string('patient_name').notNullable()
      table.integer('patient_age').notNullable()
      table.enum('patient_gender', ['male', 'female', 'other']).notNullable()

      // Treatment information
      table.enum('treatment_type', ['expansion', 'extraction', 'CI 1', 'CI 2', 'CI 3'])

      // Status tracking
      table
        .enum('status', ['await_information', 'in_progress', 'to_validate', 'ask_change', 'done'])
        .defaultTo('await_information')
        .notNullable()

      // Additional information
      table.text('notes').nullable()
      table.boolean('terms_accepted').defaultTo(false)

      // Timestamps
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
