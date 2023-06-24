export interface UserStatusInterface {
  selectColor: string;
  notificationStatus: string;
}

function state (): UserStatusInterface {
  return {
    selectColor: 'green',
    notificationStatus: 'all'
  }
}

export default state
