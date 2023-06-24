/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
}).prefix('auth')

Route.post('channels', 'ChannelController.addChannel').middleware('auth')
Route.get('channels', 'ChannelController.getChannels').middleware('auth')
Route.get('recentchannels', 'ChannelController.getRecentChannels').middleware('auth')
Route.get('invitedchannels', 'ChannelController.getInvitedChannels').middleware('auth')
Route.delete('channels', 'ChannelController.deleteChannel').middleware('auth')
Route.get('channel', 'ChannelController.getChannel').middleware('auth')
Route.post('user', 'ChannelController.addUser').middleware('auth')
Route.delete('channel_user', 'ChannelController.detachChannel').middleware('auth')
Route.get('statusOptions', 'ChannelController.getStatusOptions').middleware('auth')
