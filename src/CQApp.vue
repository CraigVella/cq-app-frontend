<template>
    <div class="main-wrapper" v-visibility-change="reloadUserList">
        <div class='main-title'></div>
        <Survey ref='survey' v-on:enable-add-student='enableAddStudent' v-on:reload-user-list='reloadUserList' 
            v-bind:Users="users" v-bind:CurrentServerDate="currentServerDate"
            v-bind:InKioskMode="inKioskMode" v-bind:KioskLocation='kioskLocation'></Survey>
        <b-modal :active.sync="showModalLogin" full-screen :can-cancel="false">
            <ModalUserAssociate v-bind:showCancel='showModalCancel' v-on:new-user="newUserAdded" 
                v-on:cancel-user="cancelUser" v-bind:InKioskMode='inKioskMode' v-on:visitor-user='newVisitorUser'></ModalUserAssociate>
        </b-modal>
        <div class='add-user-button' v-if='allowAddStudent && !inKioskMode'>
            <b-button icon-left="account" type='is-success' @click="addUserClick()">Add additional account</b-button>
        </div>
        <div class='add-user-button' v-if='inKioskMode'>
            <b-button icon-left="cancel" type='is-danger' @click="cancelKioskSurvey()">Cancel Survey</b-button>
        </div>
    </div>
</template>

<script>
import UserSystem from './lib/UserSystem.js';
import ModalUserAssociate from './components/ModalUserAssociate.vue';
import Survey from './components/Survey.vue';

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
            kioskLocation: 'NO-LOCATION-SET'
        }
    },
    mounted() {
        if (usObj.inKioskMode()) {
            this.inKioskMode = true;
            this.kioskLocation = usObj.getKioskLocation();
            this.checkIfShowAddUser();
        } else {
            this.reloadUserList().then(() => {
                this.checkIfShowAddUser();
            });
        }
    },
    methods: {
        cancelKioskSurvey() {
            this.users = [];
            this.$refs.survey.clearKiosk();
            usObj.destroyKioskTempToken();
            this.checkIfShowAddUser();
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
    components: { ModalUserAssociate, Survey }
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
    padding-top: 15px;
    margin-bottom: 10px;
}
</style>