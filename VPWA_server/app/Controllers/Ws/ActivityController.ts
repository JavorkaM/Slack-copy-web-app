import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import User from 'App/Models/User'

export default class ActivityController {
  private getUserRoom(user: User): string {
    return `user:${user.id}`
  }

  public async onConnected({ socket, auth, logger }: WsContextContract) {
    // all connections for the same authenticated user will be in the room
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()
    const user = await User.findByOrFail('user_name', auth.user?.user_name)

    user.user_status_id = 0 //set to online

    user.save()

    // this is first connection for given user
    if (userSockets.size === 0) {
      // notify
    }

    // add this socket to user room
    socket.join(room)
    socket.broadcast.emit('user:status', auth.user, user.user_status_id)
    // add userId to data shared between Socket.IO servers
    // https://socket.io/docs/v4/server-api/#namespacefetchsockets
    socket.data.userId = auth.user!.id

    const allSockets = await socket.nsp.except(room).fetchSockets()
    const onlineIds = new Set<number>()

    for (const remoteSocket of allSockets) {
      onlineIds.add(remoteSocket.data.userId)
    }

    const onlineUsers = await User.findMany([...onlineIds])

    socket.emit('user:list', onlineUsers)

    logger.info('new websocket connection')
  }

  // see https://socket.io/get-started/private-messaging-part-2/#disconnection-handler
  public async onDisconnected({ socket, auth, logger }: WsContextContract, reason: string) {
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()
    const user = await User.findByOrFail('user_name', auth.user?.user_name)
    if (user !== null) {
      user.user_status_id = 2 //set to offline

      user.save()
      socket.broadcast.emit('user:status', auth.user, user.user_status_id)
      // user is disconnected
      if (userSockets.size === 0) {
        // notify other users
      }
    }
    // status log
    logger.info('websocket disconnected', reason)
  }

  public async setUserStatus({ socket, auth }: WsContextContract, status: any) {
    const user = await User.findByOrFail('user_name', auth.user?.user_name)

    user.user_status_id = status //set status
    user.save()

    socket.broadcast.emit('user:status', auth.user, status)
  }

  public async addStatus({ auth, socket }: WsContextContract, channelName: string) {

    // broadcast status
    socket.broadcast.emit('user:status', auth.user, auth.user?.user_status_id)
  }
}
