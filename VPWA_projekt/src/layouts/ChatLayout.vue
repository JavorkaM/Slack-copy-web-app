<template>
  <div :style="{ height: $q.screen.height + 'px' }">
    <q-layout view="hHh Lpr lFf" class="shadow-3" container>
      <q-header elevated>
        <q-toolbar class="bg-grey-10">
          <q-btn
          flat dense round icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer" />

          <q-toolbar-title>
            Sliick
          </q-toolbar-title>

          <q-btn-dropdown dark :label="notificationStatus">
            <q-list dark class="bg-grey-10">
              <q-item
              clickable
              v-close-popup
              :active="notificationStatus === 'all'"
              active-class="selected-channel"
              @click="setNotificationStatus('all')">
                <q-item-section>
                  <q-item-label>All notifications</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
              clickable
              v-close-popup
              :active="notificationStatus === 'mentions'"
              active-class="selected-channel"
              @click="setNotificationStatus('mentions')">
                <q-item-section>
                  <q-item-label>Only mentions</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <!-- dropdown selection of availability status -->
          <StatusDropdown />
          <q-btn
          label="Sign Out"
          @click="logout()"
          />
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        :breakpoint="690"
      >
        <q-scroll-area style="height: calc(100% - 10px)">
          <q-list dark
          v-for="(menuItem,index) in menuList"
          :key="index"
          v-bind="menuItem"
          class="bg-grey-10">
            <q-item
            clickable
            v-ripple
            @click="doAction(menuItem.actionValue,menuItem.actionBoolean, '')">
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>{{ menuItem.label }}</q-item-section>
            </q-item>
          </q-list>
          <!-- all the channels that user is member in -->
          <q-expansion-item
          default-opened
          dark
          expand-separator
          icon="list"
          label="Channels"
          class="bg-grey-10"
          >
            <q-list class="bg-grey-10" dark>
              <q-item
              v-for="(rch, index) in invitedchannels"
              :key="index"
              :active="activeChannel === rch.name"
              active-class="selected-channel"
              clickable
              v-ripple
              @click="toggleAcceptInvitePrompt(rch.name)"
              >
              <q-item-section avatar>
                  <q-icon name="#" />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">
                    {{ rch.name }}
                  </q-item-label>
                </q-item-section>
                <q-badge rounded color="red" label="INVITE" />
              </q-item>

              <q-item
              v-for="(rch, index) in recentchannels"

              :key="index"
              :active="activeChannel === rch.name"
              active-class="selected-channel"
              clickable
              v-ripple
              @click="setActiveChannel(rch.name); toggleLeftDrawer()"
              >
              <q-item-section avatar>
                  <q-icon name="#" />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">
                    {{ rch.name }}
                  </q-item-label>
                </q-item-section>
                <q-badge rounded color="red" label="NEW" />
              </q-item>

              <q-item
              v-for="(ch, index) in getchannells "
              :key="index"
              :active="activeChannel === ch.name"
              active-class="selected-channel"
              clickable
              v-ripple
              @click="setActiveChannel(ch.name), toggleLeftDrawer()"
              >
              <q-item-section avatar>
                  <q-icon name="#" />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">
                    {{ ch.name }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-scroll-area>
      </q-drawer>

      <q-page-container class="bg-grey-2 center" >
        <router-view />
      </q-page-container>
      <q-page-sticky expand position="top" inset-shadow-down v-if="channel">
        <q-toolbar class="bg-dark text-white">
          <q-toolbar-title>
              <q-icon name="message" left></q-icon>
              {{channel.name}}
              <q-icon v-if="channel.type ==='private'" name="lock"></q-icon>
              <q-icon v-else name="people"></q-icon>
          </q-toolbar-title>

          <q-btn label="members"  color="dark" rounded  @click="toggleMembers">
            <!-- <q-avatar v-if="members[activeChannel].length<100" color="dark" text-color="white">{{members[activeChannel].length}}</q-avatar>
            <q-avatar v-else color="dark" text-color="white">{{'99+'}}</q-avatar> -->
          </q-btn>

          <q-btn-dropdown dark rounded icon="settings">
            <q-list dark class="bg-grey-10">
              <q-item
                clickable
                v-close-popup
                v-if="user.id !== channel.owner"
                @click="doAction('leave',true)"
                >
                <q-item-section>
                  <q-item-label>Leave channel</q-item-label>
                </q-item-section>
              </q-item>
              <!-- visible only if you own the channel -->
              <q-item
              clickable
              v-close-popup
              @click="doAction('delete',true)"
              v-else
              >
                <q-item-section>
                  <q-item-label>Delete channel</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
              clickable
              v-close-popup
              @click="toggleJoinPrompt"
              >
                <q-item-section>
                  <q-item-label>Join channel</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
              clickable
              v-close-popup
              @click="toggleInvitePrompt"
              >
                <q-item-section>
                  <q-item-label>Invite user</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

        </q-toolbar>
      </q-page-sticky>
      <q-footer>
        <q-toolbar class="bg-grey-3 text-black row">
          <q-input v-model="message" :disable="loading" @keydown.enter.prevent="send" rounded outlined dense class="WAL__field col-grow q-mr-sm" bg-color="white" placeholder="Type a message" />
          <q-btn :disable="loading" @click="send" round flat icon="send" />
        </q-toolbar>
      </q-footer>
    </q-layout>
  </div>
  <q-dialog v-model="createChannel" dark >
    <q-card dark >
      <q-card-section>
        <div class="text-h5">Create Channel</div>
      </q-card-section>
      <q-separator />
      <q-card-section  class="scroll" style="min-width:50vh; min-height: 20vh">
        <q-form>
          <q-input dark square v-model.trim="newChannel.name" label="Channel Name" />
          <q-option-group
          name="channelType"
          v-model.trim="newChannel.type"
          :options="ChannelTypeOptions"
          inline
          />
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Submit" v-close-popup @click="doAction('createChannelAction',true)"/>
        <q-btn flat label="Close" v-close-popup @click="createChannel=false"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="membersMenu" >
    <q-card dark >
      <q-card-section>
        <div class="text-h5">Members</div>
      </q-card-section>

      <q-separator />

      <q-card-section  class="scroll" style="min-width: 50vh; min-height: 50vh">
        <q-list >
          <q-item clickable ripple v-for="(member, index) in members[activeChannel]" :key="index">
              <q-item-section side>
                <q-avatar size="48px" >
                  <img src="icons/avatar.svg">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                {{member.userName}}
              </q-item-section>
              <q-item-section side>
                <q-icon v-if="member.id==this.channel.owner" name="star_rate" color="yellow"></q-icon>
              </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="errorPop"  position="bottom">
    <q-card style="width: 80rem" dark>

      <q-linear-progress :value="0.6" color="pink" />
      <q-card-section class="row items-center no-wrap">
        <div>
          <q-icon name="warning" color="red" size="4rem" />
        </div>

        {{this.errorMessage}}
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="joinPrompt">
    <q-card style="width: 200rem" dark>
      <q-card-section>
        <div class="text-h6">Enter Channel Name you want to join:</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense dark v-model="inputChannel" autofocus v-close-popup @keyup.enter="toggleJoinPrompt, this.doAction('join', true, inputChannel)" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup @click="toggleJoinPrompt" />
        <q-btn flat label="Join" v-close-popup @click="this.doAction('join', true, inputChannel), toggleJoinPrompt" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="invitePrompt">
    <q-card style="width: 200rem" dark>
      <q-card-section>
        <div class="text-h6">Enter Username of person you want to invite here:</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense dark v-model="inputUser" autofocus v-close-popup @keyup.enter="toggleInvitePrompt, this.doAction('invite', true, this.inputUser)" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup @click="toggleInvitePrompt"/>
        <q-btn flat label="Invite" v-close-popup @click="this.doAction('invite', true, inputUser), toggleInvitePrompt"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="acceptInvitePrompt">
    <q-card style="width: 200rem" dark>
      <q-card-section>
        <div class="text-h6">You have recieved an invite to the channel "{{invitedToChannelName}}"</div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Decline" color: negative v-close-popup @click="doAction('handleInviteChoice', false, this.invitedToChannelName)"/>
        <q-btn flat label="Accept" v-close-popup @click="doAction('handleInviteChoice', true, this.invitedToChannelName)"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import StatusDropdown from 'components/StatusDropdown.vue'
import { mapActions, mapGetters } from 'vuex'
import { SerializedMessage, User } from 'src/contracts'
import { authService } from 'src/services'

const menuItemsList = [
  {
    icon: 'create',
    label: 'Create Channel',
    separator: false,
    actionValue: 'createChannel',
    actionBoolean: true
  }
]

const ChannelTypeOptions = [
  {
    label: 'private',
    value: 'private'
  },
  {
    label: 'public',
    value: 'public'
  }
]

export default defineComponent({
  name: 'ChatLayout',
  components: {
    StatusDropdown
  },
  data () {
    return {
      newChannel: {
        name: '',
        type: '',
        owner: ''
      },
      ChannelTypeOptions,
      leftDrawerOpen: false,
      membersMenu: ref(false),
      errorPop: false,
      errorMessage: '',
      joinPrompt: false,
      invitePrompt: false,
      acceptInvitePrompt: false,
      invitedToChannelName: '',
      menuList: menuItemsList,
      message: '',
      loading: false,
      createChannel: false
    }
  },
  props: {
  },
  computed: {
    ...mapGetters('channels', {
      channel: 'channel',
      getchannells: 'joinedChannels',
      recentchannels: 'recentChannels',
      invitedchannels: 'invitedChannels',
      lastMessageOf: 'lastMessageOf',
      activeChannel: 'active'
    }),
    ...mapGetters('userStatus', {
      notificationStatus: 'notificationStatus'
    }),
    stateMessages (): SerializedMessage[] {
      return this.$store.getters['channels/messages']
    },
    ...mapGetters('auth', {
      user: 'thisUser'
    }),
    members (): User[] {
      return this.$store.getters['channels/members']
    }
  },
  methods: {
    clearMembers () {
      // while (this.members.length > 0) {
      //   this.members.pop()
      // }
    },
    async send () {
      // bassed on the message content calls for the action that is being called
      if (this.message[0] === '/') {
        if (this.message === '/quit') {
          this.doAction('delete', true, '')
        } else if (this.message.includes('/join')) {
          const addToChannel = this.message.split('/join ')[1]
          this.doAction('join', true, addToChannel)
        } else if (this.message === '/list') {
          this.toggleMembers()
        } else if (this.message.includes('/invite')) {
          const inviteToChannel = this.message.split('/invite ')[1]
          this.doAction('invite', true, inviteToChannel)
        } else if (this.message === '/cancel') {
          if (this.channel.owner === this.$store.getters['auth/thisUser'].id) {
            // if owner delete channel otherwise just remove users connection
            this.deleteChannel(this.channel)
            this.message = ''
          } else {
            this.detachChannel(this.$store.getters['auth/thisUser'].userName)
            this.message = ''
          }
        } else if (this.message.includes('/revoke')) {
          const revokedUser = this.message.split('/revoke ')[1]

          if (this.channel.type === 'private' && this.channel.owner === this.$store.getters['auth/thisUser'].id) {
            this.revokeUser(revokedUser)
            this.message = ''
          }
        } else if (this.message.includes('/kick')) {
          const userKick = this.message.split('/kick ')[1]
          const kickCount = await this.kickUser({ channel: this.channel.name, userToKick: userKick })
        } else {
          this.toggleErrorMessage('Command "' + this.message + '" not Found!')
        }
      } else {
        this.loading = true
        await this.addMessage({ channel: this.channel.name, message: this.message })
        this.loading = false
      }
      this.message = ''
    },
    ...mapActions('auth', ['logout']),
    ...mapActions('channels', ['addMessage', 'addChannel', 'findjoinedChannel', 'setActiveChannel', 'deleteChannel', 'joinChannel', 'revokeUser', 'detachChannel', 'inviteUser', 'loadFirstChannels', 'kickUser', 'getMembers', 'handleInviteResponse']),
    ...mapActions('userStatus', ['setNotificationStatus']),

    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    async toggleMembers () {
      await this.getMembers(this.channel)
      this.membersMenu = !this.membersMenu
    },
    toggleErrorMessage (errorMessage: string) {
      this.errorMessage = errorMessage
      this.errorPop = !this.errorPop
    },
    toggleInvitePrompt () {
      this.invitePrompt = !this.invitePrompt
    },
    toggleAcceptInvitePrompt (channelName: string) {
      this.invitedToChannelName = channelName
      this.acceptInvitePrompt = !this.acceptInvitePrompt
    },
    toggleJoinPrompt () {
      this.joinPrompt = !this.joinPrompt
    },
    // method that handles all the actions performed
    async doAction (actionValue: string, actionBoolean: boolean, actionString: string) {
      const user = await authService.me()
      switch (actionValue) {
        case 'createChannel':
          this.createChannel = actionBoolean
          break
        case 'createChannelAction':
          console.log('channel is created', this.newChannel)
          this.newChannel.owner = this.$store.getters['auth/thisUser'].id
          await this.addChannel(this.newChannel)
          await this.setActiveChannel(this.newChannel.name)
          this.createChannel = false
          break
        case 'delete': // Does the same thing just checks if user is owner here instead
          if (this.channel === null) {
            this.toggleErrorMessage('No channel selected!')
          }
          if (this.channel.owner === user?.id) {
            this.deleteChannel(this.channel)
          } else {
            this.toggleErrorMessage('Channel can only be deleted by its owner/creator!')
          }
          this.message = ''
          break
        case 'leave':
          if (this.channel === null) {
            this.toggleErrorMessage('No channel selected!')
          }
          this.detachChannel(this.channel)
          this.message = ''
          this.channel = null
          break
        case 'cancel':
          if (this.channel === null) {
            this.toggleErrorMessage('No channel selected!')
          }
          if (this.channel.owner === user?.id) {
            console.log('owner')
            this.deleteChannel(this.channel)
            this.message = ''
          } else {
            console.log('not owner')
            this.detachChannel(this.channel)
            this.message = ''
          }
          break
        case 'join':
          await this.joinChannel(actionString)
          await this.setActiveChannel(actionString)
          console.log('recetn channels testing', this.$store.state)
          console.log(this.recentchannels)
          break
        case 'invite':
          if (actionString === '') {
            this.toggleErrorMessage('Command "/invite" needs a name parameter (i.e. /invite exampleUserName)!')
          }
          await this.inviteUser({ channel: this.activeChannel, user: actionString })
          break
        case 'handleInviteChoice':
          await this.handleInviteResponse({ channel: actionString, user: user?.userName, userResponse: actionBoolean })
          this.invitedToChannelName = ''
      }
    }
  },
  // loading of every neccessary data to store
  beforeMount () {
    this.loadFirstChannels()
    this.$store.commit('channels/RESET_STATE', { root: true })
  }
})
</script>
