import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import RequestFile from './request_file.js'
import User from './user.js'

export default class Request extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare patientName: string

  @column()
  declare patientAge: number

  @column()
  declare patientGender: 'male' | 'female' | 'other'

  @column()
  declare treatmentType: 'expansion' | 'extraction' | 'CI 1' | 'CI 2' | 'CI 3'

  @column()
  declare status: 'await_information' | 'in_progress' | 'to_validate' | 'ask_change' | 'done'

  @column()
  declare notes: string | null

  @column()
  declare termsAccepted: boolean

  @hasMany(() => RequestFile)
  declare files: HasMany<typeof RequestFile>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
