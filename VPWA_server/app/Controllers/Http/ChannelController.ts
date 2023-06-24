import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import Kick from 'App/Models/Kick'
import Status from 'App/Models/Status'
import User from 'App/Models/User'
import AddUserValidator from 'App/Validators/AdduserValidator'
import CreateChannelValidator from 'App/Validators/CreateChannelValidator'
import RevokeUserValidator from 'App/Validators/RevokeUserValidator'
import { DateTime } from 'luxon'

export default class ChannelController {
  public async addChannel({ request, auth }: HttpContextContract) {
    const data = await request.validate(CreateChannelValidator)
    const channel = await Channel.create(data)
    const user = await User.findByOrFail('id', auth.user!.id)
    await user.related('ownedchannels').create(channel)
    await user.related('channels').attach([channel.id])
    return channel
  }
  public async getChannels({ auth }: HttpContextContract) {
    const user = await User.findByOrFail('id', auth.user!.id)
    const joinedChannels = await user
      .related('channels')
      .query()
      .pivotColumns(['channel_id'])
      .where('invite_pending', false)
    return joinedChannels
  }
  public async getRecentChannels({ auth }: HttpContextContract) {
    const user = await User.findByOrFail('id', auth.user!.id)
    const recentChannels = await user
      .related('channels')
      .query()
      .pivotColumns(['channel_id'])
      .where('channel_users.last_accessed_at', false)
      .where('invite_pending', false)
      .orderBy('channel_users.updated_at', 'desc')
    return recentChannels
  }
  public async getInvitedChannels({ auth }: HttpContextContract) {
    const user = await User.findByOrFail('id', auth.user!.id)
    const invitedChannels = await user
      .related('channels')
      .query()
      .pivotColumns(['channel_id'])
      .where('invite_pending', true)
    return invitedChannels
  }
  public async getChannel({ request }: HttpContextContract) {
    return await Channel.findByOrFail('name', request.qs().chName)
  }
  public async deleteChannel({ request }: HttpContextContract) {
    const data = await request.validate(CreateChannelValidator)
    await Channel.query().where('name', data.name).delete()
  }
  public async detachChannel({ request }: HttpContextContract) {
    const data = await request.validate(RevokeUserValidator)
    const user = await User.findByOrFail('user_name', data.username)
    const channel = await Channel.findByOrFail('name', data.channelName)
    await user.related('channels').detach([channel.id])
  }
  public async addUser({ request, auth }: HttpContextContract) {
    //check Ban
    const data = await request.validate(AddUserValidator)
    const channel = await Channel.findByOrFail('name', data.channel)
    const user = await User.findByOrFail('id', auth.user!.id)

    const ban = await Kick.query().where('user_id', user.id).where('channel_id', channel.id).first()
    if (ban !== null && ban.kicker_user_id_3 !== null) {
      // user is banned from server
      // maybe add error to catch smw
      return null
    }

    await user.related('channels').attach([channel.id])
    return channel
  }
  public async getStatusOptions({}: HttpContextContract) {
    //const statuses = await Status.all()
    const statuses = (await Database.from('statuses').select('*').orderBy('id')) as Status[]
    return statuses
  }
}
