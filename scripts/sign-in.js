import { indexDB } from './versionOfIndexedDB.js';
import { setData, redirectTopage, showMessage } from './utills.js';

class SignIn {
    constructor() {
        this.initElements();
        this.userCheck();
    }

    initElements() {
        this.signInName = document.querySelector('#signInInputName');
        this.signInPassword = document.querySelector('#signInInputPassword');
        this.signInBtn = document.querySelector('#signInBtn');
        this.signInForm = document.querySelector('.main-form__sign');
        this.db = null;
    }

    userCheck() {
        const check = e => {
            e.preventDefault();

            let request = indexDB.open('client', 1);
            request.onsuccess = e => {
                this.db = e.target.result;
                userTransaction(this.db);
            };

            const userTransaction = db => {
                let transaction = db.transaction('users', 'readwrite');
                let data = transaction.objectStore('users');
                let req = data.openCursor();
                let users = [];

                req.onsuccess = e => {
                    let cursor = e.target.result;

                    if (cursor !== null) {
                        users.push(cursor.value);
                        cursor.continue();
                    } else {
                        checkAllUsers(users);
                    }
                };
            };

            const checkAllUsers = users => {
                let flag = true;
                users.forEach(user => {
                    if (user.login == this.signInName.value && user.password == this.signInPassword.value) {
                        // ! set current user in local storage
                        setData('currentUser', this.signInName.value.trim().toLowerCase());
                        redirectTopage('home');
                        flag = false;
                    }
                });

                if (flag) showMessage('You are not registered yet or wrong password');
            };
        };
        this.signInForm.addEventListener('submit', check);
    }
}

new SignIn();

export { SignIn };