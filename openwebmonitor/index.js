const jsonfile = require('jsonfile')
const electron = require('electron');
const path = require('path');
const locale = require('./locale')
const utils = require('./utils')
const moment = require('moment')
const { remote } = require('electron')
const { Menu, MenuItem } = remote
const Store = require('electron-store')
const store = new Store()
const htmlencode = require('htmlencode');

document.addEventListener('DOMContentLoaded', function () {
  console.log("init window")
  locale.init()


  $('#help_space>iframe').attr('src', `http://openwebmonitor.netqon.com/embedded.html?t=${Date.now()}`)

  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  electron.ipcRenderer.send('get-all-targets')

  let content_view_config = store.get('content_view_config', { added: true, deleted: true, stayed: false })

  $('#show_added').attr('select', content_view_config.added ? 'true' : 'false')
  $('#show_deleted').attr('select', content_view_config.deleted ? 'true' : 'false')
  $('#show_stayed').attr('select', content_view_config.stayed ? 'true' : 'false')

  $('#select_text_mode').val(store.get('text-mode', 'diff'))
  $('#select_text_mode').change(on_text_mode_change)

  $('.text_mode_btn').click(function (e) {
    let btn = $(e.target)
    if (btn.attr('select') == 'true') {
      btn.attr('select', 'false')
    } else {
      btn.attr('select', 'true')
    }

    text_mode_deploy()

    store.set('content_view_config', {
      added: $('#show_added').attr('select') == 'true',
      deleted: $('#show_deleted').attr('select') == 'true',
      stayed: $('#show_stayed').attr('select') == 'true'
    })
  })

  $('#btn_add_target').click(on_click_new_target)

  $('#btn_add_new_target').click(on_click_new_target)
  $('#btn_add_target_confirm').click(on_click_btn_add_new_target_confirm)
  $('#btn_remove_target_confirm').click(on_click_remove_target_confirm)
  $('#btn_delete_records_confirm').click(on_click_delete_records_confirm)

  $('#btn_open_snapshot').click(on_click_open_snapshot)
  $('#btn_open_origin').click(on_click_open_origin)

  $('#records_space').scroll(function (e) {
    // console.log(e.target.scrollTop, $(window).height(), e.target.clientHeight, $('#record_list').height())
    if (g_selected_target_nomore_record == false && g_record_more_loading == false && e.target.scrollTop + $(window).height() >= $('#record_list').height() - 50) {
      g_record_more_loading = true
      console.log('get more record')
      electron.ipcRenderer.send('get-some-records', { target_id: g_selected_target_element.web_target.id, offset: $('.record').length - 1, filter: $('#select_records_filter').val() }) //offset remove template
    }
  })

  $('#fill_target_space').contextmenu(function (e) {
    e.preventDefault()
    const menu = new Menu()
    menu.append(new MenuItem({ label: 'New Target', click: on_click_new_target, accelerator: 'CmdOrCtrl+N' }))
    menu.popup({ window: remote.getCurrentWindow() })
  })

  setInterval(update_moment_time, 30 * 1000)

  $('#select_records_filter').val(store.get('records-filter', 'all'))
  $('#select_records_filter').change(on_records_filter_change)

  $('#btn_open_settings').click(function () {
    electron.ipcRenderer.send('open-settings')
  })


  $('#btn_toogle_short_line_filter').attr('pressed', store.get('short-line-filter', 'false'))
  $('#btn_toogle_short_line_filter').click(on_click_short_line_filter)
})

/* save size of window */
window.onbeforeunload = function () {
  console.log("try save before close")
  store.set('width', window.innerWidth)
  store.set('height', window.innerHeight + (utils.is_win() ? 55:0))
}

