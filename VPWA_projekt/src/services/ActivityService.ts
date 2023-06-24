import { User } from 'src/contracts'
import { authManager } from '.'
import { BootParams, SocketManager } from './SocketManager'

class ActivitySocketManager extends SocketManager {
  // eslint-disable-next-line no-empty-pattern
  public subscribe ({ store }: BootParams): void {
    this.socket.on('user:list', (onlineUsers: User[]) => {
      console.log('Online users list', onlineUsers)
    })

    this.socket.on('user:online', (user: User) => {
      console.log('User is online', user)
      // change state[user] to online
    })

    this.socket.on('user:offline', (user: User) => {
      console.log('User is offline', user)
      // change state[user] to offline
    })

    this.socket.on('user:dnd', (user: User) => {
      console.log('User is dnd', user)
      // change state[user] to dnd
    })

    this.socket.on('user:status', (user: User, statusID: number) => {
      console.log('User is dnd', user, statusID)
      store.dispatch('channels/addUserStatus', { user, statusID })
      // change state[user] to dnd
    })

    authManager.onChange((token) => {
      if (token) {
        this.socket.connect()
      } else {
        this.socket.disconnect()
      }
    })
  }

  public setStatus (statusID: number, userName: string) {
    this.emitAsync('setStatus', statusID, userName)
    console.log('emitted status')
    // a
  }

  public addStatus (channel: string) {
    this.emitAsync('addStatus', { channel })
  }
}

export default new ActivitySocketManager('/')
