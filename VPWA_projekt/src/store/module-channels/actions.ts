/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { authService, channelService } from 'src/services'
import { Channel, RawMessage, SerializedMessage, User } from 'src/contracts'
import { api } from 'src/boot/axios'
import ActivityService from 'src/services/ActivityService'
import auth from 'src/boot/auth'

const actions: ActionTree<ChannelsStateInterface, StateInterface> = {
  async join ({ commit, state }, channel: string) {
    // join channel to the socket
    try {
      commit('LOADING_START')
      let messages = await channelService.in(channel)?.loadMessages() as SerializedMessage[]
      if (messages === undefined) {
        messages = await channelService.join(channel).loadMessages() as SerializedMessage[]
        if (messages === undefined) {
          messages = []
        }
      }
      const members = await channelService.in(channel)?.loadMembers()

      for (let i = 0; i < state.joinedChannels.length; i++) {
        if (state.joinedChannels[i].name === channel) {
          const activeChannel = state.joinedChannels[i]
          commit('LOADING_SUCCESS', { channel, messages, members })
        }
      }
      for (let i = 0; i < state.recentChannels.length; i++) {
        if (state.recentChannels[i].name === channel) {
          const activeChannel = state.recentChannels[i]
          commit('LOADING_SUCCESS', { channel, messages, members })
        }
      }
      // broadcast user status to channel members:

      this.dispatch('channels/addStatus', channel)
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async leave ({ commit }, channel: string) {
    channelService.leave(channel)
    commit('CLEAR_CHANNEL', channel)
  },
  async addMessage ({ commit, state }, { channel, message }: { channel: string, message: RawMessage }) {
    const newMessage = await channelService.in(channel)?.addMessage(message)
    commit('NEW_MESSAGE', { channel, message: newMessage })
  },
  async addChannel ({ commit }, form: Channel) {
    const channel = await channelService.createChannel(form) as Channel
    this.dispatch('channels/join', channel.name, { root: true })
    commit('ADD_RECENT_CHANNEL', channel)
    commit('LOADING_SUCCESS', { channel, messages: [] as unknown as SerializedMessage, members: {} as User[] })
    commit('SET_ACTIVE', channel)

    return channel
  },
  async loadFirstChannels ({ commit }) {
    // first load of the channels and data from DB on mount of the page
    const recentChannelsData = (await api.get('recentchannels')).data
    for (let index = 0; index < recentChannelsData.length; index++) {
      commit('ADD_RECENT_CHANNEL', recentChannelsData[index])
      this.dispatch('channels/join', recentChannelsData[index].name, { root: true })
    }
    let found = false
    const channelsData = (await api.get('channels')).data

    for (let index = 0; index < channelsData.length; index++) {
      found = false
      for (let i = 0; i < recentChannelsData.length; i++) {
        if (recentChannelsData[i].name === channelsData[index].name) {
          found = true
          break
        }
      }
      if (!found) {
        this.dispatch('channels/join', channelsData[index].name, { root: true })
        commit('ADD_JOINED_CHANNEL', channelsData[index])
      }
    }
    const invitedChannelsData = (await api.get('invitedchannels')).data

    for (let index = 0; index < invitedChannelsData.length; index++) {
      commit('ADD_INVITED_CHANNEL', invitedChannelsData[index])
    }
    // get invited channels
  },
  async loadInvitedChannels ({ commit }) {
    const invitedChannelsData = (await api.get('invitedchannels')).data

    for (let index = 0; index < invitedChannelsData.length; index++) {
      commit('ADD_INVITED_CHANNEL', invitedChannelsData[index])
    }
  },
  async getMembers ({ commit }, channel: Channel) {
    const members = await channelService.in(channel.name)?.loadMembers()

    commit('LOAD_MEMBERS', { members, channel })
  },

  async inviteUser ({ commit }, { channel, user }: {channel: string, user: string }) {
    let members
    try {
      channelService.in(channel)?.inviteUserToChannel(channel, user)
      members = await channelService.in(channel)?.loadMembers()
    } catch (e) {
      console.log(e)
    }
    commit('LOAD_MEMBERS', { members, channel })
  },

  async handleInviteResponse ({ commit, state }, { channel, user, userResponse }: {channel: string, user: string, userResponse: boolean }) {
    try {
      await channelService.join(channel).handleInviteResponse(channel, user, userResponse)
    } catch (e) {
      console.log(e)
      await channelService.in(channel)?.handleInviteResponse(channel, user, userResponse)
    }
    const found = state.invitedChannels.find(ch => ch.name === channel)

    if (userResponse === true) {
      commit('ADD_RECENT_CHANNEL', found)
      this.dispatch('channels/addStatus', channel)
      this.dispatch('channels/join', channel)
    }
    commit('REMOVE_INVITED_CHANNEL', found)
  },

  async kickUser ({ commit }, { channel, userToKick }: {channel: string, userToKick: string }) {
    let kickCount
    try {
      kickCount = await channelService.in(channel)?.kickUserFromChannel(channel, userToKick)
    } catch (e) {
      console.log(e)
      return null
    }
    if (kickCount === 3) {
      // emit broadcast update members
      // on second thought this is not done here...
    }
    return kickCount
  },

  async setActiveChannel ({ commit, state }, channel: string) {
    try {
      commit('LOADING_START')

      let foundRecent = false
      let foundRecentIndex
      let foundJoined = false
      let activeChannel = null
      // find if the channel is already in recent or joined
      for (let index = 0; index < state.recentChannels.length; index++) {
        if (channel === state.recentChannels[index].name) {
          foundRecent = true
          foundRecentIndex = index
          activeChannel = state.recentChannels[index]
        }
      }
      for (let index = 0; index < state.joinedChannels.length; index++) {
        if (channel === state.joinedChannels[index].name) {
          foundJoined = true
          activeChannel = state.joinedChannels[index]
        }
      }

      if (foundRecent && foundRecentIndex !== undefined) {
        // move from recent to joined
        const temp = state.recentChannels[foundRecentIndex]
        commit('REMOVE_RECENT_CHANNEL', state.recentChannels[foundRecentIndex])
        commit('ADD_JOINED_CHANNEL', temp)
        await channelService.in(channel)?.accessChannel(channel)
      }

      if (foundJoined || foundRecent) {
        const members = await channelService.in(channel)?.loadMembers()
        const userStatus = []
        if (members !== undefined) {
          for (let i = 0; i < members.length; i++) {
            userStatus[members[i].id] = members[i].userStatusId
          }
        }

        commit('LOAD_USER_STATUS', userStatus)

        commit('SET_ACTIVE', activeChannel)

        return activeChannel
      }
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async changeActiveChannelIf ({ commit }, { user, channel }) {
    let userLoggedIn
    await authService.me().then(function (result) {
      userLoggedIn = result?.id
    })
    if (user.id === userLoggedIn) { // this works but throws banned user off of channel reagardless if its the banned one or not
      this.dispatch('channels/leave', channel, { root: true })
    }
  },

  async deleteChannel ({ commit, state }, channel: Channel) {
    // the owner of the channel is deleteing whole channel
    const response = await api.delete<Channel>('channels', { data: channel })
    if (state.joinedChannels.includes(channel)) {
      commit('REMOVE_JOINED_CHANNEL', channel)
    } else {
      commit('REMOVE_RECENT_CHANNEL', channel)
    }
    await
    this.dispatch('channels/leave', channel.name, { root: true })
    return response.data
  },

  async detachChannel ({ commit, rootState, state }, channel: Channel) {
    // user is leaving channel -> delete only from chanel_users
    const user = rootState.auth.user
    if (user !== null) {
      const response = await api.delete<Channel>('channel_user', { data: { channelName: channel.name, username: user.userName } })
      if (state.joinedChannels.includes(channel)) {
        commit('REMOVE_JOINED_CHANNEL', channel)
      } else {
        commit('REMOVE_RECENT_CHANNEL', channel)
      }
      await channelService.in(channel.name)?.removeChannel(channel.name)
      this.dispatch('channels/leave', channel.name, { root: true })
      return response.data
    }
  },

  // eslint-disable-next-line no-empty-pattern
  async revokeUser ({ }, revokedUser: string) {
    const channel = this.getters['channels/channel']
    await channelService.in(channel.name)?.revokeInvite(channel.name, revokedUser)
  },

  async revoke ({ state, commit, rootState }, { channelName, userName }) {
    const user = rootState.auth.user?.userName
    if (userName === user) {
      let foundRecent = false
      let foundJoined = false
      let foundInvite = false
      let indexfound
      for (let index = 0; index < state.recentChannels.length; index++) {
        if (channelName === state.recentChannels[index].name) {
          foundRecent = true
          indexfound = index
        }
      }
      for (let index = 0; index < state.joinedChannels.length; index++) {
        if (channelName === state.joinedChannels[index].name) {
          foundJoined = true
          indexfound = index
        }
      }
      for (let index = 0; index < state.invitedChannels.length; index++) {
        if (channelName === state.invitedChannels[index].name) {
          foundInvite = true
          indexfound = index
        }
      }

      if (foundJoined && indexfound !== undefined) {
        commit('REMOVE_JOINED_CHANNEL', state.joinedChannels[indexfound])
      } else if (foundRecent && indexfound !== undefined) {
        commit('REMOVE_RECENT_CHANNEL', state.joinedChannels[indexfound])
      } else if (foundInvite && indexfound !== undefined) {
        commit('REMOVE_INVITED_CHANNEL', state.invitedChannels[indexfound])
      }
      if (state.active === channelName) {
        commit('CLEAR_CHANNEL', channelName)
      }
    }
  },

  async joinChannel ({ state, commit }, channel: string) {
    try {
      const found = await channelService.join(channel)?.loadChannel() as Channel
      if (found.type === 'public') {
        const response = await api.post<Channel>('user', { channel })
        commit('ADD_RECENT_CHANNEL', response.data)
        this.dispatch('channels/join', channel, { root: true })
      }
    } catch (err) {
      this.dispatch('channels/addChannel', { name: channel, type: 'private' } as Channel, { root: true })
    }
  },

  async getStatusOptions ({ commit }) {
    const statusOptions = (await api.get('statusOptions')).data

    commit('LOAD_STATUS_OPTIONS', statusOptions)
    return statusOptions
  },
  async setStatus ({ state, commit }, { statusID, userName }: {statusID: number, userName: string }) {
    await ActivityService.setStatus(statusID, userName)
  },
  async addUserStatus ({ state, commit }, { user, statusID }: {user: User, statusID: number}) {
    // update state status[user_id]

    commit('ADD_USER_STATUS', { userStatus: statusID, userID: user.id })
  },
  async addStatus ({ state }, channel: string) {
    await ActivityService.addStatus(channel)
  },

  amMentioned ({ rootState }, message: SerializedMessage) : boolean {
    const splitMessages = message.content.split(' ')
    const mention = '@' + rootState.auth.user?.userName
    let found = false
    splitMessages.forEach(word => {
      if (word.trim() === mention) {
        found = true
      }
    })
    return found
  },
  async removeChannel ({ state, commit }, channelName: string) {
    let foundRecent = false
    let foundJoined = false
    let indexfound
    for (let index = 0; index < state.recentChannels.length; index++) {
      if (channelName === state.recentChannels[index].name) {
        foundRecent = true
        indexfound = index
      }
    }
    for (let index = 0; index < state.joinedChannels.length; index++) {
      if (channelName === state.joinedChannels[index].name) {
        foundJoined = true
        indexfound = index
      }
    }
    if (foundJoined && indexfound !== undefined) {
      commit('REMOVE_JOINED_CHANNEL', state.joinedChannels[indexfound])
    } else if (foundRecent && indexfound !== undefined) {
      commit('REMOVE_RECENT_CHANNEL', state.joinedChannels[indexfound])
    }
    if (state.active === channelName) {
      commit('CLEAR_CHANNEL', channelName)
    }
  }
}

export default actions
