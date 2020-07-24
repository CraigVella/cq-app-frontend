import Cookie from 'js-cookie';
import Axios from 'axios';

const UserSystem_API         = "https://covid.malverneschools.org/api/";
const UserSystem_COOKIE_LIFE = 7;

class UserSystem {
    #CQData = {
        devicetoken: null
    };
     constructor() {
         this.readCookieData();
     }

     readCookieData() {
        this.#CQData.devicetoken = Cookie.get('devicetoken');
        if (this.#CQData.devicetoken !== undefined && this.#CQData.devicetoken !== null) {
            Cookie.set('devicetoken', this.#CQData.devicetoken, { expires: UserSystem_COOKIE_LIFE }); // Refresh the cookie when it's read
        }
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
                Cookie.set('devicetoken',r.data.data.devicetoken, { expires: UserSystem_COOKIE_LIFE });
                this.readCookieData();
            })
        });
     }

     getUserList() {
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

export default UserSystem;