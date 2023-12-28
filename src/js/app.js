import { settings,select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";

  const app = {
    initPages: function(){
      const thisApp = this;

      thisApp.pages = document.querySelector(select.containerOf.pages).children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      const idFromHash = window.location.hash.replace('#/', '');
      let pageMatchingHash = thisApp.pages[0].id;

      for(let page of thisApp.pages){
        if(page.id === idFromHash){
          pageMatchingHash = page.id;
          break;
        }
      }

      thisApp.activatePage(pageMatchingHash);

      for(let link of thisApp.navLinks){
        link.addEventListener('click', (e) => {
          const clickedElement = e.currentTarget;
          e.preventDefault();

          /*get page id from href*/
          const id = clickedElement.getAttribute('href').replace('#', '');
          /*run thisApp.activatePage with that id*/
          thisApp.activatePage(id);

          /*change URL hash*/
          window.location.hash = '#/' + id;
        });
      }
    },

    activatePage: function(pageId){
      const thisApp = this;

      /* add class active to matching pages, remove from non-matching*/
      for(let page of thisApp.pages){
        page.classList.toggle(classNames.pages.active, page.id === pageId);
      }
      /* add class active to matching link, remove from non-link*/
      for(let link of thisApp.navLinks){
        link.classList.toggle(
          classNames.nav.active, 
          link.getAttribute('href') === '#' + pageId
        );
      }
    },

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
    initBooking: function(){
      const thisApp = this;

      thisApp.bookingContainer = document.querySelector(select.containerOf.booking);

      thisApp.booking = new Booking(thisApp.bookingContainer);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      
      thisApp.initPages();
      thisApp.initData();
      thisApp.initCart();
      thisApp.initBooking();
    },
  };

  app.init();
