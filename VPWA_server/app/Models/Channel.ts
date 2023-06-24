import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Message from 'App/Models/Message'
import User from './User'

export type ChannelType = 'private' | 'public'
export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: ChannelType | string

  @column()
  public owner: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'channelId',
  })
  public messages: HasMany<typeof Message>

  @belongsTo(() => User, {
    foreignKey: 'owner',
  })
  public channelOwner: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'channel_users',
    pivotForeignKey: 'channel_id',
    pivotRelatedForeignKey: 'user_id',
  })
  public members: ManyToMany<typeof User>
}
