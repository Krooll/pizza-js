import { templates, select } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(activatePage){
    const thisHome = this;
   
    thisHome.app = activatePage;
    console.log('thisHomeApp',thisHome.app)
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
    thisHome.dom.homeContainer = document.querySelector(select.home.homeHeader);
  }

  initActions() {
    const thisHome = this;
    thisHome.dom.homeContainer.addEventListener('click', function(event){
      event.preventDefault();
      let pageId = event.target.offsetParent.getAttribute(select.home.dataId);
      if (pageId) {
        //thisHome.app.activatePage(pageId);
        thisHome.app.activatePage(pageId);
      }
    });
  }
}

export default Home;