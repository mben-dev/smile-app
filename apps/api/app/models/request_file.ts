import drive from '@adonisjs/drive/services/main'
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

  /**
   * Generate a signed URL for this file
   * @param expiresIn Duration for which the URL is valid (e.g., '1h', '24h')
   * @returns Promise with the signed URL
   */
  async getSignedUrl(expiresIn: string = '24h'): Promise<string> {
    return await drive.use().getSignedUrl(this.filePath, { expiresIn })
  }
}