/* targets */
let g_is_target_new = true
let g_under_config_target_element = null
let g_target_map = {} // id=>element -> element.web_target
let g_selected_target_nomore_record = false //是否当前的target已经没有可以下滑加载的更多的record了
let g_record_more_loading = false //防止大量的record加载
function add_new_target_element(target, root = false) {
  let new_element = $('#target_template').clone()
  new_element.removeAttr('id')
  new_element.find('.target-name').text(target.name)
  new_element.find('.target-address').text(target.address)
  new_element.find('.target-indication').attr('indication', target.read == 0 ? 'true' : 'false')
  new_element.find('.target-paused').attr('paused', target.state == utils.TARGET_STATE.NORMAL ? "false" : "true")
  new_element.find('.target-muted').attr('muted', target.muted == 0 || root ? "false" : "true")

  let icon = target.icon
  if (icon.length == 0) {
    icon = "images/default-target-icon.png"
  }
  new_element.find('.target-image').attr('src', icon)

  new_element.prependTo('#target_list')
  new_element.web_target = target
  g_target_map[target.id] = new_element

  new_element.click(on_select_target.bind(null, target.id))

  new_element.contextmenu(function (e) {
    e.preventDefault()
    const menu = new Menu()
    if (!root) {
      menu.append(new MenuItem({ label: 'Edit', click: on_click_config_target.bind(null, new_element) }))
      menu.append(new MenuItem({ label: new_element.web_target.state == utils.TARGET_STATE.NORMAL ? 'Pause' : 'Resume', click: on_click_toggle_pause_target.bind(null, new_element) }))
      menu.append(new MenuItem({ label: new_element.web_target.muted == 0 ? 'Mute' : 'Unmute', click: on_click_toggle_mute_target.bind(null, new_element) }))

      menu.append(new MenuItem({ label: 'Mark as read', click: on_click_mark_all_read.bind(null, new_element) }))
      menu.append(new MenuItem({ label: 'Open in browser', click: on_click_open_in_browser.bind(null, new_element) }))
      menu.append(new MenuItem({ label: 'Check immediately', click: on_click_check_immediately.bind(null, new_element) }))

      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({ label: 'Clear', click: on_click_delete_records.bind(null, new_element) }))
      menu.append(new MenuItem({ label: 'Delete', click: on_click_remove_target.bind(null, new_element) }))

      menu.append(new MenuItem({ type: 'separator' }))
    }
    menu.append(new MenuItem({ label: 'New target', click: on_click_new_target }))
    menu.popup({ window: remote.getCurrentWindow() })
  })

}

function on_click_open_in_browser(target_element) {
  electron.remote.shell.openExternal(target_element.web_target.address)
}

function on_click_check_immediately(target_element) {
  electron.ipcRenderer.send('check-immediately', target_element.web_target.id)
}

let g_under_removing_target_element = null
function on_click_remove_target(target_element) {
  g_under_removing_target_element = target_element
  $('#remove_target_dialog').find('#remove_target_name').text(target_element.web_target.name)
  $('#remove_target_dialog').modal('show')
}

let g_under_delete_records_element = null
function on_click_delete_records(target_element) {
  g_under_delete_records_element = target_element
  $('#delete_records_dialog').find('#delete_records_target_name').text(target_element.web_target.name)
  $('#delete_records_dialog').modal('show')
}

function on_click_mark_all_read(target_element) {
  if (g_selected_target_element == target_element) {
    $('.record').find('.record-indication').attr('type', '1')
  }

  target_element.find('.target-indication').attr('indication', 'false')

  electron.ipcRenderer.send('mark-all-read', target_element.web_target.id)
}

function on_click_remove_target_confirm() {
  $('#remove_target_dialog').modal('hide')

  if (g_under_removing_target_element == g_selected_target_element) {
    unselect_target()
  }
  g_under_removing_target_element.remove()
  electron.ipcRenderer.send('remove-target', g_under_removing_target_element.web_target.id)
  g_under_config_target_element = null
}

function on_click_delete_records_confirm() {
  $('#delete_records_dialog').modal('hide')
  $('#record_list').empty()
  electron.ipcRenderer.send('delete-records', g_under_delete_records_element.web_target.id)
  g_under_delete_records_element = null
}

