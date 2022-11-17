import { indexDB } from './versionOfIndexedDB.js';
import { createObjectDB, showUser, cancelValue, removeClass, formValidate, addClass, showMessage, showState } from './utills.js';

class AdminControl {
    constructor() {
        this.initElements();
        this.validation();
        this.showUsers();
        this.deleteUser();
        this.changeUser();
    }

    initElements() {
        // ? register variables
        this.registerName = document.querySelector('#registerInputName');
        this.registerPassword = document.querySelector('#registerInputPassword');
        this.registerBtn = document.querySelector('#registerBtn');
        this.registerForm = document.querySelector('.main-form__register');
        this.cunfirmPassword = document.querySelector('#registerInputCunfirm');
        this.userWrapInfo = document.querySelector('.users__info');
        // ? popup variables
        this.popup = document.querySelector('.admin-popup');
        this.changeUserName = document.querySelector('#changeUserName');
        this.changeUserPassword = document.querySelector('#changeUserPassword');
        this.db = null;
    }

    validation() {
        const formSend = e => {
            e.preventDefault();
            let error = formValidate('._register-req', '_register-name', '_register-password', '_register-cunfirm', this.registerPassword.value, this.cunfirmPassword.value);

            error === 0 ?
            // ! request for IndexdDB 
            this.request() : showMessage('Please fill in the required fields');
        };

        this.registerForm.addEventListener('submit', formSend);
    }

    request() {
        let request = indexDB.open('client', 1);

        request.onupgradeneeded = e => {
            this.db = e.target.result;
            if (!this.db.objectStoreNames.contains('users')) {
                createObjectDB(this.db, 'users', 'login');
            }
        };

        request.onsuccess = e => {
            this.db = e.target.result;
            this.add();
        };

        request.onerror = () => alert(`Error, ${request.error}`);
    }

    add() {
        let info = null;
        info = {
            login: this.registerName.value.trim().toLowerCase(),
            password: this.registerPassword.value.trim().toLowerCase(),
            products: []
        };

        let transaction = this.db.transaction('users', 'readwrite');
        let data = transaction.objectStore('users');
        data.add(info);

        transaction.oncomplete = () => {
            this.userWrapInfo.innerHTML += showUser(info.login, info.password);
            cancelValue(this.registerName, this.registerPassword, this.cunfirmPassword);
        };

        transaction.onerror = () => showMessage('This user already exists');
    }

    showUsers() {
        document.addEventListener('DOMContentLoaded', () => {
            let request = indexDB.open('client', 1);

            request.onupgradeneeded = e => {
                this.db = e.target.result;
                if (!this.db.objectStoreNames.contains('users')) {
                    createObjectDB(this.db, 'users', 'login');
                }
            };

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
                users.forEach(user => {
                    this.userWrapInfo.innerHTML += showUser(user.login, user.password);
                });
            };
        });
    }

    deleteUser() {
        this.userWrapInfo.addEventListener('click', e => {
            let item = e.target;
            let parent = item.parentElement;

            if (item.classList.contains('users__delete')) {
                this.checkUser(parent.children[0].innerHTML, parent);
            }
        });
    }

    checkUser(login, parentBlock) {
        let request = indexDB.open('client', 1);

        request.onupgradeneeded = e => {
            this.db = e.target.result;
            if (!this.db.objectStoreNames.contains('users')) {
                createObjectDB(this.db, 'users', 'login');
            }
        };

        request.onsuccess = e => {
            this.db = e.target.result;
            let transaction = this.db.transaction('users', 'readwrite');
            let data = transaction.objectStore('users');
            let req = data.openCursor();
            let users = [];

            req.onsuccess = e => {
                let cursor = e.target.result;

                if (cursor !== null) {
                    users.push(cursor.value);
                    cursor.continue();
                } else {
                    checkAllUsers(users, data);
                }
            };
        };

        const checkAllUsers = (users, data) => {
            users.forEach(user => {
                if (user.login === login) {
                    data.delete(user.login);
                    parentBlock.remove();
                }
            });
        };
    }

    changeUser() {
        this.userWrapInfo.addEventListener('click', e => {
            let item = e.target;
            this.parent = item.parentElement;

            if (item.classList.contains('users__change')) {
                this.showPopup(this.parent.children[0].innerHTML, this.parent.children[1].innerHTML);
                addClass(this.popup, 'show');
                removeClass(this.popup, 'hide');
            }
        });
    }

    showPopup(login, password) {
        this.changeUserName.value = login;
        this.changeUserPassword.value = password;

        const popupCloseBtn = document.querySelector('.admin-popup__close');
        const popupSaveBtn = document.querySelector('.admin-popup__save');

        popupCloseBtn.addEventListener('click', () => {
            removeClass(this.popup, 'show');
            addClass(this.popup, 'hide');
        });

        popupSaveBtn.addEventListener('click', () => {
            let error = formValidate('._change-req', '_register-name', '_register-password', '_register-cunfirm');
            error === 0 ? this.checkUserForChange(login, password) : showMessage('Please fill in the required fields');
        });
    }

    checkUserForChange(login, password) {
        if (this.changeUserName.value === login && this.changeUserPassword.value === password) {
            removeClass(this.popup, 'show');
            addClass(this.popup, 'hide');
            showState("You didn't change anything");
        } else {
            let request = indexDB.open('client', 1);

            request.onupgradeneeded = e => {
                this.db = e.target.result;
                if (!this.db.objectStoreNames.contains('users')) {
                    createObjectDB(this.db, 'users', 'login');
                }
            };

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
                        this.change(users, login, password, data);
                    }
                };
            };
        }
    }

    change(users, login, password, data) {
        users.forEach(user => {
            if (user.login === login && user.password === password) {
                this.addDB(user, this.changeUserName.value, this.changeUserPassword.value, data);
            }
        });
    }

    addDB(user, changeLogin, changePassword, data) {
        data.delete(user.login);
        user.login = changeLogin;
        user.password = changePassword;
        data.add(user);

        this.parent.children[0].innerHTML = changeLogin;
        this.parent.children[1].innerHTML = changePassword;

        removeClass(this.popup, 'show');
        addClass(this.popup, 'hide');
        showState('Changing procces completed successfully');
    }
}

new AdminControl();