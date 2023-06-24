import { Channel, SerializedMessage, User } from 'src/contracts'
export type ChannelType = 'private' | 'public'

export interface ChannelsStateInterface {
  loading: boolean,
  error: Error | null,
  messages: { [channel: string]: SerializedMessage[] },
  members: { [userName: string]: User[] },
  active: string | null,
  channel: Channel | null,
  joinedChannels: Channel[],
  recentChannels: Channel[],
  invitedChannels: Channel[],
  statusOptions: [],
  userStatuses: number[]
}

function state (): ChannelsStateInterface {
  return {
    loading: false,
    error: null,
    messages: {},
    members: {},
    active: null,
    channel: null,
    joinedChannels: [],
    recentChannels: [],
    invitedChannels: [],
    statusOptions: [],
    userStatuses: []
  }
}

export default state
