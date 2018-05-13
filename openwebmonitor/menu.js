const electron = require('electron')
const path = require('path')
const locale = require('./locale')
const utils = require('./utils')
const moment = require('moment')

function open_main_window(data) {
  electron.ipcRenderer.send('open-main-window', data)
}

document.addEventListener('DOMContentLoaded', function () {
  console.log("init menu")
  locale.init()

  electron.ipcRenderer.send('get-config')

  $('#btn_settings').click(function () {
    electron.ipcRenderer.send('open-settings')
  })

  $('.open-main').click(function () {
    open_main_window(null)
  })

  $('#btn_new').click(function() {
    open_main_window('open-new-target')
  })

  setInterval(update_moment_time, 30 * 1000)
})

let g_queue = []

electron.ipcRenderer.on('new-record', function (e, data) {

  $('#no_content').hide()

  if (data.target.muted == 0) {
    let b_notify =
      (data.record.state == utils.RECORD_STATE.NORMAL && g_config_cache.notify_change) ||
      (data.record.state == utils.RECORD_STATE.EXCEPTION && g_config_cache.notify_exception) ||
      (data.record.state == utils.RECORD_STATE.RECOVERY && g_config_cache.notify_recovery)

    let t = (data.record.state == utils.RECORD_STATE.NORMAL) ? 'New Change' :
      (data.record.state == utils.RECORD_STATE.EXCEPTION) ? 'New Exception': 'Recovery'

    if (b_notify) {
      let notify = new Notification(data.target.name, {
        title: data.target.name,
        body: t,
        icon: data.target.icon
      });

      notify.onclick = () => {
        electron.ipcRenderer.send('open-record', { target_id: data.target.id, record_id: data.record.id })
      }
    }
  }


  add_new_record_element(data.target, data.record)

  if (g_queue.length > 18) {
    g_queue.shift().remove()
  }

})

let g_config_cache = null
electron.ipcRenderer.on('update-config', function (e, data) {
  g_config_cache = data
})

function update_moment_time() {
  g_queue.forEach(function (record_element) {
    record_element.find('.record-time').text(record_element.web_time.fromNow())
  })
}

function add_new_record_element(target, record) {
  let new_element = $('#record_template').clone()
  new_element.removeAttr('id')
  new_element.find('.target-name').text(target.name)
  new_element.find('.record-status').html(record.status).attr('type', `${record.state}`)
  new_element.find('.target-address').text(target.address)
  let time = moment.unix(record.time / 1000)
  new_element.find('.record-time').text(time.fromNow())
  new_element.web_time = time
  new_element.find('.target-image').attr('src', target.icon)
  new_element.prependTo('#record_list')
  new_element.web_target = target
  new_element.web_record = record

  new_element.click(function () {
    electron.ipcRenderer.send('open-record', { target_id: target.id, record_id: record.id })
  })

  g_queue.push(new_element)
}