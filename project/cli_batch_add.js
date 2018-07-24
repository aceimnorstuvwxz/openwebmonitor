const sqlite3 = require('sqlite3').verbose()
const utils = require('./utils')
const uuidgen = require('uuid/v4');
const url = require('url');
const fs = require('fs');

let g_db = null

/* database */

function database_init() {
  g_db = new sqlite3.Database("/Users/ch3n/Library/Application Support/OpenWebMonitor/database.db")
}


function db_save_new_target(new_target) {

  g_db.serialize(function () {
    g_db.run(`INSERT INTO target(id, name, address, state, topindex, icon, min_change, min_text_line, read, muted, way, added_only, cookie, use_proxy) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      new_target.id, new_target.name, new_target.address, new_target.state, new_target.topindex, new_target.icon,
      new_target.min_change, new_target.min_text_line, new_target.read, new_target.muted, new_target.way, new_target.added_only, new_target.cookie, new_target.use_proxy, function (err) {
        if (err) {
          return console.log(err.message)
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`)
      })
  })
}



/* target */
function add_target(addr){
  const myURL = url.parse(addr)
  let new_target = {
    id: uuidgen(),
    name: myURL.hostname,
    address: addr,
    state: utils.TARGET_STATE.NORMAL,
    topindex: 0,
    icon: '', //在前端使用默认的 icon 
    min_change: 50,
    min_text_line: 30,
    read: 1, //已读
    muted: 0, //未禁声
    way: 2,
    added_only: 0,
    cookie: '',
    use_proxy: 1
  }
  db_save_new_target(new_target)
}


function batch(){
  database_init()

  fs.readFile('freebuf_links.txt','UTF-8' ,function (err, data) {
    if (err) throw err;
    lines = data.split('\n')
    lines.forEach(element => {
      console.log(element)
      add_target(element)
    });
  });
}

// batch()
