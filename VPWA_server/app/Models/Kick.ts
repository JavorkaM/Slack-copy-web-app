import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class Kick extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public user_id: number

  @column()
  public channel_id: number

  @column()
  public kicker_user_id_1: number

  @column()
  public kicker_user_id_2: number

  @column()
  public kicker_user_id_3: number

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public kickedUser: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channel_id',
  })
  public channelKickedFrom: BelongsTo<typeof Channel>

  @hasOne(() => User, {
    foreignKey: 'kicker_user_id_1',
  })
  public userKicker1: HasOne<typeof User>

  @hasOne(() => User, {
    foreignKey: 'kicker_user_id_2',
  })
  public userKicker2: HasOne<typeof User>

  @hasOne(() => User, {
    foreignKey: 'kicker_user_id_3',
  })
  public userKicker3: HasOne<typeof User>
}
