<template>
<q-page class="bg-grey-10 row items-center justify-evenly">
  <q-card square dark style="width:350px;height:450px;">
    <q-card-section>
      <div class=" text-h3 text-white text-center">
        SIGN IN
      </div>
    </q-card-section>

    <q-form ref="form" class="q-gutter-md">
      <q-card-section class="text-white">
        <q-input
        dark square
          name="email"
          id="email"
          v-model.trim="credentials.email"
          type="email"
          label="Email"
          autofocus>
          <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
          </q-input>
        <q-input
         dark square
          id="password"
          name="password"
          v-model="credentials.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          bottom-slots
        >
        <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <q-checkbox
        dark
          id="rememberMe"
          v-model="credentials.remember"
          label="Remember me"
        />
      </q-card-section>

      <q-card-actions vertical align="center">
         <q-btn
          label="Sign in"
          size="md"
        color="white"
        text-color="black"
        style="width: 150px"
          :loading="loading"
          @click="onSubmit"
        />
<p class="q-pt-md"> Don't have account yet? </p>
        <q-btn label="Sign Up"
        style="width: 150px" size="md" flat :to="{ name: 'register' }"></q-btn>

      </q-card-actions>
    </q-form>
  </q-card>
</q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  name: 'LoginPage',
  data () {
    return {
      credentials: { email: '', password: '', remember: false },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return (this.$route.query.redirect as string) || { name: 'home' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('auth/login', this.credentials).then(() => this.$router.push(this.redirectTo))
    }
  }
})
</script>
