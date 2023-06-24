import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import { DateTime } from 'luxon'

export default class AuthController {
  public async register({ request }: HttpContextContract) {
    let data = await request.validate(RegisterUserValidator)
    const user = await User.create(data)

    return user
  }

  public async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    //check if there are any channels where the
    // message wasn't added for longer than 30 days...
    const dt = DateTime.local()
    console.log(dt.plus({ days: -30 }).toSQLDate())
    await Channel.query()
      .limit(100)
      .whereHas('messages', (builder) => {
        builder.where('updated_at', '<', dt.plus({ days: -30 }).toSQLDate())
      })
      .delete()

    return auth.use('api').attempt(email, password)
  }

  public async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  public async me({ auth }: HttpContextContract) {
    await auth.user!.load('channels')
    return auth.user
  }
}
