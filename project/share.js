
const electron = require('electron');
const path = require('path');
const locale = require('./locale')

let myclip

document.addEventListener('DOMContentLoaded', function () {
  console.log("share init")
  locale.init()

  electron.ipcRenderer.send("request_share_data")

  myclip = new Clipboard('#btn');
  myclip.on('success', function (e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);

    e.clearSelection();

    document.getElementById('msg').style.visibility='visible';

    setTimeout("window.close()", 500)
  });

  myclip.on('error', function (e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
  });
})


function get_minute_hm_text(minute){
  let today_h = Math.floor(minute/60)
  let today_m = minute - today_h*60
  return today_h > 0 ? "" + today_h + "h" + today_m + "m" : "" + today_m + "m"
}

function gen_percent(num, total){
  let a = Math.floor(num/total * 100) 

}

electron.ipcRenderer.on("share_data", (event, data) => {
  console.log(data)

  let date = new Date()
  let day = date.getDate() //不需要+1
  const weektext = locale.g(['周日', '周一', '周二', '周三', '周四', '周五', '周六'], ['SUN', 'MON', 'TUE', "WED", "THU", "─FRI", "SAT"])
  const monthtext = locale.g(["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
  let weekd = weektext[date.getDay()]
  let monthd = monthtext[date.getMonth()]

  let head = `─${monthd} ${day}${locale.g("日", "─")}───${weekd}─
  ${locale.g("今天","Today")} ${get_minute_hm_text(data.today)}
  ${locale.g("本周","In Week")} ${get_minute_hm_text(data.week)}
  ${locale.g("本月","In Month")} ${get_minute_hm_text(data.month)}
─7${locale.g("天", "days")} ${locale.g("Top Apps", "Top Apps")}──${locale.g("─", "")}─
`
  let body = ''
  let sum = 0
  data.app_usage.forEach(e => {
    sum += e.total_cost
  })
  console.log('sum', sum)
  data.app_usage.forEach(e => {
    body += `  ${Math.floor(e.total_cost/sum * 1000)/10}%  ${e.process_name}
`
  });


  let foot = `──────A.F.C App─`

  document.getElementById('bar').value = head + body + foot
})


function open_copyright(){
  electron.shell.openExternal("http://boringuniverse.com")
}