function on_click_toggle_pause_target(target_element) {
  console.log('click pause/resume target')
  target_element.web_target.state = target_element.web_target.state == utils.TARGET_STATE.NORMAL ? utils.TARGET_STATE.PAUSED : utils.TARGET_STATE.NORMAL
  target_element.find('.target-paused').attr('paused', target_element.web_target.state == utils.TARGET_STATE.NORMAL ? "false" : "true")
  electron.ipcRenderer.send('set-target-state', { target_id: target_element.web_target.id, state: target_element.web_target.state })
}

function on_click_toggle_mute_target(target_element) {
  console.log('click mute/unmute target')
  target_element.web_target.muted = target_element.web_target.muted == 0 ? 1 : 0
  target_element.find('.target-muted').attr('muted', target_element.web_target.muted == 0 ? "false" : "true")
  electron.ipcRenderer.send('set-target-muted', { target_id: target_element.web_target.id, state: target_element.web_target.muted })
}

electron.ipcRenderer.on('open-new-target', function (e, data) {
  on_click_new_target()
})


electron.ipcRenderer.on('new-target', function (e, target) {
  console.log('new target', target)
  add_new_target_element(target)
})

electron.ipcRenderer.on('all-targets', function (e, data) {
  console.log('all targets', data)
  data.targets.forEach((target, index) => {
    add_new_target_element(target)
  })
  let root_target = {
    id: 'root',
    address: 'http://show.all.targets',
    name: 'Root',
    state: 0,
    topindex: 0,
    icon: 'images/all.png'
  }
  add_new_target_element(root_target, true)
})

electron.ipcRenderer.on('new-target-icon', function (e, data) {
  console.log('new-target-icon', data)
  g_target_map[data.target_id].find('.target-image').attr('src', data.icon)
})

let g_selected_target_element = null
function on_select_target(target_id) {

  $('#help_space').hide()
  $('#records_space').show()
  $('#content_space').show()

  g_selected_target_nomore_record = false
  g_record_more_loading = false
  let element = g_target_map[target_id]
  let target = element.web_target
  console.log('click select element', target.name, target.id)

  if (g_selected_target_element == element) {
    //same one, pass
    return
  }

  //unselect current
  if (g_selected_target_element) {
    g_selected_target_element.attr('select', 'false')
  }

  //select new
  element.attr('select', 'true')
  g_selected_target_element = element

  //clear records ui
  $('#record_list').empty()
  g_record_map = {}

  //get new target's records
  electron.ipcRenderer.send('get-some-records', { target_id: target.id, offset: $('.record').length - 1, filter: $('#select_records_filter').val() }) //offset remove template

  //clear content
  $('#html_diff').empty()

  element.find('.target-indication').attr('indication', 'false')
}

function unselect_target() {
  g_selected_record_element = null
  g_selected_target_element = null
  $('#record_list').empty()
  $('#html_diff').empty()
}

function update_moment_time() {
  for (let key in g_record_map) {
    let record_element = g_record_map[key]
    record_element.find('.record-time').text(record_element.web_time.fromNow())
  }
}

function on_click_new_target() {
  g_is_target_new = true
  $('#target_dialog_title').text('New Target')
  $('#new_target_name').val("")
  $('#new_target_address').val("")
  $('#new_target_min_change').val(50)
  $('#new_target_min_text_line').val(30) //default to 5

  $("input[name=target_way]").val([utils.TARGET_WAY.LINK])

  $('#added_only').prop('checked', false)
  $('#use_proxy').prop('checked', false)
  $('#new_target_cookie').val('')

  $('#new_target_dialog').modal('show')
}

