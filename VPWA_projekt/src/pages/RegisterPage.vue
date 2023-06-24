<template>
<q-page class=" bg-grey-10 row items-center justify-evenly">
  <q-card dark square style="width:600px;height:650px;">
    <q-card-section>
      <div class="text-h3 text-white text-center">
        SIGN UP
      </div>
    </q-card-section>

    <q-form ref="form" class="q-gutter-md text-white">
      <q-card-section>
        <q-input
        dark
        v-model="form.first_name" type="text" label="First Name" >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input dark square v-model="form.last_name" type="text" label="Last Name" >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input dark square v-model="form.user_name" type="text" label="Username" >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input
        dark
          name="email"
          id="email"
          v-model.trim="form.email"
          type="email"
          label="Email"
          autofocus>
          <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
                </q-input>

        <q-input
        dark
          id="password"
          name="password"
          v-model="form.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          bottom-slots
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <q-input
        dark
          id="password_confirmation"
          name="password_confirmation"
          v-model="form.passwordConfirmation"
          label="Confirm Password"
          :type="showPassword ? 'text' : 'password'"
          bottom-slots
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions vertical align="center">
        <q-btn
         label="Sign up"
          size="md"
        class="bg-white"
        text-color="black"
        style="width: 150px"
        flat
          :loading="loading"
          @click="onSubmit"></q-btn>
        <p class="q-pt-md"> Already have account? </p>
        <q-btn label="Sign in"
        style="width: 150px" size="md" flat :to="{ name: 'login' }"></q-btn>

      </q-card-actions>
    </q-form>
  </q-card>
</q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  name: 'RegisterPage',
  data () {
    return {
      form: {
        email: '',
        password: '',
        passwordConfirmation: '',
        first_name: '',
        user_name: '',
        last_name: ''
      },
      showPassword: false
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return { name: 'login' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('auth/register', this.form).then(() => this.$router.push(this.redirectTo))
    }
  }
})
</script>
