var audioCtx;
var gainValue = .5;
var buffers = {};
var notes = {};
var song = [];
var quarter = 500; // in ms
// TODO: Allow tempo change

var demoSong = [];

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
  // NOTE: Instead of looping the vowel portion of the syllable, I extend the vowel myself in Audacity
  //        So the vowel continues for longer than you would practically need it
  // TODO: Add RESTS
  // TODO: Add BREATH
  // TODO: Add TIED note values
  setAudioBufferSource('audio/vowels/a-vow.wav', "a");
  setAudioBufferSource('audio/vowels/i-vow.wav', "i");
  setAudioBufferSource('audio/vowels/u-vow.wav', "u");
  setAudioBufferSource('audio/vowels/e-vow.wav', "e");
  setAudioBufferSource('audio/vowels/o-vow.wav', "o");

  setAudioBufferSource('audio/k/ka.wav', "ka");
  setAudioBufferSource('audio/k/ki.wav', "ki");
  setAudioBufferSource('audio/k/ku.wav', "ku");
  setAudioBufferSource('audio/k/ke.wav', "ke");
  setAudioBufferSource('audio/k/ko.wav', "ko");

  setAudioBufferSource('audio/s/sa.wav', "sa");
  setAudioBufferSource('audio/s/shi.wav', "shi");
  setAudioBufferSource('audio/s/su.wav', "su");
  setAudioBufferSource('audio/s/se.wav', "se");
  setAudioBufferSource('audio/s/so.wav', "so");

  setAudioBufferSource('audio/t/ta.wav', "ta");
  setAudioBufferSource('audio/t/chi.wav', "chi");
  setAudioBufferSource('audio/t/tsu.wav', "tsu");
  setAudioBufferSource('audio/t/te.wav', "te");
  setAudioBufferSource('audio/t/to.wav', "to");

  setAudioBufferSource('audio/n/n.wav', "n");
  setAudioBufferSource('audio/n/na.wav', "na");
  setAudioBufferSource('audio/n/ni.wav', "ni");
  setAudioBufferSource('audio/n/nu.wav', "nu");
  setAudioBufferSource('audio/n/ne.wav', "ne");
  setAudioBufferSource('audio/n/no.wav', "no");

  setAudioBufferSource('audio/h/ha.wav', "ha");
  setAudioBufferSource('audio/h/hi.wav', "hi");
  setAudioBufferSource('audio/h/hu.wav', "hu");
  setAudioBufferSource('audio/h/he.wav', "he");
  setAudioBufferSource('audio/h/ho.wav', "ho");

  setAudioBufferSource('audio/m/ma.wav', "ma");
  setAudioBufferSource('audio/m/mi.wav', "mi");
  setAudioBufferSource('audio/m/mu.wav', "mu");
  setAudioBufferSource('audio/m/me.wav', "me");
  setAudioBufferSource('audio/m/mo.wav', "mo");

  setAudioBufferSource('audio/y/ya.wav', "ya");
  setAudioBufferSource('audio/y/yu.wav', "yu");
  setAudioBufferSource('audio/y/yo.wav', "yo");

  setAudioBufferSource('audio/r/ra.wav', "ra");
  setAudioBufferSource('audio/r/ri.wav', "ri");
  setAudioBufferSource('audio/r/ru.wav', "ru");
  setAudioBufferSource('audio/r/re.wav', "re");
  setAudioBufferSource('audio/r/ro.wav', "ro");

  setAudioBufferSource('audio/w/wa.wav', "wa");
  setAudioBufferSource('audio/w/wo.wav', "wo");
}

function Note(syllable, duration, detune, vibrato, noteName, durValue) {
  this.syllable = syllable;
  this.duration = duration; // in milliseconds
  this.detune = detune;
  this.vibrato = vibrato;

  this.noteName = noteName;
  this.durValue = durValue;
}

function wait(milliseconds) {
    /* Used in the playNote function to let the audio buffer play for the specified
    number of milliseconds. */
    let timeStart = new Date().getTime();
    while (true) {
      let elapsedTime = new Date().getTime() - timeStart;
      if (elapsedTime > milliseconds) {
        break;
      }
    }
  }

function playNote(note) {
  buffer = buffers[note.syllable];
  bufferSource = audioCtx.createBufferSource();
  bufferSource.buffer = buffer;

  notes[note.syllable].buffer = bufferSource;

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

  wait(note.duration);
  notes[note.syllable].buffer.stop();
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

  return new Note(syllable, duration, detune, vibrato, note, durValue);
}

function playSong(s) {
  for (var i = 0; i < s.length; i++) {
    playNote(s[i]);
  }
}

