
const electron = require('electron')
const path = require('path')
const locale = require('./locale')

document.addEventListener('DOMContentLoaded', function () {
  console.log("settings init")
  locale.init()

  electron.ipcRenderer.send("get-settings-data")
})


electron.ipcRenderer.on("settings-data", (event, config) => {

  console.log('receive config', config)

  $('#notify_on_change').prop('checked', config.notify_change)
  $('#notify_on_exception').prop('checked', config.notify_exception)
  $('#notify_on_recovery').prop('checked', config.notify_recovery)

  $(`option[value="${config.check_interval}"]`).prop('selected', true)

  $('#launch_at_login').prop('checked', config.launch_at_login)
  $('#proxy').val(config.proxy)

  $('.sensitive').change(function (e) {
    console.log('change')
    save_config()
  })

})


function save_config() {

  electron.ipcRenderer.send('update-settings', {
    notify_change: $('#notify_on_change').prop('checked'),
    notify_exception: $('#notify_on_exception').prop('checked'),
    notify_recovery: $('#notify_on_recovery').prop('checked'),
    check_interval: $('#check_interval').val(),
    launch_at_login: $('#launch_at_login').prop('checked'),
    proxy: $('#proxy').val()
  })

}

function launch_at_login_changed() {
  electron.ipcRenderer.send('set_autoboot', $("#launch_at_login_alert_switch").prop("checked"))
}

function chart_fill_changed() {
  electron.ipcRenderer.send('set_chart_fill', $("#chart_fill_switch").prop("checked"))
}

function chart_tension_changed() {
  electron.ipcRenderer.send('set_chart_tension', $("#chart_tension_switch").prop("checked"))
}

function open_copyright() {
  electron.shell.openExternal("http://boringuniverse.com")
}