import { indexDB } from './versionOfIndexedDB.js';
import { createObjectDB, showInBasket, checkUser, getData, formValidate, requestDB, totalCounter, howManyItems, showMessage, showState, removeClass, addClass, cancelValue, setData, redirectTopage } from './utills.js';

class Order {
    constructor() {
        this.initElements();
        this.loadItem();
        this.addItem();
        this.buyItem();
    }

    initElements() {
        this.productWrapper = document.querySelector('.main-product__body');
        this.basket = document.querySelector('.basket__content');
        this.basketItem = document.querySelector('.basket');
        this.totalPrice = document.querySelector('.basket__price');
        this.basketBuyBtn = document.querySelector('.basket__buy');
        this.db = null;
        // ? popup variables
        this.userName = document.querySelector('#userName');
        this.userPhone = document.querySelector('#userPhone');
        this.productBuyBtn = document.querySelector('.popup__buy');
        this.popup = document.querySelector('.popup');
        this.popupCloseBtn = document.querySelector('.popup__close');
    }

    loadItem() {
        document.addEventListener('DOMContentLoaded', () => {
            // let data = requestDB('client', 'users');

            const checkAllUsers = users => {
                let currentUser = getData('currentUser');
                users.forEach(user => {
                    if (user.login === currentUser) {
                        user.products.forEach(product => {
                            this.basket.innerHTML += showInBasket(product.type, product.img);
                            this.basketCount = document.querySelectorAll('.basket-item__count');

                            howManyItems(user, this.basketItem);
                            totalCounter(user, this.totalPrice);
                        });

                        user.products.forEach((product, index) => {
                            this.basketCount[index].value = product['how many'];
                        });
                    }
                });
            };

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
        });
    }

    addItem() {
        this.productWrapper.addEventListener('click', e => {
            let item = e.target;
            let parent = item.parentElement;
            let grandParent = parent.parentElement;

            if (item.classList.contains('product__buy')) {
                this.getProductsFromDB(grandParent.children[0].innerHTML);
            } else if (item.classList.contains('product__resize')) {
                setData('img', [grandParent.children[0].innerHTML, grandParent.parentElement.children[0].innerHTML, grandParent.parentElement.children[1].innerHTML]);
                redirectTopage('product-view');
            }
        });
    }

    getProductsFromDB(type) {
        let request = indexDB.open('products', 1);

        request.onsuccess = e => {
            this.db = e.target.result;
            productTransaction(this.db);
        };

        const productTransaction = db => {
            let transaction = db.transaction('products', 'readwrite');
            let data = transaction.objectStore('products');
            let req = data.openCursor();
            let products = [];

            req.onsuccess = e => {
                let cursor = e.target.result;

                if (cursor !== null) {
                    products.push(cursor.value);
                    cursor.continue();
                } else {
                    this.checkProducts(products, type);
                }
            };
        };
    }

    checkProducts(products, type) {
        products.forEach(product => {
            if (product.type === type) {
                this.updateUserProducts(product);
            }
        });
    }

    updateUserProducts(product) {
        let request = indexDB.open('client', 1);

        request.onsuccess = e => {
            this.db = e.target.result;
            this.addProduct(product, this.db);
        };
    }

    addProduct(product, db) {
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

        const checkAllUsers = (users, data) => {
            let currentUser = getData('currentUser');
            let flag = true;
            users.forEach(user => {
                if (user.login === currentUser && user.products.length >= 0) {
                    user.products.forEach(item => {
                        if (item.type == product.type) {
                            flag = false;
                            showState('Product has been already added');
                        }
                    });

                    if (flag) {
                        addDB(user, data);
                    }
                }
            });
        };

        const addDB = (user, data) => {
            user.products.push(product);
            data.delete(user.login);
            data.add(user);
            this.basket.innerHTML += showInBasket(product.type, product.img);
            this.basketCount = document.querySelectorAll('.basket-item__count');

            user.products.forEach((product, index) => {
                this.basketCount[index].value = product['how many'];
            });

            howManyItems(user, this.basketItem);
            totalCounter(user, this.totalPrice);
            showState('Product Added');
        };
    }

    buyItem() {
        this.basketBuyBtn.addEventListener('click', e => {
            e.preventDefault();
            let flag = true;

            let request = indexDB.open('client', 1);
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
                        checkAllUsers(users);
                    }
                };
            };

