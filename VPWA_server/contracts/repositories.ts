// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module '@ioc:Repositories/MessageRepository' {
  import Channel from 'App/Models/Channel'

  export interface SerializedMessage {
    createdBy: number
    content: string
    channelId: number
    createdAt: string
    updatedAt: string
    id: number
    author: {
      id: number
      email: string
      createdAt: string
      updatedAt: string
    }
  }

  export interface MessageRepositoryContract {
    getAll(channelName: string): Promise<SerializedMessage[]>
    getMembersss(channelName: string)
    create(channelName: string, userId: number, content: string): Promise<SerializedMessage>
  }

  const MessageRepository: MessageRepositoryContract
  export default MessageRepository
}

declare module '@ioc:Repositories/ChannelRepository' {
  import User from 'App/Models/User'
  import Channel from 'App/Models/Channel'

  export interface ActiveChannel {
    id: number
    name: string
    type: string
    owner: number
    createdAt: string
    updatedAt: string
  }

  export interface ChannelRepositoryContract {
    getChannel(channelName: string): Promise<ActiveChannel>
    getChannels(userId: number): Promise<Channel[]>
    getRecentChannels(userId: number): Promise<Channel[]>
  }

  const ChannelRepository: ChannelRepositoryContract
  export default ChannelRepository
}
