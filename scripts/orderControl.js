import { indexDB } from './versionOfIndexedDB.js';
import { checkUser, totalCounter, howManyItems } from './utills.js';

class Control {
    constructor() {
        this.initElements();
        this.countOfProduct();
        this.deleteItem();
        this.clearItem();
    }

    initElements() {
        this.basket = document.querySelector('.basket__content');
        this.basketItem = document.querySelector('.basket');
        this.basketBody = document.querySelector('.basket__body');
        this.totalPrice = document.querySelector('.basket__price');
    }

    countOfProduct() {
        this.basketBody.addEventListener('click', e => {
            let item = e.target;
            let parent = item.parentElement;
            let grandParent = parent.parentElement;

            const countProduct = (value, type) => {
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
                            checkAllUsers(users, data);
                        }
                    };
                };

                const checkAllUsers = (users, data) => {
                    let user = checkUser(users);
                    user.products.forEach((product, index) => {
                        if (product.type === type) {
                            data.delete(user.login);
                            user.products[index]['how many'] = +value;

                            data.add(user);
                            totalCounter(user, this.totalPrice);
                        }
                    });
                };
            };

            if (item.classList.contains('basket-item__count')) {
                countProduct(item.value, grandParent.children[0].lastElementChild.innerHTML);
            }
        });
    }

    deleteItem() {
        this.basketBody.addEventListener('click', e => {
            let item = e.target;
            let parent = item.parentElement;
            let grandParent = parent.parentElement;

            if (item.classList.contains('basket-item__btn')) {
                removeProduct(grandParent, grandParent.children[0].lastElementChild.innerHTML);
            }
        });

        const removeProduct = (deleteProduct, type) => {
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
                        checkAllUsers(users, data);
                    }
                };
            };

            const checkAllUsers = (users, data) => {
                let user = checkUser(users);
                user.products.forEach((product, index) => {
                    if (product.type === type) {
                        data.delete(user.login);
                        user.products.splice(index, 1);
                        deleteProduct.remove();

                        data.add(user);
                        howManyItems(user, this.basketItem);
                        totalCounter(user, this.totalPrice);
                    }
                });
            };
        };
    }

    clearItem() {
        this.basketBody.addEventListener('click', e => {
            let item = e.target;

            if (item.classList.contains('basket__clear')) {
                clearProduct();
            }
        });

        const clearProduct = () => {
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
                        checkAllUsers(users, data);
                    }
                };
            };
        };

        const checkAllUsers = (users, data) => {
            let user = checkUser(users);
            data.delete(user.login);
            user.products.length = 0;
            this.basket.innerHTML = '';
            let block = document.createElement('div');
            block.classList.add('basket__content');
            this.basketBody.append(block);
            this.basketItem.innerHTML = 'empty';
            this.totalPrice.innerHTML = 0;
            data.add(user);
        };
    }
}

new Control();

export { Control };