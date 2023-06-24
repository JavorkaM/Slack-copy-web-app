import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
  hasOne,
  HasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import Status from 'App/Models/Status'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public first_name: string

  @column()
  public last_name: string

  @column()
  public user_name: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column()
  public user_status_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
  @hasMany(() => Message, {
    foreignKey: 'createdBy',
  })
  public sentMessages: HasMany<typeof Message>

  @hasMany(() => Channel, {
    foreignKey: 'owner',
  })
  public ownedchannels: HasMany<typeof Channel>

  @manyToMany(() => Channel, {
    pivotTable: 'channel_users',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'channel_id',
    pivotTimestamps: true,
  })
  public channels: ManyToMany<typeof Channel>

  @hasOne(() => Status, {
    foreignKey: 'user_status_id',
  })
  public userStatus: HasOne<typeof Status>
}
