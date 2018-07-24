//专门用于中英文的locale的帮助代码
//https://electronjs.org/docs/api/locales

const app = require('electron').remote.app

function getLocale(){
    // return 'zh-CN2' //DEV test
    return app.getLocale()
}

//js 代码中可以用此函数来选择
function g(cn, en){
    return getLocale() == 'zh-CN' ? cn : en;
}


//HTML中的字符串，在元素的attribute中设置字符串，通过此方法遍历来应用locale
function init(){
    let use_cn = getLocale() == 'zh-CN'
    let nodes = document.all
    for(var i=0; i<nodes.length; i++){  
        let o = nodes[i]
        if (use_cn && o.hasAttribute('cn')) {
            o.innerHTML = o.getAttribute('cn')
        }
        if (!use_cn && o.hasAttribute('en')) {
            o.innerHTML = o.getAttribute('en')
        }
        
    }  
}

//exports
exports.g = g
exports.init = init