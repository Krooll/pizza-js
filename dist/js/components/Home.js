import { templates, select } from '../settings.js';
import utils from '../utils.js';
import app from '../app.js';

class Home {
  constructor(){
    const thisHome = this;
   
    thisHome.render();
    thisHome.initActions();
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.homeWidget();
    thisHome.element = utils.createDOMFromHTML(generatedHTML);
    const homeContainer = document.querySelector(select.containerOf.home);
    homeContainer.appendChild(thisHome.element);
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.homeHeader = document.querySelector(select.home.homeHeader);
  }

  initActions() {
    const thisHome = this;
    thisHome.dom.homeHeader.addEventListener('click', function(event){
      console.log('clicked')
      event.preventDefault();
      let pageId = event.target.getAttribute(select.home.dataId);
      if (pageId) {
        //thisHome.app.activatePage(pageId);
        app.activatePage(pageId);
      }
    });
  }
}

export default Home;