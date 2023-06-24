import { MutationTree } from 'vuex'
import { UserStatusInterface } from './state'

const mutation: MutationTree<UserStatusInterface> = {
  updateSelectColor (state: UserStatusInterface, color: string) {
    state.selectColor = color
  },
  Set_notification_status (state, notificStatus) {
    state.notificationStatus = notificStatus
  }
}

export default mutation
