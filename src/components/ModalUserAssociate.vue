<template>
    <div class="wrapper">
        <div class="mufsd-logo"></div>
        <div class="logon-box box">
            <h1>Covid-19 Questionnaire</h1>
            <p class='info-text'>Add an account to this device</p>
            <b-field :type="loginError ? 'is-danger' : ''">
                <b-input placeholder="email@malverne.k12.ny.us" expanded icon="email" v-model="email"></b-input>
            </b-field>
            <b-field :type="loginError ? 'is-danger' : ''">
                <b-input type='password' placeholder="Password" expanded icon="lock-question" v-model="password"></b-input>
            </b-field>
            <b-field class='login-button'>
                <b-button :loading="isLoading" type='is-primary' @click="loginUser()">Login</b-button>
            </b-field>
            <p class='error' v-if="loginError">The username or password was incorrect</p>
        </div>
        <div class="covid-image"></div>
    </div>
</template>

<script>
import UserSystem from '../lib/UserSystem.js';

export default {
    name: "ModalUserAssociate",
    data() {
        return {
            loginError: false,
            email: null,
            password: null,
            isLoading: false
        }
    },
    methods: {
        loginUser() {
            this.isLoading = true;
            let usObj = new UserSystem();
            usObj.loginUser(this.email, this.password).then( (r) => {
                if (r.api.status.error) {
                    this.loginError = true;
                    this.isLoading = false;
                    this.password = '';
                } else {
                    this.$emit('new-user');
                }
            });
        }
    }
}
</script>

<style scoped>
.mufsd-logo {
    background-image: url('../assets/mufsd_logo.png');
    width: 200px;
    height: 223px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    margin: 0 auto;
}   

.covid-image {
    background-image: url('../assets/corona.svg');
    position: absolute;
    width: 100%;
    background-size: cover;
    background-position: top;
    background-repeat: no-repeat;
    height: 100%;
    transform: translateY(60%);
    bottom: 0;
    z-index: 0;
}

.logon-box {
    width: 80vw;
    margin: 0 auto;
    margin-top: 30px;
    max-width: 525px;
    z-index: 1;
    position: relative;
    margin-bottom: 30px;
}

.wrapper {
    padding-top: 20px;
    overflow: hidden;
    position: relative;
    width: 100%;
    min-height: 100%;
}

h1 {
    font-weight: bold;
    text-align: center;
    font-size: 1.4em;
}

.info-text {
    text-align: center;
    font-size: .7em;
    padding-bottom: 5px;
}

.login-button {
    text-align: center;
}

.error {
    color: red;
    font-size: .8em;
    font-weight: bold;
    text-align: center;
}
</style>