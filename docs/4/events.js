
//==================================================================
//
//==================================================================
function eventLayoutResize()	{

	d3.select('nav').style('height',(innerHeight*.05)+'px');
	//d3.select('.content-summary').style('height',(innerHeight*.2)+'px');
	d3.select('.content-timeline').style('height',(innerHeight*.2)+'px');


	d3.select('.content-map').style('height',(

		innerHeight - (
			+d3.select('nav').style('height').replace(/\D+$/,'') +
			+d3.select('.content-summary').style('height').replace(/\D+$/,'') +
			+d3.select('.content-timeline').style('height').replace(/\D+$/,'')
		)

	)+'px');


	if (typeof vizTimeline_resetScale=='function') vizTimeline_resetScale();

	d3.select('.date-info').style('bottom',((innerHeight * .2)-10)+'px');
//	timeline_annotations(M.current.date);



//	var bb = d3.select('.content-map').node().getBoundingClientRect();
//	d3.select('.viz-countries')
//			.styles({
//				left	:(bb.x+20)+'px',
//				top		:bb.y+'px',
//				height:bb.height+'px',
//				height:bb.height+'px',
//			});


	d3.select('.viz-countries').selectAll('*').remove();
	d3.select('.viz-patients').selectAll('*').remove();

}




//-----------------------------
//  disable zoom
//-----------------------------

// https://stackoverflow.com/questions/37808180/disable-viewport-zooming-ios-10-safari#38573198
//
//document.addEventListener('touchmove', function (event) {
//  if (event.scale !== 1) { event.preventDefault(); }
//}, false);
//
//
//
//var lastTouchEnd = 0;
//document.addEventListener('touchend', function (event) {
//  var now = (new Date()).getTime();
//  if (now - lastTouchEnd <= 300) {
//    event.preventDefault();
//  }
//  lastTouchEnd = now;
//}, false);




/*

plink-plonk.js
https://gist.github.com/tomhicks/6cb5e827723c4eaef638bf9f7686d2d8


Copy this into the console of any web page that is interactive and doesn't
do hard reloads. You will hear your DOM changes as different pitches of
audio.
I have found this interesting for debugging, but also fun to hear web pages
render like UIs do in movies.

*/

/*

M.current.audio = true;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
var gainNode = audioCtx.createGain();
const observer = new MutationObserver(function(mutationsList) {
  const oscillator = audioCtx.createOscillator()

  oscillator.connect(audioCtx.destination)

  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(
//    Math.log(mutationsList.length + 5) * 880,
		M.current.audio ? Math.log(mutationsList.length + 5) * 880 : 0,
    audioCtx.currentTime,
  )

  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.01)

})

observer.observe(document, {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true,
})

function mute()	{
	M.current.audio = !M.current.audio;
}


*/
