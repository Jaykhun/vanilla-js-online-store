import { indexDB } from './versionOfIndexedDB.js';
import { createObjectDB, showProducts, cancelValue, removeClass, formValidate, addClass, showMessage, showState } from './utills.js';

class Products {
    constructor() {
        this.initElements();
        this.init();
    }

    initElements() {
        this.name = document.querySelector('#typeOfProduct');
        this.price = document.querySelector('#price');
        this.discount = document.querySelector('#discount');
        this.description = document.querySelector('#description');
        this.addBtn = document.querySelector('#addBtn');
        this.productsWrap = document.querySelector('.users__info');
        // ? popup variables
        this.popup = document.querySelector('.product-popup');
        this.changeName = document.querySelector('#changeTypeOfProduct');
        this.changePrice = document.querySelector('#changePrice');
        this.changeDescription = document.querySelector('#changeDescription');
        this.changeDiscount = document.querySelector('#changeDiscount');
        this.changeSaveBtn = document.querySelector('.product-popup__save');
        this.changeCloseBtn = document.querySelector('.product-popup__close');
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            let request = indexDB.open('products', 1);

            request.onupgradeneeded = e => {
                this.db = e.target.result;
                if (!this.db.objectStoreNames.contains('products')) {
                    createObjectDB(this.db, 'products', 'type');
                }
            };

            request.onsuccess = e => {
                this.db = e.target.result;
                productsTransaction(this.db);
            };

            const productsTransaction = db => {
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
                        checkAllproducts(products);
                    }
                };
            };

            const checkAllproducts = products => {
                products.forEach(product => {
                    this.productsWrap.innerHTML += showProducts(product.img, product.type, product.description, product.price, product['product code'], product.discount, product['how many']);
                });
            };
        });

        this.productsWrap.addEventListener('click', e => {
            e.preventDefault();
            let item = e.target;
            let parent = item.parentElement;
            let grantparent = parent.parentElement;

            if (item.classList.contains('users__delete')) {
                this.deleteProduct(grantparent.children[0].children[1].innerHTML, grantparent);
            } else if (item.classList.contains('users__change')) {
                this.changeProduct(grantparent.children[0].children);
                addClass(this.popup, 'show');
                removeClass(this.popup, 'hide');
            }
        });

        this.addBtn.addEventListener('click', e => {
            e.preventDefault();
            this.validation();
        });
    }

    deleteProduct(type, parentBlock) {
        let request = indexDB.open('products', 1);
        request.onsuccess = e => {
            this.db = e.target.result;
            let transaction = this.db.transaction('products', 'readwrite');
            let data = transaction.objectStore('products');
            let req = data.openCursor();
            let products = [];

            req.onsuccess = e => {
                let cursor = e.target.result;

                if (cursor !== null) {
                    products.push(cursor.value);
                    cursor.continue();
                } else {
                    checkAllProducts(products, data);
                }
            };

            const checkAllProducts = (products, data) => {
                products.forEach(product => {
                    if (product.type === type) {
                        data.delete(product.type);
                        parentBlock.remove();
                    }
                });
            };
        };
    }

    changeProduct(productInfo) {
        this.changeName.value = productInfo[1].innerHTML;
        this.changeDescription.value = productInfo[2].innerHTML;
        this.changePrice.value = productInfo[3].innerHTML;
        this.changeDiscount.value = productInfo[5].innerHTML;

        const popupCloseBtn = document.querySelector('.product-popup__close');
        const popupSaveBtn = document.querySelector('.product-popup__save');

        popupCloseBtn.addEventListener('click', () => {
            removeClass(this.popup, 'show');
            addClass(this.popup, 'hide');
        });

        popupSaveBtn.addEventListener('click', () => {
            let error = formValidate('._change-req', '._change-name-req', '._change-price-req', this.changeName.value, this.changePrice.value);
            error === 0 ? this.checkProductForChange(productInfo[1].innerHTML, productInfo) : showMessage('Please fill in the required fields');
        });
    }

    validation() {
        let error = formValidate('._req', '._name-req', '._price-req', this.name.value, this.price.value);
        error === 0 ?
        // ! request for IndexdDB 
        this.requestProduct() : showMessage('Please fill in the required fields');
    }

    requestProduct() {
        let request = indexDB.open('products', 1);

        request.onupgradeneeded = e => {
            this.db = e.target.result;
            if (!this.db.objectStoreNames.contains('products')) {
                createObjectDB(this.db, 'products', 'type');
            }
        };

        request.onsuccess = e => {
            this.db = e.target.result;
            this.addProduct();
        };

        request.onerror = () => alert(`Error, ${request.error}`);
    }

    addProduct() {
        let info = null;
        let imgArray = ['product-2.png', 'product-1.png', 'product-3.png'];
        let random = Math.floor(Math.random() * imgArray.length);
        if (this.discount.value == '') {
            this.discount.value = 0;
        }

        info = {
            type: this.name.value.trim().toLowerCase(),
            price: this.price.value,
            ['product code']: 423003 + Math.floor(Math.random() * 20),
            discount: this.discount.value,
            img: `product-${random + 1}.png`,
            description: this.description.value,
            ['how many']: 1
        };

        let transaction = this.db.transaction('products', 'readwrite');
        let data = transaction.objectStore('products');
        data.add(info);

        transaction.oncomplete = () => {
            this.productsWrap.innerHTML += showProducts(info.img, info.type, info.description, info.price, info['product code'], info.discount, info['how many']);
            cancelValue(this.name, this.price, this.description, this.discount);
        };

        transaction.onerror = () => showMessage('This product already exists');
    }

    checkProductForChange(type, productInfo) {
        if (this.changeName.value === type && this.changePrice.value === productInfo[3].innerHTML && this.changeDescription.value === productInfo[2].innerHTML && this.changeDiscount.value === productInfo[5].innerHTML) {
            removeClass(this.popup, 'show');
            addClass(this.popup, 'hide');
            showState("You didn't change anything");
        } else {
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
                        change(products, data, type);
                    }
                };
            };

            const change = (products, data, type) => {
                console.log(type);
                products.forEach(product => {
                    if (product.type === type) {
                        this.changedProductAdd(product, data, productInfo);
                    }
                });
            };
        }
    }

    changedProductAdd(product, data, productInfo) {
        data.delete(product.type);
        product.type = this.changeName.value;
        product.price = +this.changePrice.value;
        product.discount = +this.changeDiscount.value;
        product.description = this.changeDescription.value;

        data.add(product);

        productInfo[1].innerHTML = this.changeName.value;
        productInfo[2].innerHTML = this.changeDescription.value;
        productInfo[3].innerHTML = this.changePrice.value;
        productInfo[5].innerHTML = this.changeDiscount.value;

        removeClass(this.popup, 'show');
        addClass(this.popup, 'hide');
        showState('Changing procces completed successfully');
    }
}

new Products();