document.addEventListener('DOMContentLoaded', function() {
    console.log('hello')
    $('.carousel').carousel()
})

window.addEventListener("load", function() {
})


function school_to(des_id) {
    document.getElementById(des_id).scrollIntoView({behavior: "smooth"});
}