function on_click_config_target(target_element) {
  g_is_target_new = false
  g_under_config_target_element = target_element
  $('#target_dialog_title').text('Edit Target')

  $('#new_target_name').val(target_element.web_target.name)
  $('#new_target_address').val(target_element.web_target.address)
  $('#new_target_min_change').val(target_element.web_target.min_change)
  $('#new_target_min_text_line').val(target_element.web_target.min_text_line)

  $("input[name=target_way]").val([target_element.web_target.way])

  $('#added_only').prop('checked', target_element.web_target.added_only == 0 ? false : true)
  $('#use_proxy').prop('checked', target_element.web_target.use_proxy == 0 ? false : true)

  $('#new_target_cookie').val(target_element.web_target.cookie)

  $('#new_target_dialog').modal('show')
}

function on_click_btn_add_new_target_confirm() {
  let name = $('#new_target_name').val()
  let address = $('#new_target_address').val()
  let min_change = parseInt($('#new_target_min_change').val())
  let min_text_line = parseInt($('#new_target_min_text_line').val())
  let way_value = parseInt($('input[name=target_way]:checked', '#target_form').val())
  let added_only = $('#added_only').prop('checked') ? 1 : 0
  let use_proxy = $('#use_proxy').prop('checked') ? 1 : 0

  let cookie = $('#new_target_cookie').val()

  console.log('add new target', name, address, min_change, min_text_line, way_value)

  if (name.length == 0) {
    toastr["error"]("Name is required")
    return
  }

  if (address.length == 0) {
    toastr["error"]("Address is required")
    return
  }

  if (address.slice(0, 4) != "http") {
    toastr["error"]("Address should be an HTTP or HTTPs url")
    return
  }

  $('#new_target_dialog').modal('hide')
  if (g_is_target_new) {
    electron.ipcRenderer.send('new-target', {
      name: name,
      address: address,
      min_change: min_change,
      min_text_line: min_text_line,
      way: way_value,
      added_only: added_only,
      cookie: cookie,
      use_proxy: use_proxy
    })
  } else {
    electron.ipcRenderer.send('update-target', {
      id: g_under_config_target_element.web_target.id,
      name: name,
      address: address,
      min_change: min_change,
      min_text_line: min_text_line,
      way: way_value,
      added_only: added_only,
      cookie: cookie,
      use_proxy: use_proxy
    })

    g_under_config_target_element.find('.target-name').text(name)
    g_under_config_target_element.find('.target-address').text(address)
    g_under_config_target_element.web_target.name = name
    g_under_config_target_element.web_target.address = address
    g_under_config_target_element.web_target.min_change = min_change
    g_under_config_target_element.web_target.min_text_line = min_text_line
    g_under_config_target_element.web_target.way = way_value
    g_under_config_target_element.web_target.added_only = added_only
    g_under_config_target_element.web_target.cookie = cookie
    g_under_config_target_element.web_target.use_proxy = use_proxy
  }

}

/* records */
electron.ipcRenderer.on('some-records', function (e, records) {
  console.log('all records', records)
  records.forEach(function (record) {
    add_new_record_element(record)
  })
  g_record_more_loading = false
  if (records.length == 0) {
    g_selected_target_nomore_record = true
    console.log('no more records')
  }
})

let g_record_map = {}
function add_new_record_element(record, at_top = false) {

  let root = g_selected_target_element.web_target.id == 'root'
  let new_element = $('#record_template').clone()
  new_element.removeAttr('id')
  new_element.find('.record-status').attr('type', `${record.state}`)
  new_element.find('.record-indication').attr('type', `${record.read}`)
  let status_text = record.status
  if (root) {
    let tg = g_target_map[record.target_id].web_target
    status_text = `<img src="${tg.icon}" class="root-record-icon"/>` + tg.name + ` #${record.number}`
  }
  new_element.find('.record-status').html(status_text)
  let num_text = `#${record.number}`
  if (root) {
    num_text = record.status//`<span class="root_record_name">${record.status}</span>`
  }
  new_element.find('.record-number').html(num_text)
  let time = moment.unix(record.time / 1000)
  new_element.find('.record-time').text(time.fromNow())
  new_element.web_record = record
  new_element.web_time = time
  if (at_top) {
    new_element.prependTo('#record_list')
  } else {
    new_element.appendTo('#record_list')
  }

  g_record_map[record.id] = new_element
  new_element.click(on_select_record.bind(null, record.id))
}

