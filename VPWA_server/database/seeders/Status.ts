import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Status from 'App/Models/Status'

export default class StatusSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const uniqueKey = 'name'

    await Status.updateOrCreateMany(uniqueKey, [
      {
        id: 0,
        name: 'Online',
        color: 'green',
      },
      {
        id: 1,
        name: 'Do Not Disturb',
        color: 'red',
      },
      {
        id: 2,
        name: 'Offline',
        color: 'grey',
      },
    ])
  }
}
