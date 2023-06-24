<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar class="bg-grey-10">

        <q-toolbar-title>Sliick</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <!-- routuje sa tu RegistrationPage.vue/LoginPage.vue -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
  },

  data () {
    return {}
  },

  methods: { }
})
</script>
