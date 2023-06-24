<template>
  <q-scroll-area ref="area" style="width: 100%; height: calc(100vh - 200px)" @scroll="onScrollFirst" @load="setFirstTime(true)">
    <q-infinite-scroll >
      <div style="width: 80%; max-width: 1000px; margin: 0 auto;">
        <q-chat-message v-for="message in messages"
          :key="message.id"
          :name="message.author.userName"
          :text="[message.content]"
          :stamp="dateTimeConvert(message)"
          :sent="isMine(message)"
          :bg-color="messageColor(message)"
          >
          <template v-slot:avatar>
          <img
            class="q-message-avatar q-message-avatar--sent q-message-avatar--received"
            src="icons/avatar.svg"
          >
        </template>
          <div>
            {{message.content}}
            <q-badge v-if="isMine(message)" :color=selectColor floating rounded/>
            <q-badge v-else-if="userStatuses[message.author.id] === unknown" :color='bg-dark' floating rounded/>
            <q-badge v-else :color="statusOptions[userStatuses[message.author.id]].color"  floating rounded/>

          </div>

        </q-chat-message>
      </div>
    </q-infinite-scroll>
  </q-scroll-area>
</template>

<script lang="ts">
import { QScrollArea } from 'quasar'
import { SerializedMessage } from 'src/contracts'
import { defineComponent, PropType } from 'vue'
import { mapGetters } from 'vuex'

export default defineComponent({
  name: 'ChannelMessagesComponent',
  props: {
    messages: {
      type: Array as PropType<SerializedMessage[]>,
      default: () => []
    }

  },
  data () {
    return {
      firstTime: true,
      loading: false
    }
  },
  watch: {
    messages: {
      handler () {
        this.$nextTick(() => this.scrollDown())
        this.firstTime = true
      },
      deep: true

    }
  },
  computed: {
    ...mapGetters('channels', {
      userStatuses: 'userStatuses',
      statusOptions: 'statusOptions'
    }),
    selectColor: {
      get () {
        return this.$store.state.userStatus.selectColor
      },
      set (val: unknown) {
        this.$store.commit('userStatus/updateSelectColor', val)
      }
    },
    currentUser () {
      return this.$store.state.auth.user?.id
    }

  },
  methods: {
    scrollDown () {
      const area = this.$refs.area as QScrollArea
      area && area.setScrollPercentage('vertical', 999999999999999)
    },
    isMine (message: SerializedMessage): boolean {
      return message.author.id === this.currentUser
    },
    amMentioned (message: SerializedMessage) : boolean {
      const splitMessages = message.content.split(' ')
      const mention = '@' + this.$store.state.auth.user?.userName
      let found = false
      splitMessages.forEach(word => {
        if (word.trim() === mention) {
          found = true
        }
      })
      return found
    },
    messageColor (message: SerializedMessage) : string {
      if (message.author.id === this.currentUser) {
        return 'green-4'
      } else {
        if (this.amMentioned(message)) {
          return 'red-4'
        } else {
          return 'grey-5'
        }
      }
    },
    dateTimeConvert (message: SerializedMessage) {
      if (message.createdAt !== null) {
        const year = message.createdAt.substring(0, 4)
        const month = message.createdAt.substring(5, 7)
        const day = message.createdAt.substring(8, 10)
        const time = message.createdAt.substring(11, 16)
        return day + '.' + month + '.' + year + ' ' + time
      }
    },
    onScrollFirst () {
      const area = this.$refs.area as QScrollArea
      if (area.getScrollPosition().top === 0 && this.firstTime) {
        this.scrollDown()
        this.firstTime = false
      }
      if (area.getScrollPosition().top === 0) {
        // asd
        // load more messages
      }
    },
    setFirstTime (val: boolean) { // Set after loading new channel
      this.firstTime = val // If done remove line 69 - watch -> messages -> this.firstTime = true, for now it is buggy
    }
  }
}
)
</script>
