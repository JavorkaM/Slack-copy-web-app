import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository'])
export default class MessageController {
  constructor(private messageRepository: MessageRepositoryContract) {}

  public async loadMessages({ params }: WsContextContract) {
    return this.messageRepository.getAll(params.name)
  }

  public async addMessage({ params, socket, auth }: WsContextContract, content: string) {
    const message = await this.messageRepository.create(params.name, auth.user!.id, content)
    // broadcast message to other users in channel
    console.log('message')
    socket.broadcast.emit('message', message)
    socket.broadcast.emit('message: notify', message, auth.user!.user_name)

    // return message to sender
    return message
  }
  public async loadMembers({ params }: WsContextContract): Promise<User[]> {
    // this.channelRepository.getChannel(params.name)
    try {
      const members = await this.messageRepository.getMembersss(params.name)
      return members
    } catch (e) {
      console.log(e)
      return []
    }
  }
}
