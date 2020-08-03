<template>
    <div v-if='!inScanMode' class="main-wrapper" v-visibility-change="reloadUserList">
        <div class='main-title'></div>
        <Survey ref='survey' v-on:enable-add-student='enableAddStudent' v-on:reload-user-list='reloadUserList' 
            v-bind:Users="users" v-bind:CurrentServerDate="currentServerDate"
            v-bind:InKioskMode="inKioskMode" v-bind:KioskLocation='kioskLocation'
            v-on:extend-cancel-timer='extendCancelTimer'></Survey>
        <b-modal :active.sync="showModalLogin" full-screen :can-cancel="false">
            <ModalUserAssociate v-bind:showCancel='showModalCancel' v-on:new-user="newUserAdded" 
                v-on:cancel-user="cancelUser" v-bind:InKioskMode='inKioskMode' v-on:visitor-user='newVisitorUser'></ModalUserAssociate>
        </b-modal>
        <div class='add-user-button' v-if='allowAddStudent && !inKioskMode'>
            <b-button icon-left="account" type='is-success' @click="addUserClick()">Add additional account</b-button>
        </div>
        <div class='add-user-button' v-if='inKioskMode'>
            <b-button icon-left="cancel" type='is-danger' @click="cancelKioskSurvey()">{{cancelSurveyString}}</b-button>
        </div>
    </div>
    <Scanner v-else></Scanner>
</template>

<script>
import UserSystem from './lib/UserSystem.js';
import ModalUserAssociate from './components/ModalUserAssociate.vue';
import Survey from './components/Survey.vue';
import Scanner from './components/Scanner.vue';

const CANCEL_SURVEY_TIME   = 30;
const CANCEL_SURVEY_STRING = 'Close Survey';

let usObj = new UserSystem();

export default {
    name: "CQApp",
    data() {
        return {
            users: [],
            showModalLogin: false,
            showModalCancel: false,
            allowAddStudent: true,
            currentServerDate: '',
            inKioskMode: false,
            inScanMode: false,
            kioskLocation: 'NO-LOCATION-SET',
            cancelSurveyString: 'Cancel Survey',
            cancelSurveyTimer: CANCEL_SURVEY_TIME
        }
    },
    mounted() {
        if (usObj.inKioskMode()) {
            this.inKioskMode = true;
            this.kioskLocation = usObj.getKioskLocation();
            this.checkIfShowAddUser();
        } else if (usObj.inScanMode()) {
            this.inScanMode = true;
        } else {
            this.reloadUserList().then(() => {
                this.checkIfShowAddUser();
            });
        }
    },
    timers: {
        cancelSurveyTick: {
            time: 1000,
            autostart: false,
            repeat: true,
            immediate: true
        }
    },
    methods: {
        extendCancelTimer() {
            this.cancelSurveyTimer = CANCEL_SURVEY_TIME;
        },
        cancelSurveyTick() {
            this.cancelSurveyString = CANCEL_SURVEY_STRING + ' : ' + this.cancelSurveyTimer;
            --this.cancelSurveyTimer;
            if (this.cancelSurveyTimer < 0) {
                this.$timer.stop('cancelSurveyTick');
                this.cancelKioskSurvey();
            }
        },
        cancelKioskSurvey() {
            this.users = [];
            this.$refs.survey.clearKiosk();
            usObj.destroyKioskTempToken();
            this.checkIfShowAddUser();
            this.$timer.stop('cancelSurveyTick');
            this.cancelSurveyTimer = CANCEL_SURVEY_TIME;
            this.cancelSurveyString = CANCEL_SURVEY_STRING;
        },
        reloadUserList() {
            return usObj.getUserList().then((r) => {
                if (r && !r.api.status.error) {
                    this.users = r.data.users;
                    this.currentServerDate = r.api.date;
                } else {
                    if (r) {
                        this.currentServerDate = r.api.date;
                    }
                    this.users = [];
                    this.checkIfShowAddUser();
                }
            });
        },
        checkIfShowAddUser() {
            if (!this.users.length) {
                this.showModalLogin = true;
                this.showModalCancel = false;
            }
        },
        newUserAdded() {
            this.reloadUserList().then(() => {
                this.showModalLogin = false;
                if (this.inKioskMode) {
                    this.$timer.start('cancelSurveyTick');
                }
            });
        },
        newVisitorUser() {
            this.users = [
                {
                    isvisitor: true,
                    firstname: '',
                    lastname: '',
                    email: '',
                    displayname: 'Visitor Questionnaire',
                    hascompletedtoday: false,
                    questionresponses: [
                        null,null,null
                    ]
                }
            ];
            this.$refs.survey.clearKiosk();
            this.showModalLogin = false;
            this.$timer.start('cancelSurveyTick');
        },
        addUserClick() {
            this.$buefy.dialog.confirm({
                    title: 'Add additional account',
                    message: 'Adding an additional account, will wipe unsubmitted survey answers, continue?',
                    confirmText: 'Yes',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => {
                        this.showModalCancel = true; 
                        this.showModalLogin = true;
                    }
            })
        },
        cancelUser() {
            this.showModalLogin = false;
        },
        enableAddStudent(enable = true) {
            this.allowAddStudent = enable;
        }
    },
    components: { ModalUserAssociate, Survey, Scanner }
}
</script>

<style>
body {
    font-family: Arial;
    color: black;
}
.main-wrapper {
    min-height: 100vh;
    padding-top: 10px;
}
.main-title {
    background-image: url('./assets/title.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    height: 10vh;
    margin-bottom: 20px;
}

.add-user-button {
    width: 100%;
    height: 50px;
    text-align: right;
    padding-right: 15px;
    padding-top: 60px;
    padding-bottom: 60px;
}
</style>