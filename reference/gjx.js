/*
    bz analytics
    graphics web ui / javascript

    SPDX-FileCopyrightText: (C) 2018 IDM Suedtirol - Alto Adige
    SPDX-FileCopyrightText: (C) 2019 NOI Techpark Suedtirol/Alto Adige

    see vendor/ for third pary libraries needed by this code

    author: chris@1006.org

    SPDX-License-Identifier: AGPL-3.0-or-later
*/

'use strict'

;(() => {
  /*
    TOC
    -----------------------------------------------------------------
    SECTION_CONFIG:         initial state and constants
    SECTION_UTIL:           basic utility functions
    SECTION_RANGE:          select time range
    SECTION_TABS:           tabbed panels
    SECTION_TAB_LEGEND:     tabbed panel -> draw legend
    SECTION_TAB_DATASET:    tabbed panel -> add data set
    SECTION_PERMALINK:      stuff related to the permalink feature
    SECTION_HEIGHT:         stuff related to the plot height feature
    SECTION_AUTO_REFRESH:   stuff related to the auto refresh button
    SECTION_LOAD:           load data sets
    SECTION_PLOT:           plot data sets using flot
    SECTION_INIT:           initialization
*/

  // -----------------------------------------------------------------------------
  // --- SECTION_CONFIG: initial state and constants -----------------------------
  // -----------------------------------------------------------------------------

  let state = {
    active_tab: 0,
    height: '400px',
    auto_refresh: false,
    scale: {
      from: 0,
      to: 0,
    },
    graphs: [],
  }

  let statedata = []
  let statedata_status = []

  const CAT_CONFIG_URL = 'layers-config.json'

  let CAT_BACKENDS = {} // leave empty, automatic from config
  let CAT_API_WHERE = {}

  const DEBUG = false // enable debug logging to the console
  const T0 = Number(new Date()) // for debug timing

  const BASE_URL = env.ODH_MOBILITY_API_URI

  // -----------------------------------------------------------------------------
  // --- SECTION_UTIL: basic utility functions -----------------------------------
  // -----------------------------------------------------------------------------

  // just shortcuts
  const qs = document.querySelector.bind(document)
  const qsa = document.querySelectorAll.bind(document)
  const get_selval = (element) => {
    if (element === null || element === undefined) {
      return undefined
    }
    return element.options[element.selectedIndex].value
  }

  // (european) date time string
  const format_time = () => {
    const pad0 = (instr) => {
      let str = String(instr)
      while (str.length < 2) {
        str = '0' + str
      }
      return str
    }
    let d = new Date()
    return (
      pad0(d.getDate()) +
      '/' +
      pad0(d.getMonth() + 1) +
      '/' +
      pad0(d.getFullYear()) +
      ' ' +
      pad0(d.getHours()) +
      ':' +
      pad0(d.getMinutes()) +
      ':' +
      pad0(d.getSeconds())
    )
  }

  // debug log with timing info
  const debug_log = (msg) => {
    if (DEBUG) {
      console.log('gfx ' + String(Number(new Date()) - T0) + ': ' + msg)
    }
  }

  // CSV export
  const get_csv = (ix) => {
    const pad0 = (instr) => {
      let str = String(instr)
      while (str.length < 2) {
        str = '0' + str
      }
      return str
    }
    const date_to_str = (d) => {
      return (
        d.getFullYear() +
        '-' +
        pad0(d.getMonth() + 1) +
        '-' +
        pad0(d.getDate()) +
        ' ' +
        pad0(d.getHours()) +
        ':' +
        pad0(d.getMinutes()) +
        ':' +
        pad0(d.getSeconds())
      )
    }
    if (statedata[ix] === undefined || statedata_status[ix] !== 200) {
      return
    }
    return (
      'time stamp,' +
      (
        state.graphs[ix].station_name +
        ' ' +
        state.graphs[ix].data_type +
        ' ' +
        state.graphs[ix].unit
      ).replace(/,/g, ';') +
      '\n' +
      statedata[ix]
        .map((el) => date_to_str(new Date(el.mvalidtime)) + ',' + el.mvalue)
        .join('\n')
    )
  }

  // we cycle through these colors for the graphs, as they're being added
  const colors = [
    '#2288EE',
    '#22EE88',
    '#8822EE',
    '#88EE22',
    '#EE2288',
    '#EE8822',
    '#88EEEE',
    '#EE88EE',
    '#EEEE88',
    '#228888',
    '#882288',
    '#888822',
  ]
  let color_ix = 0

  // -----------------------------------------------------------------------------
  // --- SECTION_RANGE: select time range ----------------------------------------
  // -----------------------------------------------------------------------------

  const init_range = () => {
    const refresh = () => {
      state.scale.from = Number(jQuery('#gfx_fromdate').datepicker('getDate'))
      state.scale.to = Number(jQuery('#gfx_todate').datepicker('getDate'))
      debug_log(
        'scale.from = ' +
          state.scale.from +
          ' = ' +
          new Date(state.scale.from).toISOString()
      )
      debug_log(
        'scale.to   = ' +
          state.scale.to +
          ' = ' +
          new Date(state.scale.to).toISOString()
      )
      show_days()
      statedata.fill(undefined)
      statedata_status.fill(undefined)
      show_legend()
      load_data()
      show_tab(0)
      refresh_permalink()
    }

    // select date range

    jQuery('#gfx_fromdate').datepicker({
      dateFormat: 'yy-mm-dd',
      onSelect: show_days,
    })
    jQuery('#gfx_fromdate').datepicker('setDate', '-8')

    jQuery('#gfx_todate').datepicker({
      dateFormat: 'yy-mm-dd',
      onSelect: show_days,
    })
    jQuery('#gfx_todate').datepicker('setDate', '-1')

    qs('#gfx_fromdate').addEventListener('change', show_days)
    qs('#gfx_todate').addEventListener('change', show_days)

    qs('#gfx_update_range').addEventListener('click', () => {
      refresh()
    })

    // pick preset values

    qs('#gfx_range_today').addEventListener('click', () => {
      jQuery('#gfx_fromdate').datepicker('setDate', '0')
      jQuery('#gfx_todate').datepicker('setDate', '1')
      refresh()
    })

    qs('#gfx_range_ytoday').addEventListener('click', () => {
      jQuery('#gfx_fromdate').datepicker('setDate', '-1')
      jQuery('#gfx_todate').datepicker('setDate', '1')
      refresh()
    })

    qs('#gfx_range_week').addEventListener('click', () => {
      jQuery('#gfx_fromdate').datepicker('setDate', '-7')
      jQuery('#gfx_todate').datepicker('setDate', '0')
      refresh()
    })
    qs('#gfx_range_month').addEventListener('click', () => {
      jQuery('#gfx_fromdate').datepicker('setDate', '-31')
      jQuery('#gfx_todate').datepicker('setDate', '0')
      refresh()
    })

    show_days()
    refresh()
  }

  const show_days = () => {
    let diff = Math.round(
      (Number(jQuery('#gfx_todate').datepicker('getDate')) -
        Number(jQuery('#gfx_fromdate').datepicker('getDate'))) /
        (24 * 3600 * 1000)
    )
    let invalid = ''
    if (diff < 1 || diff > 366) {
      qs('#gfx_fromdate').style.backgroundColor = '#FFBBAA'
      qs('#gfx_todate').style.backgroundColor = '#FFBBAA'
      qs('#gfx_update_range').style.textDecoration = 'line-through'
      qs('#gfx_update_range').disabled = true
      invalid = ' - <b>invalid</b>, range must be between 1 and 366 days'
    } else {
      qs('#gfx_fromdate').style.backgroundColor = '#FFFFFF'
      qs('#gfx_todate').style.backgroundColor = '#FFFFFF'
      qs('#gfx_update_range').style.textDecoration = ''
      qs('#gfx_update_range').disabled = false
    }
    qs('#gfx_days').innerHTML =
      '&nbsp;<span class="gfx_hi">' + diff + ' days</span>' + invalid + '&nbsp;'
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_TABS: tabbed panels ---------------------------------------------
  // -----------------------------------------------------------------------------

  const show_tab = (ix) => {
    let tabs = Array.from(qsa('.gfx_tab'))
    tabs.forEach((el) => el.classList.remove('gfx_tab_active'))
    tabs[ix].classList.add('gfx_tab_active')

    let panels = Array.from(qsa('#gfx_tabbed_panels > div'))
    panels.forEach((el) => (el.style.display = 'none'))
    panels[ix].style.display = 'block'

    state.active_tab = ix
  }

  const init_tabs = () => {
    let tab_links = Array.from(qsa('.gfx_tab > a'))
    tab_links.forEach((el, ix) => {
      el.addEventListener('click', (ev) => {
        show_tab(ix)
        ev.preventDefault()
      })
    })

    show_tab(state.active_tab)
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_TAB_LEGEND: tabbed panel -> draw legend -------------------------
  // -----------------------------------------------------------------------------

  const show_legend = () => {
    // build the legend table

    let html = ''
    html += '<tr>'
    html += '<td>COLOR</td>'
    html += '<td>CATEGORY</td>'
    html += '<td>STATION</td>'
    html += '<td>DATA TYPE</td>'
    html += '<td>PERIOD</td>'
    html += '<td>DATA POINTS</td>'
    html += '<td>Y-AXIS</td>'
    html += '<td>CSV D/L</td>'
    html += '<td>REMOVE</td>'
    html += '</tr>'
    if (state.graphs.length === 0) {
      html += '<tr><td colspan="9">no dataset selected</td></tr>'
    }
    state.graphs.forEach((graph, ix) => {
      html += '<tr>'
      html +=
        '<td style="text-align: center"><div style="display: inline-block; width: 20px; height: 9px; background-color: ' +
        colors[graph.color] +
        '"></div></td>'
      html += '<td>' + graph.category + '</td>'
      html += '<td>' + graph.station_name + ' (' + graph.station + ')</td>'
      html += '<td>' + graph.data_type + ' ' + graph.unit + '</td>'
      html +=
        '<td>' +
        (graph.period === '*' ? '(smallest available)' : graph.period + 's') +
        '</td>'
      if (statedata[ix] === undefined) {
        html += '<td class="gfx_notice">loading&hellip;</td>'
      } else if (statedata[ix].length === 0 && statedata_status[ix] !== 200) {
        html +=
          '<td class="gfx_status_error">download failed (status ' +
          statedata_status[ix] +
          ')</td>'
      } else if (statedata[ix].length === 0 && statedata_status[ix] === 200) {
        html +=
          '<td class="gfx_status_error">no data available or missing authentication (status ' +
          statedata_status[ix] +
          ')</td>'
      } else {
        html += '<td>' + statedata[ix].length + '</td>'
      }
      if (graph.yaxis === 1) {
        html += `<td><button class="gfx_sel" disabled>&lt;</button>&nbsp;<button class="gfx_nsel" id="gfx_ytoggle${ix}">&gt;</button></td>`
      } else {
        html += `<td><button class="gfx_nsel" id="gfx_ytoggle${ix}">&lt;</button>&nbsp;<button class="gfx_sel" disabled>&gt;</button></td>`
      }
      html += `<td><button id="gfx_prepcsv${ix}">prepare CSV</button></td>`
      html += `<td><input style="width: 10px;" type="image" id="gfx_remove${ix}" src="img/ic_remove.svg" alt="remove"></td>`
      html += '</tr>'
    })
    qs('#gfx_legend > table').innerHTML = html

    // add listeners for buttons: left/right yaxis toggle, prepare CSV and remove graph

    state.graphs.forEach((graph, ix) => {
      qs('#gfx_ytoggle' + ix).addEventListener('click', () => {
        if (state.graphs[ix].yaxis === 1) {
          state.graphs[ix].yaxis = 2
        } else {
          state.graphs[ix].yaxis = 1
        }
        show_legend()
        plot()
        refresh_permalink()
      })

      qs('#gfx_prepcsv' + ix).addEventListener('click', () => {
        qs('#gfx_prepcsv' + ix).parentElement.innerHTML =
          '<a href="data:text/csv,' +
          encodeURIComponent(get_csv(ix)) +
          '" download>download.csv</a>'
      })

      qs('#gfx_remove' + ix).addEventListener('click', () => {
        state.graphs.splice(ix, 1)
        statedata.splice(ix, 1)
        statedata_status.splice(ix, 1)
        show_legend()
        plot()
        refresh_permalink()
      })
    })
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_TAB_DATASET: tabbed panel -> add data set -----------------------
  // -----------------------------------------------------------------------------

  const init_tab_dataset = () => {
    qs('#gfx_selstation').style.display = 'none'
    qs('#gfx_seldataset').style.display = 'none'
    qs('#gfx_selperiod').style.display = 'none'
    qs('#gfx_addset').style.display = 'none'

    // initialize category select box: create global category -> backend URL hash and add event listener

    jQuery.getJSON(CAT_CONFIG_URL, (data) => {
      let opt = `<option value="">Select category...</option>`
      data.forEach((layers_group) => {
        layers_group.layers
          .filter((cat) => cat.format === 'integreen')
          .forEach((cat) => {
            opt += `<option value="${cat.id}">&rarr; ${cat.id}</option>\n`
            CAT_BACKENDS[cat.id] =
              BASE_URL + '/flat/' + encodeURIComponent(cat.stationType)
            CAT_API_WHERE[cat.id] = cat.apiWhere
          })
      })
      qs('#gfx_selcategory').innerHTML = opt
    })

    qs('#gfx_selcategory').addEventListener('change', (ev) => {
      let cat = get_selval(ev.target)
      debug_log('event: #gfx_selcategory change fired with cat = ' + cat)

      qs('#gfx_selstation').style.display = 'none'
      qs('#gfx_seldataset').style.display = 'none'
      qs('#gfx_selperiod').style.display = 'none'
      qs('#gfx_addset').style.display = 'none'

      switch (cat) {
        case '':
          break

        default:
          jQuery.getJSON(
            CAT_BACKENDS[cat] +
              '?limit=-1&distinct=true&where=' +
              (CAT_API_WHERE[cat]
                ? encodeURIComponent(CAT_API_WHERE[cat])
                : ''),
            (data) => {
              data = data.data
              debug_log('got station details -> length = ' + data.length)
              let opt = `<option value="">Select station...</option>`
              opt += data
                .sort((a, b) => (a.sname > b.sname ? 1 : -1))
                .map(
                  (station) =>
                    `<option value="${station.scode};${station.sname};">&rarr; ${station.sname}</option>`
                )
                .join('\n')
              let next = qs('#gfx_selstation')
              next.innerHTML = opt
              next.style.display = 'inline-block'
            }
          )
          break
      }
    })

    // initialize station select box: add event listener

    qs('#gfx_selstation').addEventListener('change', (ev) => {
      let station = get_selval(ev.target)
      station = station.split(';')[0]
      let cat = get_selval(qs('#gfx_selcategory'))

      debug_log('event: #gfx_selstation change fired with station = ' + station)

      qs('#gfx_seldataset').style.display = 'none'
      qs('#gfx_selperiod').style.display = 'none'
      qs('#gfx_addset').style.display = 'none'

      switch (station) {
        case '':
          break

        default:
          jQuery.getJSON(
            CAT_BACKENDS[cat] +
              '/*/?limit=-1&distinct=true&where=scode.eq.%22' +
              station +
              '%22',
            (data) => {
              data = data.data
              debug_log('got data types -> length = ' + data.length)
              let opt = `<option value="">Select dataset...</option>`
              opt += data
                .sort((a, b) => (a.tname > b.tname ? 1 : -1))
                .map((type) => {
                  let units = ''
                  if (type.tunit !== undefined && type.tunit !== '') {
                    units = `${type.tunit}`.trim()
                    if (units.charAt(0) !== '[') {
                      units = `[${units}]`
                    }
                  }
                  return `<option value="${type.tname};${units}">&rarr; ${type.tname} ${units}</option>`
                })
                .join('\n')
              let next = qs('#gfx_seldataset')
              next.innerHTML = opt
              next.style.display = 'inline-block'
            }
          )

          break
      }
    })
    qs('#gfx_seldataset').addEventListener('change', (ev) => {
      let cat = get_selval(qs('#gfx_selcategory'))
      const headers = {
        'Content-Type': 'application/json',
      }

      if (
        AUTHORIZATION_TOKEN !== undefined &&
        AUTHORIZATION_TOKEN !== null &&
        AUTHORIZATION_TOKEN != ''
      ) {
        headers['Authorization'] = AUTHORIZATION_TOKEN
      }
      let station = get_selval(qs('#gfx_selstation')).split(';')[0]
      let type = get_selval(ev.target).split(';')[0]
      fetch(
        CAT_BACKENDS[cat] +
          '/' +
          type +
          '/latest?limit=-1&distinct=true&where=scode.eq.%22' +
          station +
          '%22&select=mperiod',
        { headers: headers }
      )
        .then((response) => response.json())
        .then((data) => {
          data = data.data
          debug_log('got periods -> length = ' + data.length)
          let opt = `<option value="">Select dataset...</option>`
          opt += data
            .sort((a, b) => (a.mperiod > b.mperiod ? 1 : -1))
            .map((period) => {
              let periods = ''
              if (period.mperiod !== undefined && period.mperiod !== '') {
                periods = `${period.mperiod}`.trim()
                if (periods.charAt(0) !== '[') {
                  periods = `[${periods}]`
                }
              }
              return `<option value="${period.mperiod}">&rarr; ${period.mperiod}</option>`
            })
            .join('\n')
          let next = qs('#gfx_selperiod')
          next.innerHTML = opt
          next.style.display = 'inline-block'
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    })

    // initialize dataset select box: add event listener

    /*qs("#gfx_seldatasets").addEventListener("change", (ev) => {

        let dataset = get_selval(ev.target);
        debug_log("event: #gfx_seldataset change fired with dataset = " + dataset);

        qs("#gfx_selperiod").style.display  = "none";
        qs("#gfx_addset").style.display     = "none";

        switch (dataset) {

            case "":

                break;

            default:
                qs("#gfx_selperiod").style.display = "inline-block";
                qs("#gfx_addset").style.display = "inline-block";
                break;

        }

    });
    */
    // initialize period select box: fill static values and add event listener

    /*(() => {
      let opt = `<option value="*">&rarr; preferred sample period is the smallest available</option>`;
      [1, 300, 600, 900, 1200, 1800, 3600, 5400, 7200, 9000, 10800, 12600, 14400, 21600, 86400].forEach( p => {
            opt += `<option value="${p}">&rarr; preferred sample period = ${p}s</option>`;
      });
      qs("#gfx_selperiod").innerHTML = opt;
    })();*/

    qs('#gfx_selperiod').addEventListener('change', (ev) => {
      let period = get_selval(ev.target)
      qs('#gfx_addset').style.display = 'inline-block'
      debug_log('event: #gfx_selperiod change fired with period = ' + period)
    })

    // initialize add button: add event listener

    qs('#gfx_addset').addEventListener('click', (ev) => {
      let category = get_selval(qs('#gfx_selcategory'))
      let station = get_selval(qs('#gfx_selstation')).split(';')[0]
      let station_name = get_selval(qs('#gfx_selstation')).split(';')[1]
      let data_type = get_selval(qs('#gfx_seldataset')).split(';')[0]
      let unit = get_selval(qs('#gfx_seldataset')).split(';')[1]
      let period = get_selval(qs('#gfx_selperiod'))

      let obj = {
        category: category,
        station: station,
        station_name: station_name,
        data_type: data_type,
        unit: unit,
        period: period,
        yaxis: 1,
        color: color_ix % colors.length,
      }
      color_ix++

      let found = false

      state.graphs.forEach((graph) => {
        if (
          graph.category === obj.category &&
          graph.station === obj.station &&
          graph.data_type === obj.data_type &&
          graph.period === obj.period
        ) {
          found = true
        }
      })

      if (found) {
        debug_log(
          'nothing added, graph was already present: ' + JSON.stringify(obj)
        )
      } else {
        state.graphs.push(obj)
        statedata.push(undefined)
        statedata_status.push(undefined)
        debug_log('added graph: ' + JSON.stringify(obj))
        show_legend()
        load_data()
      }

      qs('#gfx_selcategory').value = ''
      qs('#gfx_selstation').style.display = 'none'
      qs('#gfx_seldataset').style.display = 'none'
      qs('#gfx_selperiod').style.display = 'none'
      qs('#gfx_addset').style.display = 'none'
      show_tab(0)
    })
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_PERMALINK: stuff related to the permalink feature ---------------
  // -----------------------------------------------------------------------------

  const refresh_permalink = () => {
    qs('#gfx_perma').href =
      location.origin +
      location.pathname +
      '#' +
      encodeURI(JSON.stringify(state))
  }

  const init_state_from_permalink = () => {
    // get the location hash (if any)
    // and initialize state from it

    let hash = location.hash

    if (hash !== undefined && hash !== '') {
      hash = hash.substr(1)
      try {
        state = JSON.parse(decodeURI(hash))
        statedata = []
        statedata_status = []
        state.graphs.forEach(() => {
          statedata.push(undefined)
          statedata_status.push(undefined)
        })

        color_ix = state.graphs.length + 1
      } catch (e) {
        debug_log('permalink: cannot parse state from location.hash - ignored')
      }
    }
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_HEIGHT: stuff related to the plot height feature ----------------
  // -----------------------------------------------------------------------------

  const init_plot_height = () => {
    qs('#gfx_plot').style.height = state.height

    Array.from(qsa('#gfx_hpx > option')).forEach((node) => {
      if (node.value === state.height) {
        node.selected = true
      }
    })

    qs('#gfx_hpx').addEventListener('change', () => {
      let v = qs('#gfx_hpx').value
      qs('#gfx_plot').style.height = v
      state.height = v
      plot()
      refresh_permalink()
    })
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_AUTO_REFRESH: stuff related to the auto refresh button ----------
  // -----------------------------------------------------------------------------

  const LIVE_PERIOD = 300 * 1000

  const init_auto_refresh = () => {
    qs('#gfx_live').addEventListener('click', () => {
      state.auto_refresh = !state.auto_refresh
      show_auto_refresh_button()
    })
    show_auto_refresh_button()
    setTimeout(auto_refresh, LIVE_PERIOD)
  }

  const show_auto_refresh_button = () => {
    if (state.auto_refresh) {
      qs('#gfx_live').innerHTML = 'auto refresh on'
      qs('#gfx_live').classList.add('gfx_sel')
      qs('#gfx_live').classList.remove('gfx_nsel')
    } else {
      qs('#gfx_live').innerHTML = 'auto refresh off'
      qs('#gfx_live').classList.add('gfx_nsel')
      qs('#gfx_live').classList.remove('gfx_sel')
    }
  }

  const auto_refresh = () => {
    // auto_refresh only if auto_refresh is enabled and no download is being done right now
    let todo_len = statedata.filter((el) => el === undefined).length
    if (state.auto_refresh && todo_len === 0) {
      debug_log('auto_refresh')
      statedata.fill(undefined)
      statedata_status.fill(undefined)
      show_legend()
      load_data()
    }
    setTimeout(auto_refresh, LIVE_PERIOD)
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_LOAD: load data sets --------------------------------------------
  // -----------------------------------------------------------------------------

  const load_data = () => {
    let len = state.graphs.length
    let todo_len = statedata.filter((el) => el === undefined).length

    debug_log(
      'load_data() -> need to fetch data for ' +
        todo_len +
        ' out of ' +
        len +
        ' graphs'
    )

    state.graphs.forEach((graph, ix) => {
      if (statedata[ix] !== undefined) {
        return
      }

      let url = ''

      switch (graph.category) {
        default:
          url += CAT_BACKENDS[graph.category]
          url += '/' + graph.data_type
          url += '/' + new Date(state.scale.from).toISOString()
          url += '/' + new Date(state.scale.to).toISOString()
          url += '?limit=-1'
          url += '&distinct=true'
          url += '&select=mvalue,mvalidtime,mperiod'
          url +=
            '&where=scode.eq.%22' +
            graph.station +
            '%22,mperiod.eq.' +
            graph.period +
            ',sactive.eq.true'

          let headers = {}
          if (
            AUTHORIZATION_TOKEN !== undefined &&
            AUTHORIZATION_TOKEN !== null &&
            AUTHORIZATION_TOKEN != ''
          ) {
            headers['Authorization'] = AUTHORIZATION_TOKEN
          }

          // jQuery note: jQuery.getJSON() does not allow headers, so I use the equivalent $.ajax() here
          $.ajax({
            dataType: 'json',
            headers: headers,
            url: url,
          })
            .done((data) => {
              // download succeeded

              // filter matching periods
              debug_log('filter period for graphs[' + ix + ']:')
              let period_hash = {}
              data.data.forEach((d) => {
                if (period_hash[d.mperiod] == undefined) {
                  period_hash[d.mperiod] = 1
                }
              })
              let period_list = Object.keys(period_hash).sort((a, b) => a - b)
              debug_log(
                ' +- preferred or set from previous run: ' +
                  (graph.period === '*' ? '(smallest)' : graph.period)
              )
              debug_log(
                ' +- effectively available:              ' +
                  period_list.join(',')
              )

              let filtered_data
              if (period_list.length === 0) {
                filtered_data = data.data
                debug_log(' +- no periods found - not filtering')
                debug_log(
                  ' +- the set period for this graph is the preferred period'
                )
              } else if (period_list.length === 1) {
                filtered_data = data.data
                state.graphs[ix].period = period_list[0]
                debug_log(
                  ' +- data only has one period (' + period_list[0] + ')'
                )
                debug_log(' +- this is the new set period for this graph')
              } else {
                let closest_period = period_list[0]
                if (graph.period !== '*') {
                  period_list.forEach((p) => {
                    if (
                      Math.abs(p - graph.period) <
                      Math.abs(closest_period - graph.period)
                    ) {
                      closest_period = p
                    }
                  })
                }
                filtered_data = data.data.filter(
                  (d) => Number(d.mperiod) === Number(closest_period)
                )
                state.graphs[ix].period = closest_period
                debug_log(
                  ' +- closest match: ' +
                    closest_period +
                    ', filtering reduced data points from ' +
                    data.data.length +
                    ' to ' +
                    filtered_data.length
                )
                debug_log(' +- this is the new set period for this graph')
              }
              statedata[ix] = filtered_data
              statedata_status[ix] = 200
              show_legend()
              if (statedata.filter((el) => el === undefined).length === 0) {
                debug_log('load_data() -> all downloads ready')
                plot()
                refresh_permalink()
              }
            })
            .fail((data) => {
              // download failed
              statedata[ix] = []
              statedata_status[ix] = data.status
              qs('#gfx_error_log').textContent =
                format_time() + ' -> ' + data.responseText
              show_legend()
              if (statedata.filter((el) => el === undefined).length === 0) {
                debug_log('load_data() -> all downloads ready')
                plot()
                refresh_permalink()
              }
            })

          break
      }
    })
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_PLOT: plot data sets using flot ---------------------------------
  // -----------------------------------------------------------------------------

  let plot = () => {
    jQuery('#gfx_data_cursor_pane').remove()
    jQuery('#gfx_data_cursor_mark').remove()

    if (state.graphs.length === 0) {
      qs('#gfx_wait').style.display = 'block'
      qs('#gfx_flot').style.display = 'none'
      return
    }

    qs('#gfx_wait').style.display = 'none'
    qs('#gfx_flot').style.display = 'block'

    // prepare data for flot

    let flot_data = []
    statedata.forEach((data, ix) => {
      if (data !== undefined) {
        flot_data.push({
          data: data.map((el) => [
            Number(new Date(el.mvalidtime)),
            Number(el.mvalue),
          ]),
          label:
            state.graphs[ix].station_name +
            ' - ' +
            state.graphs[ix].data_type +
            ' ' +
            state.graphs[ix].unit +
            ' (' +
            state.graphs[ix].period +
            's)',
          color: colors[state.graphs[ix].color],
          yaxis: state.graphs[ix].yaxis,
        })
      }
    })

    // prepare left and right y axis labels

    let left_unit = ''
    let right_unit = ''

    state.graphs.forEach((graph) => {
      if (graph.yaxis === 1) {
        if (left_unit === '' || left_unit === graph.unit) {
          left_unit = graph.unit
        } else {
          left_unit = 'various units'
        }
      } else {
        if (right_unit === '' || right_unit === graph.unit) {
          right_unit = graph.unit
        } else {
          right_unit = 'various units'
        }
      }
    })

    // plot it

    jQuery('#gfx_flot').plot(flot_data, {
      lines: { show: true },
      points: { show: true, radius: 3 },
      legend: {
        show: true,
        noColumns: 1,
        position: 'ne',
      },
      shadowSize: 0,
      xaxes: [
        {
          position: 'bottom',
          mode: 'time',
          timezone: 'browser',
          timeformat: '%Y-%m-%d %H:%M:%S',
          minTickSize: [1, 'hour'],
        },
      ],
      yaxes: [
        { axisLabel: left_unit, position: 'left' },
        { axisLabel: right_unit, position: 'right' },
      ],
      grid: { hoverable: true, clickable: true },
    })
    jQuery('#gfx_flot').bind('plotclick', (e, pos, ele) => {
      jQuery('#gfx_data_cursor_pane').remove()
      jQuery('#gfx_data_cursor_mark').remove()
      if (ele) {
        jQuery('body').append('<div id="gfx_data_cursor_pane"></div>')
        qs('#gfx_data_cursor_pane').innerHTML =
          ele.series.label +
          '<br>' +
          new Date(ele.datapoint[0]) +
          '<br>' +
          'value: ' +
          ele.datapoint[1]
        let pane_width = parseInt(
          getComputedStyle(qs('#gfx_data_cursor_pane')).width
        )
        let body_width = parseInt(getComputedStyle(qs('body')).width)
        let x = Math.round(ele.pageX)
        if (x > 0.5 * body_width) {
          x -= pane_width + 16
        }
        qs('#gfx_data_cursor_pane').style.left = Math.round(x) + 'px'
        qs('#gfx_data_cursor_pane').style.top =
          Math.round(ele.pageY + 10) + 'px'

        jQuery('body').append('<div id="gfx_data_cursor_mark"></div>')
        qs('#gfx_data_cursor_mark').style.left =
          Math.round(ele.pageX) - 4 + 'px'
        qs('#gfx_data_cursor_mark').style.top = Math.round(ele.pageY) - 4 + 'px'
      }
    })
  }

  // -----------------------------------------------------------------------------
  // --- SECTION_INIT: initialization --------------------------------------------
  // -----------------------------------------------------------------------------

  debug_log('gfx.js start')

  init_tabs()
  init_range()
  init_tab_dataset()
  init_state_from_permalink()
  init_plot_height()
  init_auto_refresh()
  show_legend()

  // the initial call to load_data() must wait for the category backend URLs
  // (loaded by init_tab_dataset()) to become available and for any ongoing
  // authentication to terminate (AUTHORIZATION_TOKEN === "" while authentication
  // is running and becomes either null or a string when ready)

  let conditionally_load_data = () => {
    let ready = true
    if (Object.keys(CAT_BACKENDS).length === 0) {
      ready = false
    }
    if (
      AUTHORIZATION_TOKEN !== undefined &&
      AUTHORIZATION_TOKEN !== null &&
      AUTHORIZATION_TOKEN === ''
    ) {
      ready = false
    }
    if (!ready) {
      setTimeout(conditionally_load_data, 100)
      return
    }
    load_data()
  }

  conditionally_load_data()

  // call plot() when the chart is resized
  window.addEventListener('resize', plot)
})()
