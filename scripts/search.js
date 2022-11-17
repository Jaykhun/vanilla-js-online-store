import { indexDB } from './versionOfIndexedDB.js';
import { showSearchResult, removeClass, addClass, setData } from './utills.js';

class Search {
    constructor() {
        this.initElements();
        this.init();
    }

    initElements() {
        this.search = document.querySelector('#search');
        this.searchResultWrap = document.querySelector('.search__result');
        this.searchResultItem = document.querySelectorAll('.search__result-item');
        this.searchBtn = document.querySelector('#searchBtn');
    }

    init() {
        this.searchBtn.addEventListener('click', () => {
            let request = indexDB.open('products', 1);

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
                this.searchResultWrap.innerHTML = '';
                let flag = true;
                products.forEach(product => {
                    let result = product.type.split(' ');
                    if (String(result).indexOf(this.search.value.toLowerCase()) > -1) {
                        this.searchResultWrap.innerHTML += showSearchResult(product.type);
                        flag = false;
                    }
                });

                if (flag) this.searchResultWrap.innerHTML = 'We do not have such a product.';

                removeClass(this.searchResultWrap, 'hide');
                addClass(this.searchResultWrap, 'show');
            };
        });

        this.searchResultItem.forEach(item => {
            console.log(1);
            item.addEventListener('click', () => {
                setData(img, item.value.toLowerCase());
                this.search.value = '';
            });
        });
    }
}

new Search();