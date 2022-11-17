import { indexDB } from './versionOfIndexedDB.js';
import { createObjectDB } from './utills.js';

class Products {
    constructor() {
        this.update();
    }

    update() {
        this.db = null;
        document.addEventListener('DOMContentLoaded', this.requestProduct);
    }

    requestProduct() {
        let request = indexDB.open('products', 1);
        request.onupgradeneeded = e => {
            this.db = e.target.result;
            createObjectDB(this.db, 'products', 'type');
        };

        request.onsuccess = e => {
            this.db = e.target.result;
            let productFirst = null;
            let productSecond = null;
            let productThird = null;

            productFirst = {
                type: 'ave classic pullover',
                price: 100,
                ['product code']: 423000,
                discount: 10,
                img: 'product-1.png',
                ['how many']: 1,
                description: 'Casual fit. 100% Cotton. Elasticated cuffs. Free shipping with 4 days delivery'
            };

            productSecond = {
                type: 'ave classic t-shirt',
                price: 110,
                ['product code']: 423001,
                discount: 15,
                img: 'product-2.png',
                ['how many']: 1,
                description: 'Casual fit. 100% Cotton. Elasticated cuffs. Free shipping with 4 days delivery'
            };

            productThird = {
                type: 'ave classic blue-shirt',
                price: 120,
                ['product code']: 423002,
                discount: 20,
                img: 'product-3.png',
                ['how many']: 1,
                description: 'Casual fit. 100% Cotton. Elasticated cuffs. Free shipping with 4 days delivery'
            };

            let transaction = this.db.transaction('products', 'readwrite');
            let data = transaction.objectStore('products');
            data.add(productFirst);
            data.add(productSecond);
            data.add(productThird);
        };
    }
}

new Products();

export { Products };