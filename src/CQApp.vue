<template>
    <div class="main-wrapper">
        <Sidebar></Sidebar>
        <b-modal :active.sync="showModalLogin" full-screen :can-cancel="false">
            <ModalUserAssociate v-on:new-user="newUserAdded"></ModalUserAssociate>
        </b-modal>
    </div>
</template>

<script>
import UserSystem from './lib/UserSystem.js';
import ModalUserAssociate from './components/ModalUserAssociate.vue';
import Sidebar from './components/Sidebar.vue';

let usObj = new UserSystem();

export default {
    name: "CQApp",
    data() {
        return {
            users: [],
            showModalLogin: false
        }
    },
    model: {

    },
    mounted() {
        this.reloadUserList().then(() => {
            if (!this.users.length) {
                this.showModalLogin = true;
            }
        });
    },
    methods: {
        reloadUserList() {
            return usObj.getUserList().then((r) => {
                if (r && !r.api.status.error) {
                    this.users = r.data.users;
                }
            });
        },
        newUserAdded() {
            this.reloadUserList().then(() => {
                this.showModalLogin = false;
            });
        }
    },
    components: { ModalUserAssociate, Sidebar }
}
</script>

<style>
html {
    background-color: rgb(0, 102, 218);
}

body {
    font-family: Arial;
    color: black;
}
</style>