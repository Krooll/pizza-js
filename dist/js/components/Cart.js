import { select, settings, classNames, templates } from "../settings.js";
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initAction();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.adress = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initAction(){
      const thisCart = this;
      
      thisCart.dom.toggleTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', () => {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', (event) => {
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', (e) => {
        e.preventDefault();
        thisCart.sendOrder();
      });
    }

    add(menuProduct){
      const thisCart = this;

      menuProduct.priceSingle = menuProduct.price / menuProduct.amount;
      const generateHTML = templates.cartProduct(menuProduct);
      const generateDOM = utils.createDOMFromHTML(generateHTML);
      thisCart.dom.productList.appendChild(generateDOM);
      thisCart.products.push(new CartProduct(menuProduct, generateDOM));
      const inputField = generateDOM.querySelector('.amount');
      inputField.value = menuProduct.amount;
      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.totalPrice = 0;
      
      for (let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      } 

      if (thisCart.totalNumber > 0) {
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
        thisCart.deliveryFee = 0;
        thisCart.totalPrice = thisCart.subtotalPrice;
      }

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.forEach(element => {
        element.innerHTML = thisCart.totalPrice;
      });
    }

    remove(event){
      const thisCart = this;

      event.dom.wrapper.remove();
      const removeProduct = thisCart.products.indexOf(event);
      thisCart.products.splice(removeProduct, 1);
      thisCart.update();
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        adress: thisCart.dom.adress.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      }

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('orderParsedResponse', parsedResponse);
        });
      console.log('payload', payload);
    }
}

export default Cart;