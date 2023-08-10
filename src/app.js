import Rythm from 'rythm.js';

let button = document.getElementById("play-button");
button.addEventListener("click", play);

function play() {
  var rythm = new Rythm();
  rythm.setMusic("samples/rythmC.mp3");
  rythm.start();
  console.log("play");
}
