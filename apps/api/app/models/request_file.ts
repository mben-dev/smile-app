import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Request from './request.js'

export default class RequestFile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requestId: number

  @belongsTo(() => Request)
  declare request: BelongsTo<typeof Request>

  @column()
  declare fileName: string

  @column()
  declare filePath: string

  @column()
  declare fileType: 'radiography' | 'photos' | 'scan' | 'stl' | 'final'

  @column()
  declare fileSize: number

  @column()
  declare mimeType: string

  @column()
  declare url: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
