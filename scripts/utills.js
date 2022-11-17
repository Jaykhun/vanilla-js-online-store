import { indexDB } from './versionOfIndexedDB.js';

// ? create obj in indexdDB
const createObjectDB = (request, item, key) => {
    request.createObjectStore(item, { keyPath: key });
};

// ? get Data from indexedDB
const requestDB = (locationOfData, nameOfData) => {
    let request = indexDB.open(locationOfData, 1);
    let returnResult = {};

    request.onsuccess = e => {
        let db = e.target.result;
        let transaction = db.transaction(nameOfData, 'readwrite');
        let data = transaction.objectStore(nameOfData);

        let req = data.openCursor();
        let arr = [];

        req.onsuccess = e => {
            let cursor = e.target.result;

            if (cursor !== null) {
                arr.push(cursor.value);
                returnResult.arr = arr;
                returnResult.data = data;
                cursor.continue();
            }
        };
    };

    return returnResult;
};

// ? get item in local storage
const getData = key => JSON.parse(localStorage.getItem(key));

// ? set item in local storage
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ? redirect to another page
const redirectTopage = page => {
    setTimeout(() => {
        window.location.href = `${page}.html`;
    }, 0);
};

// ? check the user from indexedDB to local storage
const checkUser = users => {
    let currentUser = getData('currentUser');
    let currentUserFromDB = null;
    users.forEach(user => {
        if (user.login === currentUser) {
            currentUserFromDB = user;
        }
    });

    return currentUserFromDB;
};

// ? form validation
const formValidate = (reqClass, name, password, cunfirmPassword, passwordValue, cunfirmValue) => {
    let error = 0;
    let formReq = document.querySelectorAll(reqClass);

    for (let index = 0; index < formReq.length; index++) {
        let input = formReq[index];

        // ? delete all error class
        removeClass(input, '_error');

        if (input.classList.contains(name) && !emailTest(input)) {
            addClass(input, '_error');
            error++;
        } else if (input.classList.contains(password) && !passwordTest(input)) {
            addClass(input, '_error');
            error++;
        } else if (input.classList.contains(cunfirmPassword) && !(passwordValue === cunfirmValue)) {
            addClass(input, '_error');
            error++;
        } else if (input.value === '') {
            addClass(input, '_error');
            error++;
        }
    }

    return error;
};

// ? create notification
const showState = message => {
    let wrap = document.querySelector('.notification-wrap');
    let block = document.createElement('div');
    wrap.append(block);
    block.innerHTML = message;

    block.style.cssText = `
    position: fixed;
    right: -300px;
    top: 45px;
    min-width: 150px;
    max-width: 200px;
    padding: 10px;
    background-color: #fff;
    text-align: center;
    font-family: "Montserrat", sans-serif;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 0 5px 0 #0003;
    z-index: 10;
    color: #00c8c8;
    `;

    setTimeout(() => {
        block.style.right = '30px';
    }, 200);

    setTimeout(() => {
        block.style.right = '-300px';
    }, 2200);

    setTimeout(() => {
        block.remove();
    }, 2400);
};

// ? show in basket
const showInBasket = (type, imgLink) => {
    return `
    <div class="basket-item">
    <div class="basket-item__info">
        <div class="basket-item__img">
            <img src="./images/product/${imgLink}" alt="">
        </div>
        <div class="basket-item__title">${type}</div>
    </div>

    <div class="basket-item__control">
        <input type="number" class="basket-item__count" name="basket"
            id="howMuch" min="0" , max="12">
        <button class="basket-item__btn product-button">Delete</button>
    </div>
    </div>
    `;
};

// ? show orders
const showOrders = (name, phone, done) => {
    return `
    <div class="users__item">
        <span>${name}</span>
        <span>${phone}</span>

        <button class="users__change">Show</button>
        <button class="users__status ${done === true ? 'done' : 'execute'}"> ${done === true ? 'Done' : 'Execute'}</button>
    </div>
    `;
};

// ? show all products in orders
const showAllProducts = (img, type, description, price, code, discount, count) => {
    return `
    <div class="order-popup__item">
        <span class="users__img"><img src="./images/product/${img}" alt="img"></span>
        <span class="users__type">${type}</span>
        <span class="users__description">${description}</span>
        <span class="users__price">${price}</span>
        <span class="users__code">${code}</span>
        <span class="users__discount">${discount}</span>
        <span class="users__howmany">${count}</span>
    </div>
    `;
};

// ? show products in add product
const showProducts = (img, type, description, price, code, discount, count) => {
    return `
    <div class="users__item">
        <div class="users__content">
            <span class="users__img"><img src="./images/product/${img}" alt="img"></span>
            <span class="users__type">${type}</span>
            <span class="users__description">${description}</span>
            <span class="users__price">${price}</span>
            <span class="users__code">${code}</span>
            <span class="users__discount">${discount}</span>
            <span class="users__howmany">${count}</span>
        </div>

        <div class="users__btn">
            <button class="users__change">Change</button>
            <button class="users__delete">Delete</button>
        </div>
    </div>
    `;
};

// ? show users in admin panel
const showUser = (login, password) => {
    return `
    <div class="users__item">
        <span>${login}</span>
        <span>${password}</span>

        <button class="users__change">Change</button>
        <button class="users__delete">Delete</button>
    </div>
    `;
};

// ? show search result
const showSearchResult = type => {
    return `
    <a href="#" class="search__result-item">
        ${type}
    </a>
    `;
};

// ? how many products have in indexedDB   
const howManyItems = (user, basketItem) => {
    user.products.length != 0 ? basketItem.innerHTML = user.products.length + ' items' : basketItem.innerHTML = 'empty';
};

// ? how much all of the products cost   
const totalCounter = (user, price) => {
    let counter = 0;
    user.products.forEach(product => {
        counter += product['how many'] * product.price;
    });
    price.innerHTML = counter;
};

const cancelValue = (first, second, third, fourth) => {
    first.value = "";
    second.value = "";
    if (third != undefined) {
        third.value = "";
    }

    if (fourth != undefined) {
        fourth.value = "";
    }
};

const removeClass = (e, removeCLass) => e.classList.remove(removeCLass);

const addClass = (e, addCLass) => e.classList.add(addCLass);

const emailTest = e => e.value.length >= 3;

const passwordTest = e => e.value.length >= 5;

const showMessage = message => alert(message);

export { createObjectDB, requestDB, getData, setData, checkUser, formValidate, redirectTopage, showInBasket, showAllProducts, showProducts, showSearchResult, howManyItems, totalCounter, showUser, showOrders, removeClass, addClass, emailTest, passwordTest, showMessage, showState, cancelValue };