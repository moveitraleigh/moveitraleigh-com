var h = document.getElementById("header");
var stuck = false;
var stickPoint = getDistance();

function getDistance() {
  var topDist = h.offsetTop;
  return topDist;
}

window.onscroll = function(e) {
  var distance = getDistance() - window.pageYOffset;
  var offset = window.pageYOffset;
  if ( (distance <= 0) && !stuck) {
    h.classList.add('sticky-header');
    stuck = true;
  } else if (stuck && (offset <= stickPoint)){
    h.classList.remove('sticky-header');
    stuck = false;
  }
}