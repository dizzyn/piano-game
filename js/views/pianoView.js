;
"use strict"; // jshint ;_;

var PianoView = Backbone.View.extend({
  initialize: function(opts) {
    this.options = opts;
    this.render();
  },
  render: function() {
    var self = this;
    // Compile the template using underscore
    var template = _.template($("#piano-template").html());
    // Load the compiled HTML into the Backbone "el"
    this.$el.html(template({}));

    if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false) {
      this.$el.find(".ios-popup").show().find(".btn-ios-load").click(function() {
        self.renderPiano();
        self.$el.find(".ios-popup").hide();
      });
    } else {
      self.renderPiano();
    }
  },
  renderPiano: function() {
    var self = this;
    this.$el.addClass("not-loaded-piano")
    var $keys = this.$el.find(".keys");

    var whiteKeySpace = 10;
    var whiteKeyWidth = 80;
    var blackKeyWidth = 60;

    var whiteOffset = 0;

    for (var i = 0; i < keyRefs.length; i++) {
      var key = keyRefs[i];

      key.mp3Url = "tones/piano_" + key.name + ".mp3";

      if (key.color === 'white') {
        key.left = whiteOffset;
        key.width = whiteKeyWidth;
        whiteOffset += whiteKeyWidth + whiteKeySpace;
      } else {
        key.left = whiteOffset - (whiteKeySpace / 2) - (blackKeyWidth / 2);
        key.width = blackKeyWidth;
      }

      var $key = $("<li>").addClass('not-loaded').addClass("key").addClass(key.color).attr("id", "key-" + key.name);
      $key.data("tone", key.name);
      $keys.append($key);

      self.loadTone(key.name, $key);

      //
      // Mouse events
      window.mouseIsDown = false;

      $(document).on("mouseup", function() {
        //                console.log("up");
        window.mouseIsDown = false;
      });

      (function(key, $key) {
        $key.on("touchstart", function(e) {
          //                    console.log("touch start");

          if (self.options.parent.canPlay()) {
            $key.addClass("active");
            self.play(key.name);
            self.options.parent.presssedPlay(key.name);
            setTimeout(function() {
              $key.removeClass("active");
            }, 300);
          }

          e.preventDefault();
        });

        $key.on("touchend", function(e) {
          //                    console.log("touch end");
          e.preventDefault();
        });

        $key.on("touchenter", function(e) {
          //                    console.log("touch enter");
          e.preventDefault();
        });

        //                $key.on("tap", function (e) {
        //                    console.log("tap");
        //                    e.preventDefault();
        //                });

        //                $key.on("touchmove", function (e) {
        //                    console.log(key.name, $(this).attr("id"));
        //                    console.log("touch move");
        //                    e.preventDefault();
        //                });

        $key.on("mousedown", function(e) {
          //                    console.log("mouse down");
          if (self.options.parent.canPlay()) {
            $key.addClass("active");
            self.play(key.name);
            self.options.parent.presssedPlay(key.name);
          }

          window.mouseIsDown = true;
        });

        $key.on("click", function(e) {
          //                    console.log("click")
          if (self.options.parent.canPlay()) {
            $key.addClass("active");
            setTimeout(function() {
              $key.removeClass("active");
            }, 300);
          }
        });

        $key.on("mouseleave", function() {
          //                    console.log("mouse leave")
          $key.removeClass("active");
        });

        $key.on("mouseup", function(e) {
          //                    console.log("mouse up")
          $key.removeClass("active");
        });

        $key.on("mouseenter", function() {
          //                    console.log("mouse enter")
          if (window.mouseIsDown) { //if is pressed
            if (self.options.parent.canPlay()) {
              $key.addClass("active");
              self.play(key.name);
              self.options.parent.presssedPlay(key.name);
            }
          }
        });
      })(key, $key);

      $key.css("width", key.width + "px");
      $key.css("left", key.left + "px");
    }

    //        setTimeout(function () {
    //            self.checkIfTonesAreLoaded();
    //        }, 3000);

    this.options.parent.setMainWidth(whiteOffset - whiteKeySpace);

  },
  //    checkIfTonesAreLoaded: function () {
  //        var self = this;
  //
  //        var itemsToBeLoaded = $(".key.not-loaded");
  //        for (var i = 0; i < itemsToBeLoaded.length; i++) {
  //            var $key = $(itemsToBeLoaded[i]);
  //            var tone = $key.data("tone");
  //            self.loadTone(tone, $key)
  //
  //            if (i === itemsToBeLoaded.length - 1) {
  //                setTimeout(function () {
  //                    self.checkIfTonesAreLoaded();
  //                }, 3000);
  //            }
  //
  ////            console.log("zachrana", tone);
  //        }
  //    },
  loadTone: function(tone, $key) {
    var self = this;

    window["piano-" + tone] = new Howl({
      urls: [
        "tones/piano_" + tone + ".ogg",
        "tones/piano_" + tone + ".mp3",
        "tones/piano_" + tone + ".wav"
      ],
      onload: function() {
        $key.removeClass("not-loaded");

        var len = $(".key.not-loaded").length;

        self.$el.find(".progress-bar span:lt(" + (12 - len) + ")").addClass("active");
        if (len === 0) {
          setTimeout(function() {
            self.$el.removeClass("not-loaded-piano")
            self.options.parent.getReady();
          }, 2000);
        }
      }
    });

    //        var audio = new Audio("tones/piano_" + tone + "." + window["audio-ability"]);
    //
    //        audio.oncanplay = function () {
    //            $key.removeClass("not-loaded");
    //
    //            var len = $(".key.not-loaded").length;
    //
    //            self.$el.find(".progress-bar span:lt(" + (12 - len) + ")").addClass("active");
    //
    //            if (len === 0) {
    //                setTimeout(function () {
    //                    self.$el.removeClass("not-loaded-piano")
    //                    self.options.parent.getReady();
    //                }, 2000);
    //            }
    //            window["piano-" + tone] = audio;
    //        }

    //        audio.load();
  },
  play: function(tone, vizualize, volume) {

    var $key = $('#key-' + tone);
    if ($key.hasClass("not-loaded") || !window["piano-" + tone]) {
      this.loadTone(tone, $key);
      return false;
    }

    if (vizualize) {
      $key.addClass("active");
      setTimeout(function() {
        $key.removeClass("active");
      }, 500);
    }
    var tone = window["piano-" + tone];

    tone.volume(this.options.parent.getVolumePerStep());

    tone.pos(0.05);
    tone.play();
  }
});
