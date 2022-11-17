import { indexDB } from './versionOfIndexedDB.js';
import { showInBasket, howManyItems, totalCounter, showState, getData } from './utills.js';

class Action {
    constructor() {
        this.initElements();
        this.init();
        this.zoom();
        this.slider();
    }

    initElements() {
        this.name = document.querySelector('#nameOfProduct');
        this.price = document.querySelector('#price');
        this.images = document.querySelectorAll('.img');
        this.addBtn = document.querySelector('.view-content__cart');
        this.basket = document.querySelector('.basket__content');
        this.basketItem = document.querySelector('.basket');
        this.totalPrice = document.querySelector('.basket__price');
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            let info = getData('img');
            this.name.innerHTML = info[0];
            this.price.innerHTML = info[2];

            this.images.forEach(img => {
                img.innerHTML = info[1];
                let p = info[1].split('product');
                img.style.backgroundImage = `url(./dist/images/product/product${p[2].slice(0, 6)})`;
            });
        });

        this.addBtn.addEventListener('click', () => {
            let info = getData('img');
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
                        checkProducts(products, info[0]);
                    }
                };
            };

            const checkProducts = (products, type) => {
                products.forEach(product => {
                    if (product.type === type) {
                        updateUserProducts(product);
                    }
                });
            };

            const updateUserProducts = product => {
                let request = indexDB.open('client', 1);

                request.onsuccess = e => {
                    this.db = e.target.result;
                    this.addProduct(product, this.db);
                };
            };
        });
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

    zoom() {
        this.images.forEach(img => {
            img.addEventListener('mousemove', event => {
                let zoomer = event.currentTarget;

                let x = event.offsetX / zoomer.offsetWidth * 100;
                let y = event.offsetY / zoomer.offsetHeight * 100;

                zoomer.style.backgroundPosition = x + "% " + y + "%";
            });
        });
    }

    slider() {
        const slider = document.querySelectorAll('.slider__img');
        const sliderDots = document.querySelectorAll('.slider__dot');
        const sliderLeft = document.querySelector('.slider__left');
        const sliderRight = document.querySelector('.slider__right');
        let index = 0;

        const activeSlider = e => {
            for (let slide of slider) {
                slide.classList.remove('active');
            }
            slider[e].classList.add('active');
        };

        const activeDot = e => {
            for (let dot of sliderDots) {
                dot.classList.remove('activeDot');
            }
            sliderDots[e].classList.add('activeDot');
        };

        const funcSliderAndDot = f => {
            activeSlider(f);
            activeDot(f);
        };

        const toRightSlider = () => {
            index == slider.length - 1 ? funcSliderAndDot(index = 0) : funcSliderAndDot(++index);
        };

        const toLeftSlider = () => {
            index == 0 ? funcSliderAndDot(index = slider.length - 1) : funcSliderAndDot(--index);
        };

        sliderDots.forEach((item, dotIndex) => {
            item.addEventListener('click', () => {
                funcSliderAndDot(index = dotIndex);
            });
        });

        sliderRight.addEventListener('click', toRightSlider);
        sliderLeft.addEventListener('click', toLeftSlider);
    }
}

new Action();