<template>
  <q-btn-dropdown dark icon="circle" :text-color=selectColor @click="printStatus">
      <q-list dark class="bg-grey-10">
        <q-item
        v-for="(statusItem, index) in statusList"
        :key="index"
        clickable
        v-close-popup
        @click="handleStatusChange(statusItem)"
        >
          <q-item-section>
            <q-item-label>{{ statusItem.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default defineComponent({
  name: 'StatusDropdown',
  data () {
    return {
      statusList: [],
      value: null
    }
  },

  computed: {
    ...mapGetters('channels', { statusList: 'statusOptions' }),
    selectColor: {
      get () {
        return this.$store.state.userStatus.selectColor
      },
      set (val) {
        this.$store.commit('userStatus/updateSelectColor', val)
      }
    }

  },
  methods: {
    getStatus (value: string) {
      this.selectColor = value
    },
    ...mapActions('channels', ['getStatusOptions', 'setStatus', 'addStatus']),
    printStatus () {
      console.log(this.statusList)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handleStatusChange (statusItem: any) {
      this.selectColor = statusItem.color

      await this.setStatus({ statusID: statusItem.id, userName: this.$store.getters['auth/thisUser'].userName })
    }
  },

  async mounted () {
    this.statusList = await this.getStatusOptions()
  }

})
</script>
