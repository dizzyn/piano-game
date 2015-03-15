;
"use strict"; // jshint ;_;

var SupergameView = Backbone.View.extend({
  letters: ['C', 'G', 'E'],
  height: 0,
  columnCount: 8,
  columns: [],
  columnWidth: 0,
  columnHeight: 0,
  $plan: null,
  data: {}, //catched real sounds
  spaceship: { //carrier properties
    column: 4,
    $node: null
  },
  initialize: function(opts) { // prepare plan
    var self = this;

    // Compile the template using underscore
    var template = _.template($("#supergame-template").html());
    // Load the compiled HTML into the Backbone "el"
    this.$el.html(template({})).addClass("supergame");

    this.detecor = new PitchDetect();
    this.detecor.receiver = function(data) {
        self.data = data;
    }
    this.catchRecordedTones();

    this.options = opts;

    this.$plan = this.$el.find(".plan");

    this.spaceship.$node = this.$el.find(".spaceship");

    for (var i = this.columnCount - 1; i > -1; i--) {
      this.columns.unshift({
        $node: $("<div>").addClass("column").attr("id", "c" + i).prependTo(this.$plan),
        items: [],
        shot: null
      });
    }

    this.columnWidth = this.columns[0].$node.outerWidth(true); //column width
    this.columnHeight = this.columns[0].$node.height(); //column height

    this.$plan.css("width", this.columnCount * this.columnWidth + "px"); //set game width

    //
    //
    //recount
    window.setInterval(function() {
      self.recount.call(self);
    }, this.clock);

    //
    //
    //animate
    window.requestAnimFrame = (function() {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
    })();

    (function animloop(time) {
      window.requestAnimFrame(animloop);
      self.animate(time);
    })();

    //
    //
    //keypress
    var checkKey = function(e) {

      var l = String.fromCharCode(e.charCode);

      self.shutLetterDown(l);
    };

    $(document).keypress(checkKey);

  },
  clock: 20,
  counter: 0,
  recount: function() {
    // each clock tick - increase position of all elements
    for (var i = 0; i < this.columns.length; i++) {
      var column = this.columns[i];

      for (var j = column.items.length - 1; j > -1; j--) {
        var item = column.items[j];

        if (item.pos >= 999) { // item colision
          column.items.splice(j, 1);
          item.$node.remove();
        } else { // item movement
          item["pos"] = item["pos"] + 2;
        }
      }
    }

    //each x click - add new item
    if (this.counter !== 0 && this.counter % 190 === 0) {
      this.addNewItem();
    }

    //spaceship animation
    if (this.spaceship.column > -1) {
      this.spaceship.$node.css("left", this.spaceship.column * this.columnWidth + "px");
    }

    this.counter = this.counter + 1;

  },
  animate: function(time) {
    for (var i = 0; i < this.columnCount; i++) {
      var column = this.columns[i];

      for (var j = column.items.length - 1; j > -1; j--) {
        var item = column.items[j];

        item.$node.css("top", (this.columnHeight / 1000) * item.pos - (this.columnHeight / 1000) * item.size);
      }
    }

  },
  addNewItem: function() {
    var colId = Math.floor(Math.random() * this.columnCount);
    var letter = this.letters[Math.floor(Math.random() * this.letters.length)];
    //if is posible to add
    this.columns[colId].items.push({
      letter: letter,
      column: colId,
      size: 100,
      pos: 0,
      $node: $("<div>").addClass("item").css("height", (this.height / 1000) * 100).html(letter).appendTo(this.columns[colId].$node)
    });
  },
  shutLetterDown: function(ch) {
    var found = null;

    // each clock tick - increase position of all elements
    for (var i = 0; i < this.columnCount; i++) {
      var column = this.columns[i];

      for (var j = column.items.length - 1; j > -1; j--) {
        var item = column.items[j];

        if (item.letter === ch) {

          if (found !== null) {
            if (item.pos > found.pos) { //another and lower
              found = item;
            }
          } else { // first
            found = item;
          }
        }
      }
    }

    if (found) {
      this.spaceship.column = found.column;
    }
  },
  recordedTone: null,
  recordedToneCounter: null,
  recordedToneInterval: 100,
  recordedToneAmmount: 3,
  catchRecordedTones: function() {
    var self = this;
    var tone = this.data["noteStr"];

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
      self.spaceship.$node.html(tone);
      self.shutLetterDown.call(self, tone);
    }

    setTimeout(function() {self.catchRecordedTones.call(self)}, this.recordedToneInterval);
  }
});
