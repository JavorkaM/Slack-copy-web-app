import { Channel, RawMessage, SerializedMessage, User } from 'src/contracts'
import { BootParams, SocketManager } from './SocketManager'
import { api } from 'src/boot/axios'
import { channelService } from '.'

// creating instance of this class automatically connects to given socket.io namespace
// subscribe is called with boot params, so you can use it to dispatch actions for socket events
// you have access to socket.io socket using this.socket
class ChannelSocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    const channel = this.namespace.split('/').pop() as string
    this.socket.on('message', (message: SerializedMessage) => {
      store.commit('channels/NEW_MESSAGE', { channel, message })
    })
    this.socket.on('channels', (channels: Channel[]) => {
      store.commit('channels/LOAD_CHANNELS', { channels })
    })
    this.socket.on('invitedChannels', () => {
      console.log('som tu v invited channels')
      store.dispatch('channels/loadInvitedChannels', '', { root: true })
    })
    this.socket.on('changeActiveChannelIf', (user: User, channel: unknown) => {
      console.log('srvice channel: ' + channel)
      store.dispatch('channels/changeActiveChannelIf', { user, channel })
    })
    this.socket.on('message: notify', async (message: SerializedMessage, username: string) => {
      const statusColor = store.state.userStatus.selectColor
      const notificStatus = store.state.userStatus.notificationStatus
      // notification is sent when user is online and depending on the notification status recieves message
      // always or only when being mentioned
      if (((notificStatus === 'mentions' &&
        await store.dispatch('channels/amMentioned', message, { root: true })) ||
        notificStatus === 'all') && statusColor === 'green') {
        const channels = store.state.channels.joinedChannels.concat(store.state.channels.recentChannels)
        for (let i = 0; i < channels.length; i++) {
          if (channels[i].id === message.channelId) {
            if (Notification.permission === 'granted') {
              const notification = new Notification('New message in channel ' + channels[i].name, { body: message.content + ' from ' + username })
              return notification
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                  const notification = new Notification('New message in channel ' + channels[i].name, { body: message.content + ' from ' + username })
                  return notification
                }
              })
            }
          }
        }
      }
    })
    this.socket.on('removeChannel', async (channelName: string) => {
      store.dispatch('channels/removeChannel', channelName, { root: true })
    })
    this.socket.on('revoked', async (channelName: string, userName: string) => {
      store.dispatch('channels/revoke', { channelName, userName }, { root: true })
    })
  }

  public addMessage (message: RawMessage): Promise<SerializedMessage> {
    this.emitAsync('onNewNotification', message)
    return this.emitAsync('addMessage', message)
  }

  public loadMessages (): Promise<SerializedMessage[]> {
    return this.emitAsync('loadMessages')
  }

  public loadChannel (): Promise<Channel> {
    return this.emitAsync('loadChannel')
  }

  public loadRecentChannels (): Promise<Channel[]> {
    return this.emitAsync('loadRecentChannels')
  }

  public loadChannels (): Promise<Channel[]> {
    return this.emitAsync('getChannels')
  }

  public loadMembers (): Promise<User[]> {
    return this.emitAsync('loadMembers')
  }

  public inviteUserToChannel (channel: string, user: string) {
    return this.emitAsync('inviteUser', { channel, user })
  }

  public revokeInvite (channel: string, user: string) {
    return this.emitAsync('revokeInvite', { channel, user })
  }

  public handleInviteResponse (channel: string, user: string, userResponse: boolean) {
    this.emitAsync('handleInviteResponse', { channel, user, userResponse })
  }

  public kickUserFromChannel (channel: string, userToKick: string) {
    return this.emitAsync('kickUser', { channel, userToKick })
  }

  public loadStatuses (channel: string) {
    return this.emitAsync('loadStatuses', { channel })
  }

  public loadMessagesOffset (channel: string, offset:number) {
    return this.emitAsync('load', { channel, offset })
  }

  public accessChannel (channel: string) {
    return this.emitAsync('accessChannel', channel)
  }

  public removeChannel (channel: string) {
    return this.emitAsync('removeChannel', channel)
  }
}

class ChannelService {
  private channels: Map<string, ChannelSocketManager> = new Map()

  public join (name: string): ChannelSocketManager {
    if (this.channels.has(name)) {
      throw new Error(`User is already joined in channel "${name}"`)
    }

    // connect to given channel namespace
    const channel = new ChannelSocketManager(`/channels/${name}`)
    this.channels.set(name, channel)
    return channel
  }

  public async leave (name: string): Promise<boolean> {
    const channel = this.channels.get(name)

    if (!channel) {
      return false
    }
    await channelService.in(name)?.removeChannel(name)
    // disconnect namespace and remove references to socket
    channel.destroy()
    return this.channels.delete(name)
  }

  public in (name: string): ChannelSocketManager | undefined {
    return this.channels.get(name)
  }

  async createChannel (data: Channel): Promise<Channel> {
    const response = await api.post<Channel>('channels', data)
    return response.data
  }
}

export default new ChannelService()
