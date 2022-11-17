import { indexDB } from './versionOfIndexedDB.js';
import { createObjectDB, removeClass, showOrders, showAllProducts, addClass } from './utills.js';

class Orders {
    constructor() {
        this.initElements();
        this.init();
    }

    initElements() {
        this.usersWrap = document.querySelector('.users__info');
        this.popupWrap = document.querySelector('.order-popup');
        this.popupBody = document.querySelector('.order-popup__body');
        this.popupContent = document.querySelector('.order-popup__content');
        this.popupCloseBtn = document.querySelector('.order-popup__close');
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            let request = indexDB.open('orders', 1);

            request.onupgradeneeded = e => {
                this.db = e.target.result;
                if (!this.db.objectStoreNames.contains('orders')) {
                    createObjectDB(this.db, 'orders', 'name');
                }
            };

            request.onsuccess = e => {
                this.db = e.target.result;
                let transaction = this.db.transaction('orders', 'readwrite');
                let data = transaction.objectStore('orders');
                let req = data.openCursor();
                let orders = [];

                req.onsuccess = e => {
                    let cursor = e.target.result;

                    if (cursor !== null) {
                        orders.push(cursor.value);
                        cursor.continue();
                    } else {
                        this.showOrders(orders);
                    }
                };
            };
        });

        this.usersWrap.addEventListener('click', e => {
            let item = e.target;
            let parent = item.parentElement;

            if (item.classList.contains('users__change')) {
                this.showProducts(parent.children[0].innerHTML);
            } else if (item.classList.contains('users__status')) {
                this.changeStatus(parent.children[0].innerHTML, parent.children[3]);
            }
        });
    }

    showOrders(orders) {
        orders.forEach(order => {
            this.usersWrap.innerHTML += showOrders(order.name, order.phone, order.done);
        });
    }

    showProducts(name) {
        let request = indexDB.open('orders', 1);

        request.onupgradeneeded = e => {
            this.db = e.target.result;
            if (!this.db.objectStoreNames.contains('orders')) {
                createObjectDB(this.db, 'orders', 'name');
            }
        };

        request.onsuccess = e => {
            this.db = e.target.result;
            let transaction = this.db.transaction('orders', 'readwrite');
            let data = transaction.objectStore('orders');
            let req = data.openCursor();
            let orders = [];

            req.onsuccess = e => {
                let cursor = e.target.result;

                if (cursor !== null) {
                    orders.push(cursor.value);
                    cursor.continue();
                } else {
                    checkOrders(orders);
                }
            };
        };

        const checkOrders = orders => {
            orders.forEach(order => {
                if (order.name === name) {
                    removeClass(this.popupWrap, 'hide');
                    addClass(this.popupWrap, 'show');
                    showProducts(order);
                }
            });
        };

        const showProducts = order => {
            order.products.forEach(product => {
                this.popupContent.innerHTML += showAllProducts(product.img, product.type, product.description, product.price, product['product code'], product.discount, product['how many']);
            });
        };

        this.popupCloseBtn.addEventListener('click', e => {
            e.preventDefault();
            removeClass(this.popupWrap, 'show');
            addClass(this.popupWrap, 'hide');

            this.popupContent.innerHTML = '';
            let block = document.createElement('div');
            block.classList.add('order-popup__content');
            this.popupBody.append(block);
        });
    }

    changeStatus(name, status) {
        let request = indexDB.open('orders', 1);
        request.onsuccess = e => {
            this.db = e.target.result;
            let transaction = this.db.transaction('orders', 'readwrite');
            let data = transaction.objectStore('orders');
            let req = data.openCursor();
            let orders = [];

            req.onsuccess = e => {
                let cursor = e.target.result;

                if (cursor !== null) {
                    orders.push(cursor.value);
                    cursor.continue();
                } else {
                    checkOrders(orders, data);
                }
            };
        };

        const checkOrders = (orders, data) => {
            orders.forEach(order => {
                if (order.name === name) {
                    data.delete(order.name);

                    order.done = !order.done;
                    data.add(order);

                    if (order.done) {
                        removeClass(status, 'execute');
                        addClass(status, 'done');
                        status.innerHTML = 'Done';
                    } else {
                        removeClass(status, 'done');
                        addClass(status, 'execute');
                        status.innerHTML = 'Execute';
                    }
                }
            });
        };
    }
}

new Orders();