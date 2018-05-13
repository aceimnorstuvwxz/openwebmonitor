const electron = require('electron')

exports.notify_all_windows = function (msg_text, msg_data) {
    console.log('notify all windows', msg_text)
    electron.webContents.getAllWebContents().forEach(wc => {
        wc.send(msg_text, msg_data)
    })
}

exports.notify_focused_window = function (msg_text, msg_data) {
    console.log('notify focused window', msg_text)
    let focused = electron.BrowserWindow.getFocusedWindow()
    if (focused) {
        focused.webContents.send(msg_text, msg_data)
    }
}