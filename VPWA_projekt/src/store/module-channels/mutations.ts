import { Channel, SerializedMessage, User } from 'src/contracts'
import { MutationTree } from 'vuex'
import { ChannelsStateInterface, ChannelType } from './state'

const mutation: MutationTree<ChannelsStateInterface> = {
  LOADING_START (state) {
    state.loading = true
    state.error = null
  },
  LOADING_SUCCESS (state, { channel, messages, members }: { channel: string, messages: SerializedMessage[], activeChannel:Channel, members: User[]}) {
    state.loading = false
    state.messages[channel] = messages
    state.members[channel] = members
  },
  LOADING_ERROR (state, error) {
    state.loading = false
    state.error = error
  },
  CLEAR_CHANNEL (state, channel) {
    state.active = null
    state.channel = null
    delete state.messages[channel]
  },
  SET_ACTIVE (state, activeChannel: Channel) {
    state.channel = activeChannel
    state.active = activeChannel.name
  },
  NEW_MESSAGE (state, { channel, message }: { channel: string, message: SerializedMessage }) {
    state.messages[channel].push(message)
  },
  NEW_CHANNEL (state, { channelName, channelType }: { channelName: string, channelType: ChannelType }) {
    state.active = channelName
    state.messages[channelName] = []
    state.channel = { name: channelName, type: channelType } as Channel
  },
  LOAD_CHANNELS (state, channels: Array<Channel>) {
    state.joinedChannels = channels
  },
  ADD_JOINED_CHANNEL (state, channel:Channel) {
    state.joinedChannels.push(channel)
  },
  REMOVE_JOINED_CHANNEL (state, channel:Channel) {
    state.joinedChannels.splice(state.joinedChannels.indexOf(channel), 1)
  },
  LOAD_RECENT_CHANNELS (state, recentChannels: Channel[]) {
    state.recentChannels = recentChannels
  },
  ADD_RECENT_CHANNEL (state, channel:Channel) {
    state.recentChannels.push(channel)
  },
  REMOVE_RECENT_CHANNEL (state, channel:Channel) {
    state.recentChannels.splice(state.recentChannels.indexOf(channel), 1)
  },
  REMOVE_RECENT_CHANNEL_INDEX (state, channelIndex:number) {
    state.recentChannels.splice(channelIndex, 1)
  },
  LOAD_INVITED_CHANNELS (state, invitedChannels: Channel[]) {
    state.invitedChannels = invitedChannels
  },
  ADD_INVITED_CHANNEL (state, channel:Channel) {
    state.invitedChannels.push(channel)
  },
  REMOVE_INVITED_CHANNEL (state, channel:Channel) {
    state.invitedChannels.splice(state.invitedChannels.indexOf(channel), 1)
  },
  LOAD_MEMBERS (state, { members, channel }: {members: User[], channel: Channel}) {
    state.members[channel.name] = members
  },
  RESET_STATE (state) {
    state.joinedChannels = []
    state.recentChannels = []
    state.invitedChannels = []
  },
  LOAD_STATUS_OPTIONS (state, statusOptions: []) {
    state.statusOptions = statusOptions
  },
  LOAD_USER_STATUS (state, userStatus: []) {
    state.userStatuses = userStatus
  },
  ADD_USER_STATUS (state, { userStatus, userID }: {userStatus: number, userID: number}) {
    state.userStatuses[userID] = userStatus
  }
}

export default mutation
