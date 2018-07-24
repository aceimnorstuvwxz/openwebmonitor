

function version_string_2_code(ver){
    //x.x.x
    let arr = ver.split('.')
    arr = arr.map(x=>parseInt(x))
    let sum  = 10000*arr[0] + 100*arr[1] + 1*arr[2]
    return sum
}

function is_mac(){
    return process.platform == 'darwin'
}

function is_win(){
    return !is_mac()
}

exports.is_dev = function(){
    return true
}


function random_select(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

exports.version_string_2_code = version_string_2_code
exports.is_win = is_win
exports.is_mac = is_mac
exports.random_select = random_select
exports.TARGET_STATE = {
    NORMAL: 0,
    PAUSED: 1
}

exports.RECORD_STATE = {
    NORMAL: 0,
    EXCEPTION: 1,
    RECOVERY: 2
}

exports.TARGET_WAY = {
    HTML: 0,
    TEXT: 1,
    LINK: 2
}

exports.len = function(text) {
    return Buffer.byteLength(text, 'utf8')
}

// console.log(exports.len('abc你好'))