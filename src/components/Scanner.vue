<template>
    <div class="wrapper">
        <div class='mufsd-logo'></div>
        <div class='logon-box box'>
            <h1>Please scan your QRCode</h1>
            <div class='scan-anim'></div>
            <div v-if='showTextInput' class='hidden-input'>
                <b-input v-model="keyBuffer" disabled></b-input>
            </div>
        </div>
        <div class='covid-image'></div>
        <b-modal :active.sync="scanResultShown" :can-cancel="showTextInput" :close='forceClose'>
            <div class='results-wrapper box' v-bind:class="{
                'has-passed': (lastScanResult.data.user.hascompletedtoday && lastScanResult.data.user.passed),
                'has-failed': (lastScanResult.data.user.hascompletedtoday && !lastScanResult.data.user.passed),
                'has-incomplete': (!lastScanResult.data.user.hascompletedtoday)
                }">
                <p class='result-name'>{{lastScanResult.data.user.displayname}}</p>
                <p class='result-name'>{{lastScanResult.api.date}}</p>
                <p class='result-name' v-if='lastScanResult.data.user.isvisitor'>{{lastScanResult.data.user.location}}</p>
            </div>
        </b-modal>
    </div>
</template>

<script>
import UserSystem from '../lib/UserSystem.js';
const SCANNER_AUTO_CLOSE   = 10;

let usObj = new UserSystem();

export default {
    name: "Scanner",
    data() {
        return {
            scannerAutoCloseTimer: SCANNER_AUTO_CLOSE,
            keyBuffer: '',
            awaitingResult: false,
            lastScanResult: {
                api: {
                    date: ''
                },
                data: {
                    user: {
                        isvisitor: false,
                        displayname: '',
                        hascompletedtoday: false,
                        passed: false
                    }
                }
            },
            scanResultShown: false,
            showTextInput: false
        }
    },
    timers: {
        scannerAutoClose: {
            time: 1000,
            autostart: false,
            repeat: true,
            immediate: true
        }
    },
    methods: {
        submit() {
            if (this.awaitingResult) return; // Prevent multiple scans without last finishing
            this.awaitingResult = true;
            usObj.getResult(this.keyBuffer, !this.validateEmail(this.keyBuffer)).then((r) => {
                this.lastScanResult = r;
                this.awaitingResult = false;
                this.showResults();
            });
            this.keyBuffer = '';
        },
        showResults() {
            this.scanResultShown = true;
            this.scannerAutoCloseTimer = SCANNER_AUTO_CLOSE;
            this.$timer.start('scannerAutoClose');
        },
        forceClose() {
            this.$timer.stop('scannerAutoClose');
            this.scanResultShown = false;
        },
        scannerAutoClose() {
            if (--this.scannerAutoCloseTimer <= 0) {
                this.$timer.stop('scannerAutoClose');
                this.scanResultShown = false;
            }
        },
        validateEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
    },
    mounted() {
        window.addEventListener('keydown', (e) => {
            if ((e.keyCode >= 48 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 190) {
                this.keyBuffer = this.keyBuffer.concat(e.key);
            } else if (e.keyCode === 27) { // Escape
                alert('Keybuffer: ' + this.keyBuffer);
            } else if (e.keyCode === 8) { // Backspace
                if (this.keyBuffer.length > 0) {
                    this.keyBuffer = this.keyBuffer.slice(0,-1);
                }
            } else if (e.keyCode === 13) { // Return
                this.submit();
            }
        });
        this.showTextInput = usObj.getKioskLocation().toUpperCase() === 'SECURITY';
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

.scan-anim {
    background-image: url('../assets/qrscan_anim.gif');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    height: 200px;
    width: 200px;
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
    min-height: 100vh;
}

h1 {
    font-weight: bold;
    text-align: center;
    font-size: 1.6em;
}

.info-text {
    text-align: center;
    font-size: .7em;
    padding-bottom: 5px;
}

.results-wrapper {
    width: 700px;
    height: 700px;
    margin: 0 auto;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-flow: column nowrap;
}

.has-passed {
    background-color: rgb(0, 255, 13);
}

.has-failed {
    background-color: red;
}

.has-incomplete {
    background-color: yellow;
}

.result-name {
    font-weight: bold;
    text-align: center;
    font-size: 4em;
}

.hidden-input {
    padding-top: 10px;
}
</style>