import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { ActiveChannel, ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { inject } from '@adonisjs/core/build/standalone'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import Kick from 'App/Models/Kick'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
  constructor(private channelRepository: ChannelRepositoryContract) {}
  public async loadChannel({ params }: WsContextContract): Promise<ActiveChannel> {
    return this.channelRepository.getChannel(params.name)
  }

  public async inviteUserToChannel({ socket, auth }: WsContextContract, channelUser: any) {
    //check if banned or if its the owner who is inviting
    const channel = await Channel.findByOrFail('name', channelUser.channel)
    const user = await User.findByOrFail('user_name', channelUser.user)

    const ban = await Kick.query().where('user_id', user.id).where('channel_id', channel.id).first()
    if (ban !== null && ban.kicker_user_id_3 !== null) {
      // user is banned from server
      if (auth.user!.id !== channel.owner) {
        return null
      } else {
        await ban.delete()
      }
    }

    await user.related('channels').attach([channel.id])

    const rows = await Database.from('channel_users')
      .where('channel_id', channel.id)
      .where('user_id', user.id)
      .update('invite_pending', true)

    socket.broadcast.emit('invitedChannels')
    return user
  }

  public async handleInviteResponse({ socket }: WsContextContract, channelUserResponse: any) {
    const channel = await Channel.findByOrFail('name', channelUserResponse.channel)
    const user = await User.findByOrFail('user_name', channelUserResponse.user)

    if (channelUserResponse.userResponse === true) {
      //accept - change invite_pending to false / 0
      await Database.from('channel_users')
        .where('channel_id', channel.id)
        .where('user_id', user.id)
        .update('invite_pending', false)
    } else {
      await user.related('channels').detach([channel.id])
    }
  }

  public async revokeInvite({ socket }: WsContextContract, channelUser: any) {
    //asd
    const channel = await Channel.findByOrFail('name', channelUser.channel)
    const user = await User.findByOrFail('user_name', channelUser.user)
    await user.related('channels').detach([channel.id])

    socket.broadcast.emit('revoked', channel.name, user.user_name)
    return user
  }

  public async kickUserFromChannel({ socket, auth }: WsContextContract, channelUser: any) {

    const channel = await Channel.findByOrFail('name', channelUser.channel)
    const userToKick = await User.findByOrFail('user_name', channelUser.userToKick)
    const userKicking = auth.user!

    let kickCount = 0
    let kickLog = await Kick.firstOrCreate({ user_id: userToKick.id, channel_id: channel.id }, {})

    //check if kicked user is owner
    if (userToKick.id === channel.owner) {
      //owner can not be kicked
      return -3
    }

    //check if kicked is equal to kicker (for some dumb reason)
    if (userKicking.id === userToKick.id) {
      return -4
    }

    if (kickLog === null) {
      //firstorcreate does not work
      console.log('no kickLog created or found')
    } else {
      if (userKicking.id === channel.owner) {
        //if owner is kicking its automatic ban
        kickLog.kicker_user_id_1 = userKicking.id
        kickLog.kicker_user_id_2 = userKicking.id
        kickLog.kicker_user_id_3 = userKicking.id
        await kickLog.save()

        await userToKick.related('channels').detach([channel.id])
        // broadcast thing

        socket.broadcast.emit('invitedChannels', userToKick)

        socket.broadcast.emit('changeActiveChannelIf', userToKick)
        //maybe need broadcast to update members too?
        kickCount = 3
        console.log('user banned')
        return kickCount
      }
      if (
        kickLog.kicker_user_id_1 === userKicking.id ||
        kickLog.kicker_user_id_2 === userKicking.id ||
        kickLog.kicker_user_id_3 === userKicking.id
      ) {
        return -2 // code for already been kicked by this user
      }

      if (kickLog.kicker_user_id_1 === null) {
        //set kicker 1 to userKicking
        kickLog.kicker_user_id_1 = userKicking.id
        await kickLog.save()
        kickCount = 1
      } else if (kickLog.kicker_user_id_2 === null) {
        //set kicker 2 to userKicking
        kickLog.kicker_user_id_2 = userKicking.id
        await kickLog.save()
        kickCount = 2
      } else if (kickLog.kicker_user_id_3 === null) {
        //set kicker 3 to userKicking
        kickLog.kicker_user_id_3 = userKicking.id
        await kickLog.save()

        await userToKick.related('channels').detach([channel.id])
        // broadcast thing

        socket.broadcast.emit('invitedChannels', userToKick)
        //maybe need broadcast to update members too?
        socket.broadcast.emit('invitedChannels', userToKick)
        console.log('channel name: ' + channel.name)
        socket.broadcast.emit('changeActiveChannelIf', {
          user: userToKick,
          channel: channelUser.channel,
        })
        kickCount = 3
        console.log('user banned')
      } else {
        kickCount = 3
        console.log('user banned already')
        return -1 //code for already banned
      }
    }
    return kickCount
  }
  public async getChannels({ auth }: WsContextContract) {
    console.log('controller')
    return this.channelRepository.getChannels(auth.user!.id)
  }
  public async getRecentChannels({ auth }: WsContextContract) {
    console.log('controller')
    return this.channelRepository.getChannels(auth.user!.id)
  }
  public async loadStatuses({ auth }: WsContextContract, channelName: string) {
    const channel = await Channel.findByOrFail('name', channelName)
    //const userStatus
  }

  public async accessChannel({ auth }: WsContextContract, channelName: string) {
    const channel = await Channel.findByOrFail('name', channelName)
    await Database.from('channel_users')
      .where('channel_id', channel.id)
      .where('user_id', auth.user!.id)
      .update('last_accessed_at', true)
  }

  public async removeChannel({ socket }: WsContextContract, channelName: string) {
    console.log('emitted delete')
    socket.broadcast.emit('removeChannel', channelName)
  }
}
