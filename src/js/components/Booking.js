import {templates, select, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
    constructor(element){
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam
            ],
        };

       // console.log('params',params);
        
        const urls = {
            booking:       settings.db.url + '/' + settings.db.bookings 
                                           + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events 
                                           + '?' + params.eventsRepeat.join('&'),
        };

       // console.log('urls', urls);

       Promise.all([
        fetch(urls.booking),
        fetch(urls.eventsCurrent),
        fetch(urls.eventsRepeat)
        ])
        .then((allResponses) => {
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        })
        .then(([bookings, eventsCurrent, eventsRepeat]) => {
            //console.log(bookings);
            //console.log(eventsCurrent);
            //console.log(eventsRepeat);

            thisBooking.parsedData(bookings,eventsCurrent,eventsRepeat);
        });
    }

    parsedData(bookings,eventsCurrent,eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.dateWidget.minDate;
        const maxDate = thisBooking.dateWidget.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        //console.log('thisbokking.booked', thisBooking.booked);
        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

      const startHour = utils.hourToNumber(hour);
      for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
           if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
          }
          thisBooking.booked[date][hourBlock].push(table);
      }
    }

    updateDOM() {
        const thisBooking = this;
        thisBooking.date = thisBooking.dateWidget.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourWidget.value);
        let allAvailable = false;
        if (
          typeof thisBooking.booked[thisBooking.date] == 'undefined'
          ||
          typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ) {
          allAvailable = true;
        }
        for (let table of thisBooking.dom.tables) {
          let tableId = table.getAttribute(settings.booking.tableIdAttribute);
          if (!isNaN(tableId)) {
            tableId = parseInt(tableId);
          }
          if (
            !allAvailable
            &&
            thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
          ) {
            table.classList.add(classNames.booking.tableBooked);
          } else {
            table.classList.remove(classNames.booking.tableBooked);
          }
        }
      }

    render(element){
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {};

        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.dateWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(select.booking.floor);
        thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(select.booking.duration);
        thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(select.booking.people);
        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);
        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    }

    initTables(){
        const thisBooking = this;

        thisBooking.dom.floor.addEventListener('click', (e) => {
            console.log('buttonclicked')
            e.preventDefault();
            if (e.target.classList.contains('table')) {
                if (!e.target.classList.contains(classNames.booking.tableBooked)) {
                  for (let table of thisBooking.dom.tables) {
                    if (table.classList.contains(classNames.booking.tableSelected) &&
                      table !== e.target) {
                      table.classList.remove(classNames.booking.tableSelected);
                    }
                    if (e.target.classList.contains(classNames.booking.tableSelected)) {
                      e.target.classList.remove(classNames.booking.tableSelected);
                      thisBooking.tableId = null;
                    } else {
                      e.target.classList.add(classNames.booking.tableSelected);
                      thisBooking.tableId = e.target.dataset.table;
                    }
                  }
                } else {
                  alert('This table is already booked, please choose another');
                }
            }
        });        
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', () => {
            thisBooking.amount = thisBooking.amountWidget;
        });

        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', () => {
            thisBooking.amount = thisBooking.amountWidget;
        });

       thisBooking.dateWidget = new DatePicker(thisBooking.dom.dateWrapper);
       thisBooking.dom.datePicker.addEventListener('updated', this.element);

        thisBooking.hourWidget = new HourPicker(thisBooking.dom.hourWrapper);
        thisBooking.dom.hourPicker.addEventListener('updated', this.element);

        thisBooking.dom.wrapper.addEventListener('updated', () => {
            thisBooking.updateDOM();
        });

        thisBooking.dom.floor.addEventListener('click', (event) => {
            event.preventDefault();
            thisBooking.initTables(event);
        });

        thisBooking.dom.submit.addEventListener('click', function (event) {
            event.preventDefault();
            thisBooking.sendBooking();
          });
    }

    sendBooking() {
        const thisBooking = this;
        const url = settings.db.url + '/' + settings.db.bookings;
        const payload = {
          date: thisBooking.date,
          hour: utils.numberToHour(thisBooking.hour),
          table: parseInt(thisBooking.tableId),
          duration: thisBooking.dom.hoursAmount.value,
          ppl: thisBooking.dom.peopleAmount.value,
          starters: [],
          phone: thisBooking.dom.phone.value,
          adress: thisBooking.dom.address.value,
        };
        for (let starter of thisBooking.dom.starters) {
          if (starter.checked) {
            payload.starters.push(starter.value);
          }
        }
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        };

        fetch(url, options)
        .then(function (response) {
          console.log('Server response:', response);
          return response.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
          thisBooking.makeBooked(
            parsedResponse.date,
            parsedResponse.hour,
            parsedResponse.duration,
            parsedResponse.table
          );
          thisBooking.updateDOM();
        })
        .catch(function (error) {
          console.error('Error:', error);
        });
    }
}

export default Booking;