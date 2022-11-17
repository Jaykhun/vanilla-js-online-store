import { indexDB } from './versionOfIndexedDB.js';
import { createObjectDB, setData, redirectTopage, formValidate, removeClass, addClass, emailTest, passwordTest, showMessage } from './utills.js';

class Register {
    constructor() {
        this.initElements();
        this.validation();
    }

    initElements() {
        this.registerName = document.querySelector('#registerInputName');
        this.registerPassword = document.querySelector('#registerInputPassword');
        this.registerBtn = document.querySelector('#registerBtn');
        this.registerForm = document.querySelector('.main-form__register');
        this.cunfirmPassword = document.querySelector('#registerInputCunfirm');
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

        // ! set current user in local storage
        setData('currentUser', this.registerName.value.trim().toLowerCase());
        transaction.oncomplete = () => redirectTopage('home');
        transaction.onerror = () => showMessage('This user already exists');
    }
}

new Register();

export { Register };