function noteToString(note) {
  let noteString = "";
  return noteString.concat("[ ", note.syllable, " | ", note.noteName, " | ", note.durValue, " ]");
}

function displaySong(s, elementId) {
  let songDisplay = document.getElementById(elementId);
  var songString = "Song: ";
  for (var i = 0; i < s.length; i++) {
    //console.log(noteToString(s[i]));
    songString += noteToString(s[i]);
  }
  //console.log(songString);
  songDisplay.innerHTML = songString;
}

function createDemoSong() {
  //new Note(syllable, duration, detune, vibrato, note, durValue);
  n1 = new Note("ki", 500, 0, 0, "C", "Quarter");
  n2 = new Note("ra", 500, 0, 0, "C", "Quarter");
  n3 = new Note("ki", 500, 700, 0, "G", "Quarter");
  n4 = new Note("ra", 500, 700, 0, "C", "Quarter");
  n5 = new Note("hi", 500, 900, 0, "A", "Quarter");
  n6 = new Note("ka", 500, 900, 0, "A", "Quarter");
  n7 = new Note("ru", 1000, 700, 30, "G", "Half");

  n8 = new Note("o", 400, 500, 0, "F", "Quarter");
  n9 = new Note("so", 500, 500, 0, "F", "Quarter");
  n10 = new Note("ra", 500, 400, 0, "E", "Quarter");
  n11 = new Note("no", 500, 400, 0, "E", "Quarter");
  n12 = new Note("ho", 400, 200, 0, "D", "Quarter");
  n13 = new Note("shi", 500, 200, 0, "D", "Quarter");
  n14 = new Note("yo", 1000, 0, 30, "C", "Half");

  demoSong = [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, n13, n14];
}

$(document).ready(function() {
  /* All user interactions handled here */
  $("#about").hide();
  $("#hide_about").hide();
  $("#help").hide();
  $("#hide_help").hide();
  $("#about_message").hide();
  $("#help_message").hide();
  $("#line1").hide();

  $("#song").hide();
  $("#play").hide();
  $("#line2").hide();

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
  $("#delete").hide();
  $("#clear").hide();
  $("#show_demo").hide();
  $("#play_demo").hide();
  $("#hide_demo").hide();
  $("#demo_song").hide();
  $("#demo").hide();

  $("#butt").click(function() {
    initialize_ac();
    createDemoSong();
    $(this).hide();

    $("#about").show();
    $("#help").show();
    $("#line1").show();

    $("#song").show();
    $("#play").show();
    $("#line2").show();

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
    $("#delete").show();
    $("#clear").show();
    $("#show_demo").show();
    $("#demo").show();
  });

  $("#about").click(function() {
    console.log("clicked about!");
    $(this).hide();
    $("#hide_about").show();
    $("#about_message").show();
  });

  $("#hide_about").click(function() {
    console.log("clicked hide about!");
    $(this).hide();
    $("#about_message").hide();
    $("#about").show();
  });

  $("#help").click(function() {
    console.log("clicked help!");
    $(this).hide();
    $("#hide_help").show();
    $("#help_message").show();
  });

  $("#hide_help").click(function() {
    console.log("clicked hide help!");
    $(this).hide();
    $("#help_message").hide();
    $("#help").show();
  });

  let vibSlider = document.getElementById("vibrato");
  let vibOutput = document.getElementById("vibValue");
  vibOutput.innerHTML = vibSlider.value;

  vibSlider.oninput = function() {
    vibOutput.innerHTML = this.value;
  }

  $("#add").click(function() {
    console.log("clicked add!");
    let note = createNote();
    console.log(note);
    song.push(note);
    console.log(song);
    displaySong(song, "song");
  });

  $("#preview").click(function() {
    console.log("clicked preview!");
    let note = createNote();
    playNote(note);
  });

  $("#play").click(function() {
    console.log("clicked play!");
    playSong(song);
  })

  $("#delete").click(function() {
    console.log("clicked delete!");
    if (song.length > 0) {
      song.pop();
    }
    displaySong(song, "song");
  })

  $("#clear").click(function() {
    console.log("clicked clear!");
    if (song.length > 0) {
      song = [];
    }
    displaySong(song, "song");
  })

  $("#show_demo").click(function() {
    console.log("clicked show demo!");
    $(this).hide();
    $("#play_demo").show();
    $("#hide_demo").show();
    $("#demo_song").show();
    displaySong(demoSong, "demo_song");
  })

  $("#play_demo").click(function() {
    console.log("clicked play demo!");
    playSong(demoSong);
  })

  $("#hide_demo").click(function() {
    console.log("clicked hide demo!");
    $(this).hide();
    $("#play_demo").hide();
    $("#demo_song").hide();
    $("#show_demo").show();
  })

});
