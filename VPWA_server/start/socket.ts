import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/')
  .connected('ActivityController.onConnected')
  .disconnected('ActivityController.onDisconnected')
  .on('setStatus', 'ActivityController.setUserStatus')
  .on('addStatus', 'ActivityController.addStatus')

// this is dynamic namespace, in controller methods we can use params.name
Ws.namespace('channels/:name')
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
  .on('loadChannel', 'ChannelController.loadChannel')
  .on('getChannels', 'ChannelController.getChannels')
  .on('getRecentChannels', 'ChannelController.getRecentChannels')
  .on('loadMembers', 'MessageController.loadMembers')
  .on('inviteUser', 'ChannelController.inviteUserToChannel')
  .on('kickUser', 'ChannelController.kickUserFromChannel')
  .on('handleInviteResponse', 'ChannelController.handleInviteResponse')
  .on('revokeInvite', 'ChannelController.revokeInvite')
  .on('loadStatuses', 'ChannelController.loadStatuses')
  .on('accessChannel', 'ChannelController.accessChannel')
  .on('removeChannel', 'ChannelController.removeChannel')