            const checkAllUsers = users => {
                let currentUser = getData('currentUser');
                users.forEach(user => {
                    if (user.login === currentUser && user.products.length === 0) {
                        showMessage('First select a product');
                        flag = false;
                    }
                });

                if (flag) {
                    removeClass(this.popup, 'hide');
                    addClass(this.popup, 'show');
                    let user = checkUser(users);
                    this.phoneMask();

                    this.productBuyBtn.addEventListener('click', e => {
                        e.preventDefault();
                        let error = formValidate('._popup-req', '._name-req', '._phone-req');
                        error === 0 ?
                        // ! add orders to IndexdDB 
                        this.addOrders(user) : showMessage('Please fill in the required fields');
                    });
                }
            };
        });

        this.popupCloseBtn.addEventListener('click', e => {
            e.preventDefault();
            removeClass(this.popup, 'show');
            addClass(this.popup, 'hide');
            cancelValue(this.userName, this.userPhone);
        });
    }

    phoneMask() {
        let phoneInputs = document.querySelectorAll('input[data-tel-input]');

        const getInputNumbersValue = input => {
            return input.value.replace(/\D/g, '');
        };

        const onPhoneInput = e => {
            let input = e.target;
            let inputNumbersValue = getInputNumbersValue(input),
                selectionStart = input.selectionStart,
                formattedInputValue = "";

            if (input.value.length != selectionStart) {
                if (e.data && /\D/g.test(e.data)) {
                    input.value = inputNumbersValue;
                }
                return;
            }

            if (["3", "9"].indexOf(inputNumbersValue[3]) > -1 && ["3", "1", "2", "4"].indexOf(inputNumbersValue[4]) > -1) {
                if (inputNumbersValue.length > 3) {
                    formattedInputValue += inputNumbersValue.substring(0, 3) + ' ';
                }

                if (inputNumbersValue.length >= 3) {
                    formattedInputValue += inputNumbersValue.substring(3, 5) + ' ';
                }

                if (inputNumbersValue.length >= 6) {
                    formattedInputValue += inputNumbersValue.substring(5, 8) + ' ';
                }

                if (inputNumbersValue.length >= 9) {
                    formattedInputValue += inputNumbersValue.substring(8, 10) + ' ';
                }

                if (inputNumbersValue.length >= 11) {
                    formattedInputValue += inputNumbersValue.substring(10, 12);
                }
            } else {
                formattedInputValue = inputNumbersValue.substring(0, 17);
            }

            input.value = `+${formattedInputValue}`;
        };

        phoneInputs.forEach(item => {
            item.value = '+998 ';
            item.addEventListener('input', onPhoneInput);
        });
    }

    addOrders(user) {
        let requestForOrders = indexDB.open('orders', 1);

        requestForOrders.onupgradeneeded = e => {
            this.db = e.target.result;
            if (!this.db.objectStoreNames.contains('orders')) {
                createObjectDB(this.db, 'orders', 'name');
            }
        };

        requestForOrders.onsuccess = e => {
            this.db = e.target.result;
            let info = null;

            info = {
                name: this.userName.value.trim().toLowerCase(),
                phone: this.userPhone.value.trim().toLowerCase(),
                username: user.login,
                products: user.products,
                done: false
            };

            let transaction = this.db.transaction('orders', 'readwrite');
            let data = transaction.objectStore('orders');
            data.add(info);

            transaction.onerror = () => {
                let request = indexDB.open('orders', 1);
                request.onsuccess = e => {
                    this.db = e.target.result;
                    userTransaction(this.db);
                };

                const userTransaction = db => {
                    let transaction = db.transaction('orders', 'readwrite');
                    let data = transaction.objectStore('orders');

                    let req = data.openCursor();
                    let orders = [];

                    req.onsuccess = e => {
                        let cursor = e.target.result;

                        if (cursor !== null) {
                            orders.push(cursor.value);
                            cursor.continue();
                        } else {
                            checkAllOrders(orders, data);
                        }
                    };
                };

                const checkAllOrders = (orders, data) => {
                    let currentUser = getData('currentUser');
                    orders.forEach(user => {
                        if (user.username === currentUser) {
                            user.products.forEach(product => {
                                info.products.push(product);
                            });

                            data.delete(info.name);
                            data.add(info);
                        }
                    });
                };
            };

            let request = indexDB.open('client', 1);

            request.onsuccess = e => {
                this.db = e.target.result;
                let transaction = this.db.transaction('users', 'readwrite');
                let dataDB = transaction.objectStore('users');

                dataDB.delete(user.login);
                user.products = [];
                dataDB.add(user);
                this.basket.innerHTML = '';
                howManyItems(user, this.basketItem);
                totalCounter(user, this.totalPrice);
            };

            removeClass(this.popup, 'show');
            addClass(this.popup, 'hide');
            showState('Thank you for purchase');
            cancelValue(this.userName, this.userPhone);
        };
    }
}

new Order();

export { Order };