let g_selected_record_element = null
function on_select_record(record_id) {
  let element = g_record_map[record_id]
  let record = element.web_record

  if (g_selected_record_element == element) {
    //same one, pass
    return
  }

  //unselect current
  if (g_selected_record_element) {
    g_selected_record_element.attr('select', 'false')
  }

  //select new
  element.attr('select', 'true')
  g_selected_record_element = element

  if (record.state == utils.RECORD_STATE.NORMAL) {
    electron.ipcRenderer.send('get-record-diff', record.id)
  } else {
    deploy_unnormal_record(record)
  }


  element.find('.record-indication').attr('type', '1')
  electron.ipcRenderer.send('read-record', record.id)

  $('#html_diff').get(0).scrollTop = 0
}


/* content */
let g_current_diff
electron.ipcRenderer.on('record-diff', function (e, diff) {
  console.log(diff)
  g_current_diff = diff
  text_mode_deploy()
})

function on_text_mode_change() {
  let mode = $('#select_text_mode').val()
  console.log(mode)
  store.set('text-mode', mode)

  text_mode_deploy()
}

function on_click_short_line_filter() {
  $('#btn_toogle_short_line_filter').attr('pressed', $('#btn_toogle_short_line_filter').attr('pressed') == 'true' ? 'false' : 'true')
  store.set('short-line-filter', $('#btn_toogle_short_line_filter').attr('pressed'))
  text_mode_deploy()
}

function text_mode_deploy() {
  //reset by current diff and header's buttons settings
  console.log('text mode deploy')

  let filter = $('#btn_toogle_short_line_filter').attr('pressed') == 'true'
  let min_len = g_target_map[g_selected_record_element.web_record.target_id].web_target.min_text_line
  console.log('filter', filter, min_len)

  if (g_current_diff) {
    if (g_current_diff.way == utils.TARGET_WAY.LINK) {
      $('#select_text_mode').attr('disabled', 'disabled')
    } else {
      $('#select_text_mode').removeAttr('disabled', 'disabled')
    }

    $('#html_diff').empty()
    switch (g_current_diff.way) {
      case utils.TARGET_WAY.HTML:
      case utils.TARGET_WAY.TEXT:
        deploy_html_or_text(g_current_diff.diff, g_current_diff.way, filter, min_len)
        break
      case utils.TARGET_WAY.LINK:
        deploy_link(g_current_diff.diff, filter, min_len)
        break
    }

    $(".content-link").click(function (e) {
      console.log(e.target)
      let address = e.target.innerText
      if (address.length > 2) {
        address = address.slice(1, -1)
        electron.remote.shell.openExternal(address)
      }
    })
  }
}

function deploy_link(diff, filter, min_len) {
  // for link mode, always show as diff
  diff.forEach(function (part) {
    switch (part.kind) {
      case 'D':
        if (!filter || utils.len(part.lhs.text) > min_len) {
          put_content_link(part.lhs, 'deleted')
        }
        break
      case 'N':
        if (!filter || utils.len(part.rhs.text) > min_len) {
          // console.log(part.rhs.text, utils.len(part.rhs.text))
          put_content_link(part.rhs, 'added')
        }
        break
    }
  })
}

function deploy_html_or_text(diff, way, filter, min_len) {
  let mode = $('#select_text_mode').val()

  let b_added = true
  let b_deleted = mode == "diff" || mode == "all"
  let b_stayed = mode == "all"

  diff.forEach(function (part) {
    switch (part[0]) {
      case -1:
        if (b_deleted) {
          if (!filter || utils.len(part[1]) > min_len) {
            put_content(part[1], 'deleted', way)
          }
        }
        break
      case 0:
        if (b_stayed) {
          if (!filter || utils.len(part[1]) > min_len) {
            put_content(part[1], 'stayed', way)
          }
        }
        break
      case 1:
        if (b_added) {
          if (!filter || utils.len(part[1]) > min_len) {
            put_content(part[1], 'added', way)
          }
        }
        break
    }
  })
}

