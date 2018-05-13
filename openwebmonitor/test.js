
const request = require('superagent');
require('superagent-proxy')(request)

const g_ua_desktop = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"
const g_accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
var proxy = process.env.http_proxy || 'socks5://127.0.0.1:1086';
console.log(proxy)

function t_proxy(address){
	request.get(address)
	  // .proxy(null)
    .set('user-agent', g_ua_desktop)
    .set('accept', g_accept)
    .timeout({
      response: 60000,  // Wait some seconds for the server to start sending,
      deadline: 120000, // but allow 1 minute for the file to finish loading.
    })
    .end(function (err, res) {
      if (err) {
        console.log(err.status)
      } else {
        console.log(res)
      }
    })
}


// t_proxy('https://www.nytimes.com/')
t_proxy('https://codeahoy.com/')
// t_proxy('https://github.com/')