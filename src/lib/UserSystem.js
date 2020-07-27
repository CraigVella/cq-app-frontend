import Cookie from 'js-cookie';
import Axios from 'axios';

const UserSystem_API         = "https://covid.malverneschools.org/api/";
const UserSystem_COOKIE_LIFE = 7;

class UserSystem {
    #CQData = {
        devicetoken: null,
        mode: 'standalone',
        location: 'NO-LOCATION-SET',
        kiosk_temptoken: null
    };

     constructor() {
         this.readCookieData();
     }

     readCookieData() {
        this.#CQData.mode = Cookie.get('mode') || this.#CQData.mode;
        this.#CQData.location = Cookie.get('location') || this.#CQData.location;
        if (this.#CQData.mode.toUpperCase() === 'KIOSK') {
            Cookie.remove('devicetoken');
            this.#CQData.kiosk_temptoken = Cookie.get('kiosk_temptoken');
        } else if(this.#CQData.mode.toUpperCase() === 'STANDALONE') {
            this.#CQData.devicetoken = Cookie.get('devicetoken');
            if (this.#CQData.devicetoken !== undefined && this.#CQData.devicetoken !== null) {
                Cookie.set('devicetoken', this.#CQData.devicetoken, { expires: UserSystem_COOKIE_LIFE }); // Refresh the cookie when it's read
            }
        }
     }

     inKioskMode() {
         return this.#CQData.mode.toUpperCase() === 'KIOSK';
     }

     getKioskLocation() {
         return this.#CQData.location;
     }

     getCookieData() {
         this.readCookieData();
         return Object.assign({},this.#CQData);
     }

     loginUser(username, password) {
        return new Promise((res) => {
            let loginData = new FormData();
            loginData.append('username', username);
            loginData.append('password', password);
            loginData.append('action', 'LOGIN');
            loginData.append('devicetoken', (this.#CQData.devicetoken === undefined) ? null : this.#CQData.devicetoken);
            
            Axios.post(UserSystem_API, loginData).then((r)=>{
                res(r.data);
                if (!this.inKioskMode()) {
                    Cookie.set('devicetoken',r.data.data.devicetoken, { expires: UserSystem_COOKIE_LIFE });
                } else {
                    Cookie.set('kiosk_temptoken', r.data.data.devicetoken);
                }
                this.readCookieData();
            })
        });
     }

     getUserList() {
        this.readCookieData();
        if (this.inKioskMode()) {
            return new Promise((res) => {
                if (this.#CQData.kiosk_temptoken === undefined) {
                    res(null);
                } else {
                    let getUserData = new FormData();
                    getUserData.append('devicetoken', this.#CQData.kiosk_temptoken);
                    getUserData.append('action', 'GET_USERS');
                    Axios.post(UserSystem_API, getUserData).then((r) => {
                        res(r.data);
                    });
                }
            });
        } else {
            return new Promise((res) => {
                if (this.#CQData.devicetoken === undefined) {
                    res(null);
                } else {
                    let getUserData = new FormData();
                    getUserData.append('devicetoken', this.#CQData.devicetoken);
                    getUserData.append('action', 'GET_USERS');
                    Axios.post(UserSystem_API, getUserData).then((r) => {
                        res(r.data);
                    });
                }
            });
        }
     }

     destroyKioskTempToken() {
        if (this.inKioskMode()) {
            let destroyTokenReq = new FormData();
            destroyTokenReq.append('devicetoken', this.#CQData.kiosk_temptoken);
            destroyTokenReq.append('action', 'DESTROY_TOKEN');
            Axios.post(UserSystem_API, destroyTokenReq);
            Cookie.remove('kiosk_temptoken');
        }
     }

     submitSurvey(usersArray) {
        let userData = [];
        usersArray.forEach(user => {
            if (!user.hascompletedtoday) {
                userData.push(user);
            }
        });
        let userResponseData = new FormData();
        userResponseData.append('userdata', JSON.stringify(userData));
        if (this.inKioskMode()) {
           if ('isvisitor' in userData[0]) {
               // The submission is a visitor
               userResponseData.append('action', 'VISITOR_SURVEY');
               userResponseData.append('kloc',this.getKioskLocation());
           } else {
                userResponseData.append('devicetoken', this.#CQData.kiosk_temptoken);
                userResponseData.append('action', 'SUBMIT_SURVEY');
           }
        } else {
           userResponseData.append('devicetoken', this.#CQData.devicetoken);
           userResponseData.append('action', 'SUBMIT_SURVEY');
        }
        return new Promise((res) => {
            Axios.post(UserSystem_API, userResponseData).then((r) => {
                res(r.data);
            });
        });
     }
}

export default UserSystem;