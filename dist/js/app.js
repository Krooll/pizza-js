import { settings,select } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){

          /*save parsedResponse at thisApp.data.products*/
          thisApp.data.products = parsedResponse;

          /*execute initMenu method*/
          thisApp.initMenu()
        });

        console.log('thisAppdata', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', (e) =>{
        app.cart.add(e.detail.product);
      });
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      
      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();

