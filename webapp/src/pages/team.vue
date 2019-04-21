<template lang='pug'>
layout.team-page
  template(v-if='getTeamRequest.isPendingOrEmpty')
    h1 Loading...
  template(v-else-if='getTeamRequest.isError')
    h1 Error - {{ getTeamRequest.errorMessage }}
  template(v-else-if='team.id')
    h1 Team - {{ team.name }}

    template(v-if='editMode')
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
              form-input-option(value='linear') Linearly - 1 person, 1 vote (per decision)
              form-input-option(value='quadratic') Quadratic - save your "voice points" for a decision that really matters to you

        form-row(:error='createOrUpdateTeamRequest.errorMessage')
          v-button(
            @click='saveButtonHandler'
            :disabled='$vv.$error'
            :loading='createOrUpdateTeamRequest.isPending'
            loading-text='saving team settings...'
          ) Save
    template(v-else)
      h3 {{ team.strategy }} - {{ team.substrategy }}

      h2 Team Members
      ul
        li(v-for='member in team.members')
          | {{ member.username }}
          span.italic(v-if='member.address === authUserAddress')  (you)

      template(v-if='(team.memberIds || []).includes(authUserAddress)')

      template(v-else-if='team.isJoinable')
        v-button(
          @click='joinButtonHandler'
          :loading='joinTeamRequest.isPending'
          loading-text='requesting membership...'
        ) Join this team
        error-message(:request-status='joinTeamRequest')

      template(v-else)
        div This team is currently not accepting new members

      h2 Games
      ul(v-if='team.games.length')
        li(v-for='game in team.games')
          router-link(:to='`/game/${game.channelId}`')
            | {{ GAME_LABELS[game.gameType] }}
            |  against {{ getTeamName(game.team1id) }}
            | - (created {{ game.createdAt }})

      form-group(label='create new game')
        form-row
          form-input(type='radio' label='Game' v-model='createGamePayload.gameType')
            form-input-option(value='chess') Chess
            form-input-option(value='sc2') Starcraft 2
          form-input(type='dropdown' label='Opponent' :options='possibleOpponents' v-model='createGamePayload.team1id')
          form-input(type='container')
            v-button(@click='createGameButtonHandler') Create Game
          error-message(:request-status='createGameRequest')

</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters, mapActions } from 'vuex';

import { mapRequestStatuses } from '@/lib/vuex-api';
import { vuelidateGroupMixin } from '@/lib/vuelidate-group';

const components = {
};

const GAME_LABELS = {
  chess: 'Chess',
  sc2: 'Starcraft 2',
};

export default {
  components,
  mixins: [vuelidateGroupMixin],
  data: () => ({
    team: {},
    createGamePayload: {},
    editMode: false,
  }),
  props: {
    teamId: String,
  },
  computed: {
    ...mapGetters('statechannel', ['deployAddress']),
    GAME_LABELS: () => GAME_LABELS,
    ...mapGetters({
      storeTeam: 'team',
      selectedGame: 'game',
    }),
    ...mapGetters([
      'isUserLoggedIn', 'authUserAddress',
      'teams',
    ]),
    ...mapRequestStatuses({
      getTeamRequest: 'GET_TEAM',
      createTeamRequest: 'CREATE_TEAM',
      updateTeamRequest: 'UPDATE_TEAM',
      joinTeamRequest: 'JOIN_TEAM',
      createGameRequest: 'CREATE_GAME',
    }),
    createOrUpdateTeamRequest() {
      return this.team.id ? this.updateTeamRequest : this.createTeamRequest;
    },
    possibleOpponents() {
      const otherTeams = _.reject(this.teams, { id: this.teamId });
      return _.map(otherTeams, t => ({
        value: t.id,
        label: t.name,
      }));
    },
  },
  watch: {
    storeTeam: {
      deep: true,
      handler() {
        this.team = _.cloneDeep(this.storeTeam);
        if (!this.team.strategy) this.editMode = true;
      },
    },
  },
  methods: {
    ...mapActions('statechannel', ['createStateChannel']),
    getTeamName(id) { return _.find(this.teams, { id }).name; },
    saveButtonHandler() {
      if (this.$hasError()) return;
      this.$store.dispatchApiAction('UPDATE_TEAM', this.team);
    },
    joinButtonHandler() {
      this.$store.dispatchApiAction('JOIN_TEAM', this.team);
    },
    async createGameButtonHandler() {
      // Initialize state channel then launch new game within DB
      const hostAddress = '';
      const opponentAddress = '';
      await this.createStateChannel({ team0: '', team1: '' });
      console.log('contract', this.deployAddress);

      await this.$store.dispatchApiAction('CREATE_GAME', {
        team0id: this.teamId,
        contractAddress: this.deployAddress,
        ...this.createGamePayload,
      });
      console.log('this.createGameRequest', this.createGameRequest);

      if (this.createGameRequest.isSuccess) {
        this.$router.push(`/game/${this.selectedGame.channelId}`);
      }
    },
  },
  mounted() {
    this.$store.dispatchApiAction('GET_TEAM', this.teamId);
    this.$store.dispatchApiAction('GET_ALL_TEAMS');
  },
};
</script>

<style lang='less'>

</style>
