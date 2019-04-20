<template lang='pug'>
layout.team-page
  // template(v-if='teamId === "new"')


  template(v-if='getTeamRequest.isPending')
    h1 Loading...
  template(v-else-if='getTeamRequest.isError')
    h1 Error - {{ getTeamRequest.errorMessage }}
  template(v-else)
    h1(v-if='teamId === "new"') Create a Team
    h1(v-else) Team - team123

    form-row
      form-input(label='Team Name' v-model='team.name' required)
      form-input(label='Team Motto' v-model='team.motto' required)

    form-group(label='Governance Model')
      form-row
        form-input(
          label='Intelligence Strategy'
          type='radio'
          v-model='team.strategy'
          required
          auto-select
        )
          form-input-option(value='dictatorship') Dictatorship
          form-input-option(value='democracy') Democracy

      form-group(
        v-if='team.strategy === "dictatorship"'
        label='Dictatorship Options'
      )
        form-row
          form-input(
            type='radio' v-model='team.substrategy'
            label='How is the dictator chosen?'
            required
            auto-select
          )
            form-input-option(value='permanent') Permanent Dictator
            form-input-option(value='rotating') Rotating
          form-input(
            v-if='team.substrategy === "permanent"'
            label='Address of dictator'
            v-model='team.currentDictatorAddress'
            required
          )

      form-group(
        v-if='team.strategy === "democracy"'
        label='Democracy Options'
      )
        form-row
          form-input(
            type='integer'
            :min='1' :max='100'
            v-model='team.quorumThreshold'
            required
            label='What percentage of members makes quorum?'
          )

      form-group(
        v-if='team.strategy !== "dictatorship"'
        label='Voting Options'
      )
        form-row
          form-input(
            type='radio' v-model='team.substrategy'
            label='How are votes counted?'
            required
          )
            form-input-option(value='permanent') Linearly - 1 person, 1 vote (per decision)
            form-input-option(value='rotating') Quadratic - save your "voice points" for a decision that really matters to you

      form-row
      form-row(:error='createOrUpdateTeamRequest.errorMessage')
        v-button(
          @click='saveButtonHandler'
          :disabled='$vv.$error'
          :loading='createOrUpdateTeamRequest.isPending'
          loading-text='saving team settings...'
        ) Save

</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';

import { mapRequestStatuses } from '@/lib/vuex-api';
import { vuelidateGroupMixin } from '@/lib/vuelidate-group';

const components = {
  layout: require('@/components/layout').default,
};


export default {
  components,
  mixins: [vuelidateGroupMixin],
  data: () => ({
    team: {},
  }),
  props: {
    teamId: String,
  },
  computed: {
    ...mapGetters({
      storeUser: 'user',
    }),
    ...mapGetters(['isUserLoggedIn']),
    ...mapRequestStatuses({
      getTeamRequest: 'GET_TEAM',
      createTeamRequest: 'CREATE_TEAM',
      updateTeamRequest: 'UPDATE_TEAM',
    }),
    createOrUpdateTeamRequest() {
      return this.team.id ? this.updateTeamRequest : this.createTeamRequest;
    },
  },
  watch: {
    storeUser: {
      deep: true,
      handler() { this.user = _.cloneDeep(this.storeUser); },
    },
  },
  methods: {
    saveButtonHandler() {
      if (this.$hasError()) return;
      this.$store.dispatchApiAction('UPDATE_USER', this.user);
    },
  },
  mounted() {
    if (this.teamId) {
      // this.$store.get;
    }
  },
};
</script>

<style lang='less'>

</style>
