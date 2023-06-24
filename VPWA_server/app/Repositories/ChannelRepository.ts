import type { ActiveChannel, ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async getChannel(channelName: string): Promise<ActiveChannel> {
    const channel = await Channel.findByOrFail('name', channelName)
    return channel.serialize() as ActiveChannel
  }
  public async getChannels(userId: number): Promise<Channel[]> {
    const user = await User.findByOrFail('id', userId)
    const joinedChannels = await user.related('channels').query().pivotColumns(['channel_id'])
    return joinedChannels
  }
  public async getRecentChannels(userId: number): Promise<Channel[]> {
    const user = await User.findByOrFail('id', userId)
    const recentChannels = await user
      .related('channels')
      .query()
      .pivotColumns(['channel_id'])
      .where('channel_users.last_accessed', 'null')
      .orderBy('channel_users.updated_at', 'desc')
    return recentChannels
  }
}
