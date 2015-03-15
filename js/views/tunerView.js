;
"use strict"; // jshint ;_;


var requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

var TunerView = Backbone.View.extend({
  initialize: function(opts) {
    this.options = opts;
    this.render();
    this.model.init();
    this.catchRecordedTones();
  },
  recordedTone: null,
  recordedToneCounter: null,
  recordedToneInterval: 100,
  recordedToneAmmount: 3,
  catchRecordedTones: function() {
    var self = this;
    var tone = this.model.get("noteStr");

    if (!tone) {
      this.recordedTone = null;
      this.recordedToneCounter = 0;
    } else if (tone === this.recordedTone) {
      this.recordedToneCounter = this.recordedToneCounter + 1;
    } else {
      this.recordedTone = tone;
      this.recordedToneCounter = 0;
    }

    if (this.recordedToneCounter === this.recordedToneAmmount) {
      console.log("ok", tone);
      if (typeof this.options.parent.shutLetterDown !== 'undefined') {
        this.options.parent.shutLetterDown.call(this.options.parent, tone);
      }
    }

    setTimeout(function() {self.catchRecordedTones.call(self)}, this.recordedToneInterval);
  },
  checkMetrics: function() {
    this.step = 1; //animation step

    this.holderWidth = this.$holder.width();
    this.toneWidth = this.$el.find(".tone-0").width();
  },
  render: function() {
    // Compile the template using underscore
    var template = _.template($("#tuner-template").html());
    // Load the compiled HTML into the Backbone "el"
    this.$el.html(template({}));

    this.$letter = this.$el.find(".letter");
    this.$cents = this.$el.find(".cents");

    this.$detuneLines = {
      "#50": this.$el.find(".s50"),
      "#40": this.$el.find(".s40"),
      "#30": this.$el.find(".s30"),
      "#20": this.$el.find(".s20"),
      "#10": this.$el.find(".s10"),
      "b50": this.$el.find(".b50"),
      "b40": this.$el.find(".b40"),
      "b30": this.$el.find(".b30"),
      "b20": this.$el.find(".b20"),
      "b10": this.$el.find(".b10"),
      "#0": this.$el.find(".s0"),
      "b0": this.$el.find(".b0")
    };


    this.animate();

    this.model.on('change:noteStr', function() {
      this.noteStr = this.model.get("noteStr");
    }, this);

    this.model.on('change:confident', function() {
      this.confident = this.model.get("confident");
    }, this);

    this.model.on('change:detune', function() {
      this.detune = this.model.get("detune");
    }, this);

    this.model.on('change:detuneAmmount', function() {
      this.detuneAmmount = this.model.get("detuneAmmount");
    }, this);
  },
  animate: function() {
    var self = this;

    if (this.confident) {
      this.$el.addClass("confident");
      this.$letter.html(this.noteStr);
      if (this.detune !== "") {
        var detuneRounded = Math.round(this.detuneAmmount / 10) * 10;
        // console.log(this.detuneAmmount, detuneRounded, this.detune);

        this.$cents.html((detuneRounded === 0 ? "-" : this.detune) + " " + detuneRounded);

        if (this.$detuneLine) {
          this.$detuneLine.removeClass("it")
        }

        this.$detuneLine = this.$detuneLines[this.detune + detuneRounded]
        this.$detuneLine.addClass("it")

      } else {
        this.$cents.html("-");

        if (this.$detuneLine) {
          this.$detuneLine.removeClass("it")
        }
      }
    } else {
      this.$el.removeClass("confident");

      this.$letter.html("-");
      this.$cents.html("-");
    }

    requestAnimFrame(function() {
      self.animate.call(self);
    });

  }
});
