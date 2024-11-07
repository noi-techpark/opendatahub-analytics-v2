// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * view-events.js
 *
 * This script is responsible for the Events tab. Here we show a form that allows to
 * - select a time range
 * - select a data provider (each data provider has a slightly different data format)
 * - optionally select a category (each data provider has its own categories)
 *
 * By submitting the form, the data returned by the opendatahub API is shown in a table.
 *
 * The date range can be selected in two ways:
 * - by manually setting the start and end dates using the jQuery datepickers
 * - by clicking on some buttons that apply some presets to the datepickers
 *
 * The data provider determines what category an user can optionally use as
 * additional filter. Therefore, when the dataprovider is changed, the categories are
 * dynamically loaded from the API and shown into the corresponding form element.
 *
 * When the form is submitted, the API is called and the returned data is manipulated
 * in order to get fed into the table webcomponent. The webcomponent needs also a
 * schema for the input data, which is also dynamically declared in this script.
 */

;(() => {
   console.debug('loading the view-events.js script')
   // setTimeout(() => {console.clear()}, 2000)

   // this will contain the form state
   let state = {}

   // define shorthands
   let $fromdate = jQuery('#events_fromdate')
   let $todate = jQuery('#events_todate')
   let _fromdate = document.querySelector('#events_fromdate')
   let _openEnd = document.querySelector('#events_openend')
   let _todate = document.querySelector('#events_todate')
   let _today = document.querySelector('#events_range_today')
   let _ytoday = document.querySelector('#events_range_ytoday')
   let _week = document.querySelector('#events_range_week')
   let _month = document.querySelector('#events_range_month')
   let _query = document.querySelector('#events_query_btn')
   let _category = document.querySelector('#events_category')
   let _provider = document.querySelector('#events_data_provider')
   let _table = document.querySelector('#events_table')
   let _loader = document.querySelector('#icon_query_loading')

   // setup datepickers
   $fromdate.datepicker({ dateFormat: 'yy-mm-dd' })
   $fromdate.datepicker('setDate', '-7')
   $todate.datepicker({ dateFormat: 'yy-mm-dd' })
   $todate.datepicker('setDate', '0')

   // set some preset dates when clicking on the date button controls
   _today.addEventListener('click', () => {
      $fromdate.datepicker('setDate', '0')
      $todate.datepicker('setDate', '1')
   })
   _ytoday.addEventListener('click', () => {
      $fromdate.datepicker('setDate', '-1')
      $todate.datepicker('setDate', '1')
   })
   _week.addEventListener('click', () => {
      $fromdate.datepicker('setDate', '-7')
      $todate.datepicker('setDate', '0')
   })
   _month.addEventListener('click', () => {
      $fromdate.datepicker('setDate', '-31')
      $todate.datepicker('setDate', '0')
   })

   const fetchAuthorized = (url, authToken) => {
      if (authToken) {
         return fetch(url, { headers: { Authorization: authToken } })
      } else {
         return fetch(url)
      }
   }

   // load the categories dinamically every time the data provider is changed
   _provider.addEventListener('change', async (e) => {
      // add an <option> into a <select>
      const addOption = (text, value, parent, selected) => {
         const option = document.createElement('OPTION')
         option.innerText = text
         option.value = value
         if (selected) {
            option.selected = true
         }
         parent.appendChild(option)
      }
      // query the API to get all categories for the given data provider
      const provider = e.target.value
      _query.disabled = !provider
      _category.innerHTML = ''
      if (provider) {
         const api_response = await fetchAuthorized(
            `${env.ODH_MOBILITY_API_URI}/flat,event/${provider}?select=evcategory&distinct=1`,
            AUTHORIZATION_TOKEN
         )
         const response_body = await api_response.json()
         const categories = response_body.data.map((c) => c.evcategory) // clean up the data
         categories.sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
         ) // sort alphabetically
         if (categories) {
            addOption('All', '', _category, true) // add a catch-all fake category
            categories.forEach((c) => {
               addOption(c, encodeURIComponent(c), _category)
            })
         }
      }
   })
   // on page load dispatch the change event manually to force-load the categories when the browser
   // has already the data provider selected (e.g. after a page refresh)...
   _provider.dispatchEvent(new Event('change'))
   // ...and disable query button when no provider is selected
   _query.disabled = !_provider.value

   // define a function to toggle the loading state of the query button
   const toggleLoadingState = () => {
      _loader.style.visibility =
         _loader.style.visibility === 'visible' ? 'hidden' : 'visible'
      _query.disabled = !_query.disabled
   }

   // define a function to transform the data of a single event coming from the API
   // to the data that is going to be fed into the reactive-table webcomponent
   const api2table = (event) => {
      switch (state.provider) {
         case 'A22':
            return {
               evstart: event.evstart,
               evend: event.evend,
               evcategory: event.evcategory,
               lane: event.evmetadata.idcorsia,
               direction: event.evmetadata.iddirezione,
               start_meter: event.evmetadata.metro_inizio,
               end_meter: event.evmetadata.metro_fine,
            }
         case 'PROVINCE_BZ':
            return {
               evstart: event.evstart,
               evend: event.evend,
               evcategory: event.evcategory,
               descDe: event.evmetadata.placeDe,
               descIt: event.evmetadata.placeIt,
            }
         default:
            return {
               error: 'Could not determine the data format to show.',
            }
      }
   }

   // define a function to get the table schema dynamically depending on the data provider
   const getTableSchema = () => {
      switch (state.provider) {
         case 'A22':
            return [
               {
                  key: 'evstart',
                  name: 'Start time',
                  type: 'date',
               },
               {
                  key: 'evend',
                  name: 'End time',
                  type: 'date',
               },
               {
                  key: 'evcategory',
                  name: 'Category',
                  type: 'string',
               },
               {
                  key: 'lane',
                  name: 'Lane',
                  type: 'string',
               },
               {
                  key: 'direction',
                  name: 'Direction',
                  type: 'string',
               },
               {
                  key: 'start_meter',
                  name: 'Start Meter',
                  type: 'number',
               },
               {
                  key: 'end_meter',
                  name: 'End Meter',
                  type: 'number',
               },
            ]
         case 'PROVINCE_BZ':
            return [
               {
                  key: 'evstart',
                  name: 'Start time',
                  type: 'date',
               },
               {
                  key: 'evend',
                  name: 'End time',
                  type: 'date',
               },
               {
                  key: 'evcategory',
                  name: 'Category',
                  type: 'string',
               },
               {
                  key: 'descDe',
                  name: 'Description (DE)',
                  type: 'string',
               },
               {
                  key: 'descIt',
                  name: 'Description (IT)',
                  type: 'string',
               },
            ]
         default:
            return [
               {
                  key: 'error',
                  name: '',
                  type: 'string',
               },
            ]
      }
   }

   // handle the form submission - here is where the main work is done
   _query.addEventListener('click', async () => {
      // collect the form data into a cleaner object
      state = {
         fromdate: _fromdate.value,
         todate: _todate.value,
         category: _category.value,
         provider: _provider.value,
      }

      // do the ajax request against the API
      toggleLoadingState()
      let api_url = `${env.ODH_MOBILITY_API_URI}/tree,event/${state.provider}/${state.fromdate}/${state.todate}`

      // create where parameter
      let where_params = []
      if (state.category) where_params.push(`evcategory.eq.${state.category}`)
      if (_openEnd.value == 'exclude') where_params.push(`evend.neq.null`)
      if (where_params.length == 0) {
         api_url += '?limit=-1'
      } else if (where_params.length == 1) {
         api_url = `${api_url}?where=${where_params[0]}&limit=-1`
      } else {
         api_url = `${api_url}?where=and(${where_params.join(',')})&limit=-1`
      }

      const api_response = await fetchAuthorized(api_url, AUTHORIZATION_TOKEN)
      const response_body = await api_response.json()
      const data = response_body.data[state.provider]?.eventseries

      // parse the request into a data structure that is going to be fed into the reactive-table webcomponent
      const events = []
      for (const eventgroup_index in data) {
         // the "tree" representation for events of the opendatahub API already returns all events
         // of a same serie grouped together; so we fist iterate through all event series...
         const eventgroup = data[eventgroup_index]
         for (const event_index in eventgroup.events) {
            // ...then we loop through the single events inside of each serie

            if (Object.keys(eventgroup.events).length > 1) {
               // if the event serie contains more than one event, it means that there
               // is a history to show; we collect the history in an array (they're already sorted
               // from the newest to the oldest), and the reactive-table webcomponent will deal
               // with it by showing a + button to toggle the visibility of all records except the
               // most recent one
               const event_with_subrows = []
               for (const event_index2 in eventgroup.events) {
                  const event = eventgroup.events[event_index2]
                  event_with_subrows.push(api2table(event))
               }
               events.push(event_with_subrows)
               break // this breaks the loop over the event serie, so the serie is added only once
            } else {
               // if, on the other hand, the event serie contains only one item, we are
               // dealing with a simple event, and we push it straight as an object, so
               // that the reactive-table webcomponent will not show the + button
               const event = eventgroup.events[event_index]
               events.push(api2table(event))
            }
         }
      }

      // feed the reactive-table webcomponent with the parsed data and its schema
      _table._schema = getTableSchema()
      _table.data = JSON.stringify(events)
      _table._data = events
      toggleLoadingState()
   })
})()
