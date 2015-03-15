;
"use strict"; // jshint ;_;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var PitchDetect = function() {
  this.audioContext = new window.AudioContext();
  this.MAX_SIZE = Math.max(4, Math.floor(this.audioContext.sampleRate / 5000)); // corresponds to a 5kHz signal
  this.init();
};

PitchDetect.prototype = {
  audioContext: null,
  isPlaying: false,
  sourceNode: null,
  analyser: null,
  theBuffer: null,
  DEBUGCANVAS: null,
  mediaStreamSource: null,
  detectorElem: null,
  canvasElem: null,
  waveCanvas: null,
  pitchElem: null,
  noteElem: null,
  detuneElem: null,
  detuneAmount: null,
  rafID: null,
  tracks: null,
  buflen: 1024,
  buf: new Float32Array(1024),
  noteStrings: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  MAX_SIZE: null,
  MIN_SAMPLES: 0, // will be initialized when AudioContext is created.
  init: function() {
    var self = this;
    this.getUserMedia({
        "audio": {
          "mandatory": {
            "googEchoCancellation": "false",
            "googAutoGainControl": "false",
            "googNoiseSuppression": "false",
            "googHighpassFilter": "false"
          },
          "optional": []
        },
      },
      function(stream) {
        self.gotStream.call(self, stream);
      });
  },
  gotStream: function(stream) {
    // Create an AudioNode from the stream.
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.mediaStreamSource.connect(this.analyser);
    this.updatePitch(); //first call
  },
  error: function() {
    alert('Stream generation failed.');
  },
  getUserMedia: function(dictionary, callback) {
    try {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      navigator.getUserMedia(dictionary, callback, this.error);
    } catch (e) {
      alert('getUserMedia threw exception :' + e);
    }
  },
  autoCorrelate: function(buf, sampleRate) {
    var SIZE = buf.length;
    var MAX_SAMPLES = Math.floor(SIZE / 2);
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(MAX_SAMPLES);

    for (var i = 0; i < SIZE; i++) {
      var val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) // not enough signal
      return -1;

    var lastCorrelation = 1;
    for (var offset = this.MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
      var correlation = 0;

      for (var i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs((buf[i]) - (buf[i + offset]));
      }
      correlation = 1 - (correlation / MAX_SAMPLES);
      correlations[offset] = correlation; // store it, for the tweaking we need to do below.
      if ((correlation > 0.9) && (correlation > lastCorrelation)) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      } else if (foundGoodCorrelation) {
        // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
        // Now we need to tweak the offset - by interpolating between the values to the left and right of the
        // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
        // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
        // (anti-aliased) offset.

        // we know best_offset >=1,
        // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
        // we can't drop into this clause until the following pass (else if).
        var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
        return sampleRate / (best_offset + (8 * shift));
      }
      lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
      // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
      return sampleRate / best_offset;
    }
    return -1;
    //	var best_frequency = sampleRate/best_offset;
  },
  updatePitch: function(time) {
    //        var cycles = new Array;
    //        console.log(this)
    var self = this;

    this.analyser.getFloatTimeDomainData(this.buf);
    var ac = this.autoCorrelate(this.buf, this.audioContext.sampleRate);
    // TODO: Paint confidence meter on canvasElem here.

    if (ac === -1) {
      if (typeof this.receiver === 'function') {
        this.receiver({
          "confident": 0,
          "note": -1,
          "noteStr": null,
          "detune": "",
          "detuneAmmount": -1
        });
      }
    } else {
      var chunk = {};
      chunk["confident"] = 1;
      var note = this.noteFromPitch(ac);
      chunk["note"] = note;
      chunk["noteStr"] = this.noteStrings[note % 12];
      var detune = this.centsOffFromPitch(ac, note);
      if (detune === 0) {
        chunk["detune"] = "";
        chunk["detuneAmmount"] = -1;
      } else {
        if (detune < 0) {
          chunk["detune"] = "b";
        } else {
          chunk["detune"] = "#";
        }
        chunk["detuneAmmount"] = Math.abs(detune);
      }
      if (typeof this.receiver === 'function') {
        this.receiver(chunk);
      }
    }

    setTimeout(function() {
      self.updatePitch();
    }, 100);

    //        if (!window.requestAnimationFrame)
    //            window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    //        rafID = window.requestAnimationFrame(this.updatePitch);
  },
  noteFromPitch: function(frequency) {
    var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
  },
  frequencyFromNoteNumber: function(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  },
  centsOffFromPitch: function(frequency, note) {
    return Math.floor(1200 * Math.log(frequency / this.frequencyFromNoteNumber(note)) / Math.log(2));
  }
};
