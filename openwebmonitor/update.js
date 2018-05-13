
const electron = require('electron');
const path = require('path');
const locale = require('./locale')
const utils = require('./utils')

let myclip

document.addEventListener('DOMContentLoaded', function () {
  console.log("update init")
  locale.init()

  setTimeout(check_update, 1000)

})


function set_info(ver, desc, date, show) {
  document.getElementById('ver_date').innerText = "v" + ver + "\nreleased at " + date
  document.getElementById('desc').innerText = desc

  document.getElementById('desc').style.display = 'block'
  if (show) {
    document.getElementById('ver_date').style.display = 'block'
    document.getElementById('download').style.display = 'block'
  }
  document.getElementById('loading').style.display = 'none'

}

let download_url;

function check_update() {
  $.get("http://openwebmonitor.netqon.com/version.json", function (response, body) {
    console.log(response.darwin)

    let myVerCode = utils.version_string_2_code(electron.remote.app.getVersion())

    let remoteCfg = response.win32
    if (process.platform == 'darwin') {
      remoteCfg = response.darwin
    }

    // remoteCfg.version = "1.1.0"
    let remoteVerCode = utils.version_string_2_code(remoteCfg.version)

    console.log(electron.remote.app.getVersion(), myVerCode, remoteCfg.version, remoteVerCode)

    if (remoteVerCode > myVerCode) {
      //需要更新
      // document.getElementById('desc').innerText = remoteCfg.desc
      set_info(remoteCfg.version, remoteCfg.desc, remoteCfg.date, true)
      download_url = remoteCfg.url
    } else {
      //已经最新
      set_info("", locale.g("已经是最新的版本。", "Already the latest version."), "", false)

    }

  })
}

function open_copyright() {
  electron.shell.openExternal("http://boringuniverse.com")
}

function on_download() {
  console.log("download by", download_url)
  electron.shell.openExternal(download_url)
}