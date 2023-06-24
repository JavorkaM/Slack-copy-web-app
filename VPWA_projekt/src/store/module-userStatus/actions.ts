import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStatusInterface } from './state'

const actions: ActionTree<UserStatusInterface, StateInterface> = {
  setNotificationStatus ({ commit }, notificStatus) {
    console.log('setting status', notificStatus)
    commit('Set_notification_status', notificStatus)
  }
}

export default actions
