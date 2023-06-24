import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStatusInterface } from './state'

const getters: GetterTree<UserStatusInterface, StateInterface> = {
  notificationStatus (context) {
    return context.notificationStatus
  }
}

export default getters
