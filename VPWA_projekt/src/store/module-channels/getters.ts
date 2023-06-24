import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'

const getters: GetterTree<ChannelsStateInterface, StateInterface> = {
  joinedChannels (context) {
    return context.joinedChannels
  },
  recentChannels (context) {
    return context.recentChannels
  },
  invitedChannels (context) {
    return context.invitedChannels
  },
  channel (context) {
    return context.channel
  },
  currentMessages (context) {
    return context.active !== null ? context.messages[context.active] : []
  },
  lastMessageOf (context) {
    return (channel: string) => {
      const messages = context.messages[channel]
      return messages.length > 0 ? messages[messages.length - 1] : null
    }
  },
  active (context) {
    return context.active
  },
  members (context) {
    return context.members
  },
  statusOptions (context) {
    return context.statusOptions
  },
  userStatuses (context) {
    return context.userStatuses
  }
}

export default getters
