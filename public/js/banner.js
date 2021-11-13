var slideIndex = 1;
var timer = 10000;

//Loads up the banner on website startup
window.onload = function(){
    showBanners(slideIndex);
}

// Next/previous controls
function next_prev(n) {
    showBanners(slideIndex += n);    
}

//Dot controls
function currentBanner(n) {
    showBanners(slideIndex = n);
}

function showBanners(n) {
    var banner = document.getElementsByClassName("my_banner");
    var dots = document.getElementsByClassName("dot");
    //Sets the banner back to the first one after user clicks right on the last one
    if (n > banner.length || slideIndex > banner.length){
        slideIndex = 1;
        n = 1;
    }
    //Sets the banner to the last one if user clicks left ton the first banner
    if (n < 1 || slideIndex < 1) {
        slideIndex = banner.length;
        n = banner.length;
    }
    //Only display the current banner
    for (var i = 0; i < banner.length; i++) {
        banner[i].style.display = "none";
    }
    //removes the dot hover
    for (var i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    
    //Make the banners and dots the correct order
    banner[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";

}

//Restarts the timer when prev or next button is clicked !!DOES NOT WORK!!
function loop_reset(){
    clearInterval(loop, 0)
}

//loops the banner
var loop = setInterval(
    function(){ 
    document.getElementById("next").click();
    }, timer);


