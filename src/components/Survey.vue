<template>
    <div class='survey-wrapper'>
        <b-steps size='is-small' :has-navigation='!isSubmitting && (stillNeedSurvey || Users.length > 1)' v-model="currentStep">
            <b-step-item v-for='(user, ui) in Users' :key='ui' :label='user.displayname'>
                <div class='question-box' v-if='!user.hascompletedtoday'>
                    <div v-for="(question, i) in questions" :key='i' class='question'>
                        <div class='question-number'>Question {{i+1}}:</div> 
                        <div class='question-content'>{{question.question}}
                            <b-field position="is-right" class='question-field'>
                                <b-radio-button v-model="Users[ui].questionresponses[i]"
                                    :native-value='0'
                                    type="is-danger">
                                    <b-icon icon="close"></b-icon>
                                    <span>No</span>
                                </b-radio-button>

                                <b-radio-button v-model="Users[ui].questionresponses[i]"
                                    :native-value='1'
                                    type="is-success">
                                    <b-icon icon="check"></b-icon>
                                    <span>Yes</span>
                                </b-radio-button>
                            </b-field>
                        </div>
                    </div>
                </div>
                <div class='complete-box box' v-bind:class="{ 'has-failed': (user.hascompletedtoday && !user.passed), 'has-passed': (user.hascompletedtoday && user.passed) }" v-else>
                    <div class='complete-name'>{{user.displayname}}</div>
                    <QRCode :value='user.uid' class='qr-code'></QRCode>
                    <div class='complete-date'>{{CurrentServerDate}}</div>
                </div>
            </b-step-item>
            <b-step-item label="Submit" v-if='stillNeedSurvey'>
                <div class='box submit-box'>
                    <b-button :loading='isSubmitting' size="is-large" icon-left="cube-send" :disabled='!submitAvailable' @click="submitSurvey">Submit</b-button>
                    <div class='submit-error' v-if='!submitAvailable'>You must complete the entire survey before submitting</div>
                </div>
            </b-step-item>
        </b-steps>
    </div>    
</template>

<script>
import UserSystem from '../lib/UserSystem.js';
import QRCode from 'qrcode.vue';

export default {
    name: "Survey",
    props: {
        Users: Array,
        CurrentServerDate: String
    },
    data() {
        return {
            questions: [
                { question: "Have you knowingly been in close or proximate contact in the past 14 days with anyone who has tested positive for COVID-19 or who has or had symptoms of COVID-19?" },
                { question: "Have you tested positive for COVID-19 in the past 14 days?" },
                { question: "Have you experienced any symptoms of COVID-19 in the past 14 days?" }
            ],
            isSubmitting: false,
            currentStep: 0
        }
    },
    computed: {
        submitAvailable() {
            for (let x = 0; x < this.Users.length; ++x) {
                for (let y = 0; y < this.Users[x].questionresponses.length; ++y) {
                    if (this.Users[x].questionresponses[y] === null && !this.Users[x].hascompletedtoday) {
                        return false;
                    }
                }
            }
            return true;
        },
        stillNeedSurvey() {
            for (let x = 0; x < this.Users.length; ++x) {
                for (let y = 0; y < this.Users[x].questionresponses.length; ++y) {
                    if (!this.Users[x].hascompletedtoday){
                        return true;
                    }
                }
            }
            return false;   
        }
    },
    methods: {
        submitSurvey() {
            this.isSubmitting = true;
            this.$emit('enable-add-student', false);
            let usObj = new UserSystem();
            usObj.submitSurvey(this.Users).then((r) => {
                if (r.api.status.error){
                    this.$buefy.dialog.alert({
                            title: 'Error submitting survey',
                            message: 'The following error was returned: <i>' + r.api.status.info + '</i>',
                            type: 'is-danger',
                            hasIcon: true
                    })
                }
                this.$emit('reload-user-list');
                this.$emit('enable-add-student', true);
                this.isSubmitting = false;
                this.currentStep = 0;
            });
        }
    },
    components: {
        QRCode
    }
}
</script>

<style scoped>
.submit-box {
    align-items: center;
    justify-content: center;
    display: flex;
    flex-flow: column nowrap;
    height: 50vh;
    text-align: center;
}

.survey-wrapper {
    width: 100%;
}

.question-box {
    padding: 20px;
}

.complete-box {
    align-items: center;
    justify-content: center;
    display: flex;
    flex-flow: column nowrap;
    height: 50vh;
}

.question-number {
    font-weight: bold;
    padding-right: 5px;
    white-space: nowrap;
}

.question-content {
    width: 100%;
    padding-bottom: 30px;
}

.question {
    font-size: 1em;
    display: inline;
}

.question-field {
    padding-top: 5px;
    padding-right: 10px;
    padding-top: 10px;
}

.submit-error {
    color: red;
    
}

.has-passed {
    background-color: rgb(0, 255, 13);
}

.has-failed {
    background-color: red;
}

.qr-code {
    border-radius: 5px;
    border: 2px solid black;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-flow: column nowrap;
    padding: 5px;
}

.complete-name {
    padding-bottom: 10px;
    width: 100%;
    text-align: center;
    font-size: 6vw;
}

.complete-date {
    padding-top: 10px;
    width: 100%;
    text-align: center;
    font-size: 6vw;
}
</style>