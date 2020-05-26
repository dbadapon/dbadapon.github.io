var audioCtx;
var gainValue = .5;
var buffers = {};
var notes = {};
var song = [];
var quarter = 500; // in ms

function initialize_ac() {
  audioCtx = new AudioContext();
  setAudioBufferSources();
  console.log("initialized!!");
}

async function setAudioBufferSource(filename, name) {
  var request = new XMLHttpRequest();
  var bufferSource;

  request.open('GET', filename, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    audioCtx.decodeAudioData(request.response, function(buffer) {
        buffers[name] = buffer;
        notes[name] = {};
    });
  }
  request.send();
}

function setAudioBufferSources() {
  // TODO: Finish editing voice samples and add them here
  //https://raw.githubusercontent.com/myName/myRepo/master/vendor/assets/music/Tetris.mp3
  setAudioBufferSource('https://raw.githubusercontent.com/dbadapon/dbadapon.github.io/master/audio/a-vow.wav', "a-vow");
  //setAudioBufferSource('audio/i-vow.wav', "i-vow");
  setAudioBufferSource('audio/u-vow.wav', "u-vow");
}

function wait(milliseconds) {
    let timeStart = new Date().getTime();
    while (true) {
      let elapsedTime = new Date().getTime() - timeStart;
      if (elapsedTime > milliseconds) {
        break;
      }
    }
  }

function playAttack(preName, detune, vibrato) {
  buffer = buffers[preName];
  bufferSource = audioCtx.createBufferSource();
  bufferSource.buffer = buffer;

  notes[preName].buffer = bufferSource;

  const gain = audioCtx.createGain();
  gain.gain.value = gainValue;
  bufferSource.connect(gain);
  gain.connect(audioCtx.destination);
  bufferSource.detune.value = detune;

  bufferSource.start();
  // TODO: fix "click" in between attack and vowel
  wait(buffer.duration*1000);
  notes[preName].buffer.stop();
}

function playNote(note) {
  if (notes[note.preName] != null) {
    playAttack(note.preName, note.detune, note.vibrato);
  }
  buffer = buffers[note.vowName];
  bufferSource = audioCtx.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.loopStart = .32;
  bufferSource.loopEnd = buffer.duration * .42;
  bufferSource.loop = true;

  notes[note.vowName].buffer = bufferSource;

  const gain = audioCtx.createGain();
  gain.gain.value = gainValue;
  bufferSource.connect(gain);
  gain.connect(audioCtx.destination);

  const modulator = audioCtx.createOscillator();
  modulator.frequency.value = 5;
  const modGain = audioCtx.createGain();
  modGain.gain.value = note.vibrato;
  modulator.connect(modGain);
  modGain.connect(bufferSource.detune);
  bufferSource.detune.value = note.detune;
  bufferSource.start();
  modulator.start();

  // TODO: fix note duration to account for attack duration
  wait(note.duration);
  notes[note.vowName].buffer.stop();
}

function Note(preName, vowName, duration, detune, vibrato, syllable, noteName, durValue) {
  this.preName = preName;
  this.vowName = vowName;
  this.duration = duration; // in milliseconds
  this.detune = detune;
  this.vibrato = vibrato;

  this.syllable = syllable;
  this.noteName = noteName;
  this.durValue = durValue;
}

function detuneFromSelectedIndex(noteIndex, octIndex) {
  // remember the "base" is at C4
  // +/- 100 = +/- 1 semitone
  let detune = (noteIndex-3)*100;
  let octave = (octIndex-3)*1200;
  return detune + octave;
}

function durationFromSelectedValue(durValue) {
  switch(durValue) {
    case "16th":
      return quarter/4;
    case "8th":
      return quarter/2;
    case "Quarter":
      return quarter;
    case "Half":
      return quarter*2;
    case "Whole":
      return quarter*4;
  }
}

function createNote() {
  let syllableSelect = document.getElementById("syllables");
  let syllable = syllableSelect.options[syllableSelect.selectedIndex].value;

  let noteSelect = document.getElementById("notes");
  let note = noteSelect.options[noteSelect.selectedIndex].value;
  console.log(note);

  let octSelect = document.getElementById("octaves");
  console.log(octSelect.options[octSelect.selectedIndex].value);

  let detune = detuneFromSelectedIndex(noteSelect.selectedIndex, octSelect.selectedIndex);
  console.log(detune);

  let durSelect = document.getElementById("duration");
  let durValue = durSelect.options[durSelect.selectedIndex].value;
  let duration = durationFromSelectedValue(durValue);
  console.log(duration);

  let vibSlider = document.getElementById("vibrato");
  let vibrato = vibSlider.value;
  console.log(vibrato);

  return new Note(syllable+"-pre", syllable+"-vow", duration, detune, vibrato, syllable, note, durValue);
}

function playSong() {
  for (var i = 0; i < song.length; i++) {
    playNote(song[i]);
  }
}

function noteToString(note) {
  let noteString = "";
  return noteString.concat("[ ", note.syllable, " | ", note.noteName, " | ", note.durValue, " ]");
}

function displaySong() {
  let songDisplay = document.getElementById("song");
  var songString = "Song: ";
  for (var i = 0; i < song.length; i++) {
    console.log(noteToString(song[i]));
    songString += noteToString(song[i]);
  }
  console.log(songString);
  songDisplay.innerHTML = songString;
}

$(document).ready(function() { // All user interactions handled here
  $("#song").hide();
  $("#play").hide();
  $("#syllablesLabel").hide();
  $("#syllables").hide();
  $("#notesLabel").hide();
  $("#notes").hide();
  $("#octavesLabel").hide();
  $("#octaves").hide();
  $("#durationLabel").hide();
  $("#duration").hide();
  $("#vibratoLabel").hide();
  $("#vibrato").hide();
  $("#vibValue").hide();
  $("#preview").hide();
  $("#add").hide();

  $("#butt").click(function() {
    initialize_ac();
    $(this).hide();
    $("#song").show();
    $("#play").show();
    $("#syllablesLabel").show();
    $("#syllables").show();
    $("#notesLabel").show();
    $("#notes").show();
    $("#octavesLabel").show();
    $("#octaves").show();
    $("#durationLabel").show();
    $("#duration").show();
    $("#vibratoLabel").show();
    $("#vibrato").show();
    $("#vibValue").show();
    $("#preview").show();
    $("#add").show();
  });

  let vibSlider = document.getElementById("vibrato");
  let vibOutput = document.getElementById("vibValue");
  vibOutput.innerHTML = vibSlider.value;

  vibSlider.oninput = function() {
    vibOutput.innerHTML = this.value;
  }

  // for testing only:

  $("#add").click(function() {
    console.log("clicked add!");
    let note = createNote();
    console.log(note);
    song.push(note);
    displaySong();
  });

  $("#preview").click(function() {
    console.log("clicked preview!");
    let note = createNote();
    playNote(note);
  });

  $("#play").click(function() {
    console.log("clicked play!");
    playSong();
  })

  // TODO: "Delete last" button
  // TODO: "Clear" button

});