function deploy_unnormal_record(record) {
  $('#html_diff').empty()
  $(`<span class="unnormal_head">${record.status}</span>`).appendTo('#html_diff')
  $('<br />').appendTo('#html_diff')
  let desc = record.state == utils.RECORD_STATE.EXCEPTION ? 'Remote server error or Network failure' : 'Recover from error and no change occurs'
  $(`<span class="unnormal_desc">${desc}</span>`).appendTo('#html_diff')
}

function put_content_link(data, type) {
  //prependTo, is hacking, make added show before deleted lines
  $('<br />').prependTo('#html_diff')

  $(`<span class="${type}" >${data.text} <span class="content-link">[${data.link}]</span></span>`).prependTo('#html_diff')
}

function put_content(text, type, way) {
  text = $.trim(text)
  if (text.length > 0) {
    if (way == utils.TARGET_WAY.TEXT) {
      // TODO should use https://www.npmjs.com/package/autolinker
      text.split('\n').forEach(function (part) {

        //保证是[http]，而没有大写，在main.js中
        let segments = part.split('[http')

        $(`<span class="${type}">${segments[0]}</span>`).appendTo('#html_diff')

        segments.shift() //pop first
        segments.forEach(function (seg) {
          let pos = seg.search(']')
          let link_address = 'http' + seg.slice(0, pos)
          let text_left = seg.slice(pos + 1)
          $(`<span class="content-link ${type}">[${link_address}]</span>`).appendTo('#html_diff')
          $(`<span class="${type}">${text_left}</span>`).appendTo('#html_diff')
        })

        $('<br />').appendTo('#html_diff')
      })
    } else {
      text = htmlencode.htmlEncode(text)
      $(`<span class="${type}">${text}</span>`).appendTo('#html_diff')
    }
  }
}


function on_click_open_snapshot() {
  if (g_selected_record_element) {
    electron.ipcRenderer.send('open-snapshot', g_selected_record_element.web_record.id)
  }
}

function on_click_open_origin() {
  if (g_selected_record_element) {
    let addr = g_target_map[g_selected_record_element.web_record.target_id].web_target.address
    electron.remote.shell.openExternal(addr)
  }
}

electron.ipcRenderer.on('select-target', function (e, data) {
  on_select_target(data)
  $('#target_list').scrollTo(g_target_map[data])
})

electron.ipcRenderer.on('select-record', function (e, data) {
  on_select_record(data)
  $('#records_space').scrollTo(g_record_map[data])
})


electron.ipcRenderer.on('new-record', function (e, data) {
  let fg = true
  if (g_selected_target_element) {
    if (g_selected_target_element.web_target.id == data.target.id || g_selected_target_element.web_target.id == 'root') {
      add_new_record_element(data.record, true)
      fg = false
    }
  }

  if (fg) {
    //when not selected target has an new record, an indication will go there
    g_target_map[data.target.id].find('.target-indication').attr('indication', 'true')
  }
})

electron.ipcRenderer.on('cmd', function (e, data) {
  if (data == 'open-new-target') {
    on_click_new_target()
  }
})

function on_records_filter_change() {
  let cur = $('#select_records_filter').val()
  store.set('records-filter', cur)
  console.log(cur)

  if (g_selected_target_element) {
    g_selected_target_nomore_record = false
    $('#record_list').empty()
    g_record_map = {}
    electron.ipcRenderer.send('get-some-records', { target_id: g_selected_target_element.web_target.id, offset: $('.record').length - 1, filter: $('#select_records_filter').val() })
  }
}
