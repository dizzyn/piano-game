;
"use strict"; // jshint ;_;

var GameView = Backbone.View.extend({
    initialize: function (opts) {
        this.options = opts;
        this.render();
    },
    render: function () {
        // Compile the template using underscore
        var template = _.template($("#game-template").html());
        // Load the compiled HTML into the Backbone "el"
        this.$el.html(template({}));
        var $instrument = this.$el.find("#instrument");
        $instrument.addClass("piano");
        this.pianoView = new PianoView({el: $instrument, parent: this});

        this.updateView();
    },
    setMainWidth: function (width) {
        var $main = this.$el.find(".main");
        $main.css("width", width + "px")
    },
    events: {
        "click .btn-start": "startGame",
        "click .btn-close": "closeGameOverPopup"
    },
    updateView: function () {
//        var $score = this.$el.find(".score");
//
//        if (this.level > -1) {
//            $score.show().find(".number");
//        } else {
//            $score.hide();
//        }

        this.$el.find(".val-level").text(this.level);
    },
    getReady: function () {
        this.$el.find(".btn-start").fadeIn(500);
    },
    startGame: function () {
        var self = this;
//        console.log("START");
        var $popup = this.$el.find(".game-over-popup").fadeOut(500);
        this.level = 0;
        this.step = 0;
        this.ingame = true;
        this.$el.addClass("switch-ingame");
        this.keyCount = 0;
        this.turn = 'me';
        this.$el.removeClass("turn-you");
        this.$el.addClass("turn-me");
        this.tones = [];
        this.updateView();
//        console.log("Zacinam ja", this.tones.length)
        setTimeout(function () {
            self.autoPlay();
        }, 500);
    },
    canPlay: function () { //in the game when the computers plays the instrument is disabled
        return (!this.ingame || this.turn === 'you');
    },
    presssedPlay: function (key) {
        var self = this;
        var $score = this.$el.find(".score");
        if (this.ingame) {
            if (this.turn === 'you') { //if we are in game

                if (key == this.tones[this.step]) { //right answer

                    if (self.step < self.level) { //not the last step of a level
                        self.keyCount = self.keyCount + 1;
                        self.step = self.step + 1;
//                        console.log("Ok, pokracuj");
                    } else { // the last step of a level
                        self.keyCount = self.keyCount + 1;
                        setTimeout(function () {
                            self.level = self.level + 1;
//                            if (self.level > 2) {
                            if (self.level > 23) {
                                self.$el.addClass("switch-winner");
                            }
                            self.step = 0;
                            self.turn = 'me';
                            self.$el.removeClass("turn-you");
                            self.$el.addClass("turn-me");
                            self.updateView();
                        }, 400);
                        setTimeout(function () {
//                            console.log("Ted hraju ja");
                            self.autoPlay();
                        }, 1500);
                    }

                } else { //wrong answer
                    self.ingame = false;
                    self.$el.removeClass("switch-ingame");

                    self.showGameOverPopup();
//                    console.log("Konec");
                }
            } //turn = you
        } //in game 
    },
    getVolumePerStep: function () {
        if (this.ingame) {

            if ((this.step + 4) % 4 === 0) {
                return 1;
            } else if ((this.step + 2) % 2 === 0) {
                return .8;
            } else {
                return .6;
            }
        } else {
            return 1;
        }
    },
    autoPlay: function () {
        var self = this;
        if (self.tones.length < self.level + 1) {
            self.tones = generateTones(self.tones);
        }

        var tone = self.tones[self.step];

        var displayKey = true;

        this.pianoView.play(tone, displayKey);

        self.step = self.step + 1;

        $(".note-step.active").removeClass("active");
        $("#note-step-" + self.step).addClass("active");

        if (self.step < self.level + 1) {
            setTimeout(function () {
                self.autoPlay();
            }, 1000);
        } else {
            setTimeout(function () {
                self.step = 0;
                self.turn = 'you';
                self.$el.removeClass("turn-me");
                self.$el.addClass("turn-you");
            }, 500);

//                console.log("Ted hrajes ty")
        }
        self.updateView();
    },
    closeGameOverPopup: function () {
        var $popup = this.$el.find(".game-over-popup");
        $popup.hide();
        this.level = -1;
        this.ingame = false;
        this.$el.removeClass("in-game");

        this.updateView();
    },
    showGameOverPopup: function () {
        var self = this;

        var $popup = this.$el.find(".game-over-popup");
        $popup.fadeIn(500);
        self.updateView();

        $popup.find(".msg").hide();
        if (self.level === 0) {
            $popup.find(".msg-lev-0").show();
        } else if (self.level === 1) {
            $popup.find(".msg-lev-1").show();
        } else {
            $popup.find(".msg-lev-more").show();
        }

        //
        // Twitter sharing
        var randomid = "twitter-wjs" + new Date();
        var sharingPlace = document.getElementById('share-score');
        var src = '<a href="https://twitter.com/share"';
        src += 'class="twitter-share-button"';
        src += 'data-text="I can remember ' + (self.level) + ' tones at Instrument Hero - game that trains your music skills!"';
        src += 'data-via="Instrument_Hero"';
        src += 'data-url="http://instrumenthero.com/">Tweet</a>';
        sharingPlace.innerHTML = src;

        setTimeout(function () {
            !function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                if (!d.getElementById(id)) {
                    js = d.createElement(s);
                    js.id = id;
                    js.src = p + '://platform.twitter.com/widgets.js';
                    fjs.parentNode.insertBefore(js, fjs);
                }
            }(document, 'script', randomid);
        }, 1000);
    }
});
