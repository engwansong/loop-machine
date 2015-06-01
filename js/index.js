/**
 * Goals:
 * Stage 1
 * - record audio
 * - convert steam to blob
 * - playback blob
 * Stage 2
 * - Store based on slots
 * Stage 3
 * - store blob in indexeddb
 * - playback based on slots
 */
$(function(){
	var recorder,
		recording,
		input,
		audio_context;
	var setupRecording = function setupRecording(stream) {
		input = window.input = audio_context.createMediaStreamSource(stream);
	};
	var record = function record() {
		input.connect(audio_context.destination);
		window.recorder = recorder = new Recorder(input, {workerPath: 'lib/recorderWorker.js'});
		recorder && recorder.record();
		recording = true;
	};
	var stop = function stop() {
		recorder && recorder.stop();
		input.disconnect();
		addAudio();
		recorder.clear();
		delete recorder;
		recording = false;
	};
	var addAudio = function addAudio(){
		recorder && recorder.exportWAV(function(blob) {
			var url = URL.createObjectURL(blob);
			var audio = document.createElement('audio');
			var button = document.createElement('button');
			audio.controls = false;
			audio.loop = true;
			audio.src = url;
			$(button).addClass('button');
			$('body').append(audio);
			$('body').append(button);
			$(button).text(url);
			$(audio).on('playing', function(e){
				$(button).addClass('playing');
			});
			$(audio).on('pause ended', function(e){
				$(button).removeClass('playing');
			});
			$(button).on('click', function(e){
				if($(this).hasClass('playing')){
					audio.pause();
				} else {
					audio.load();
					audio.play();
				}
			});
		});
	};

	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
		window.URL = window.URL || window.webkitURL;

		window.audio_context = audio_context = new AudioContext;
	} catch(e){
		console.error('Web audio not supported');
	}

	navigator.getUserMedia({audio: true}, setupRecording, function(e){
		console.error('No audio input');
	});
	$('body').on('keypress', function(e){
		if (e.which === 49) {
			if (recording){
				stop();
			} else {
				record();				
			}
		}
	});
});