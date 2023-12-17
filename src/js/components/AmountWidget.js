import { settings, select } from "../settings.js";

class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    /*trzeba poprawic kod: nie reaguje na wpisanie liter zamiast cyfr*/

    setValue(value){
      const thisWidget = this;
      let newValue = parseInt(value);

      /*TODO: Add validation*/
      if(thisWidget.value !== newValue && !isNaN(newValue)){
        thisWidget.value = newValue;
      }

      if(thisWidget.value <= settings.amountWidget.defaultMin){
        thisWidget.value = settings.amountWidget.defaultMin;
      }

      if(thisWidget.value > settings.amountWidget.defaultMax){
        thisWidget.value = settings.amountWidget.defaultMax;
      }
      
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', () => {
        thisWidget.value = thisWidget.input.value;
      });

      thisWidget.linkIncrease.addEventListener('click', (event) =>{
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

      thisWidget.linkDecrease.addEventListener('click', (event) => {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      }); 
    }
}

export default AmountWidget;