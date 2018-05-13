
const electron = require('electron');
const path = require('path');
const locale = require('./locale')
const utils = require('./utils')

let myclip

document.addEventListener('DOMContentLoaded', function () {
  console.log("update init")
  locale.init()

  document.getElementById('ver').innerText = electron.remote.app.getVersion()
})


function open_copyright(){
  electron.shell.openExternal("http://boringuniverse.com")
}