;
"use strict"; // jshint ;_;

var TunerView = Backbone.View.extend({
    tones: ["a", "a#", "b", "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#"],
    initialize: function (opts) {
        this.options = opts;
        this.render();
        this.model.init();
    },
//        console.log(this.model.get("noteStr"), (Math.round(this.model.get("note") % 12)));
    checkMetrics: function () {
        this.step = 1; //animation step

        this.holderWidth = this.$holder.width();
        this.toneWidth = this.$el.find(".tone-0").width();
    },
    render: function () {
        var self = this;
        // Compile the template using underscore
        var template = _.template($("#tuner-template").html());
        // Load the compiled HTML into the Backbone "el"
        this.$el.html(template({}));

        this.$holder = this.$el.find(".holder");
        this.$slider = this.$el.find(".slider");

        var $toneTemplate = this.$el.find(".tone-template");

        for (var i = 0; i < this.tones.length; i++) {
            var tone = this.tones[i];
            var $tone = $toneTemplate.clone().removeClass("tone-template").addClass("tone tone-" + i);
            $tone.find(".letter").html(tone);
            this.$slider.append($tone);
        }

        this.checkMetrics();
        this.animate();
        this.model.on('change:note', function () {
            tone = (Math.round(this.model.get("note") % 12));
            if (tone > -1) {
                this.tone = tone;
            }
            console.log(this.tone);
        }, this);
    },
    tone: 4,
    animate: function () {
        var self = this;
        if (this.tone > -1) {
            var $tone = $(".tone-" + this.tone);

            var targetPos = (this.toneWidth / 2) + $tone.position().left;

            var pos = (this.holderWidth / 2) + this.$slider.scrollLeft();

            if (pos === targetPos) { //we are there
                 //do nothing
            } else if (pos < targetPos) { //go right
                this.$holder.scrollLeft(this.$holder.scrollLeft() + this.step);
            } else { //go left
                this.$holder.scrollLeft(this.$holder.scrollLeft() - this.step);
            }
        }

        var requestAnimFrame = (function () {
            return  window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) {
                        window.setTimeout(callback, 1000 / 60);
                    };
        })();

        requestAnimFrame(function () {
            console.log('zde');
            self.animate.call(self);
        });

    }
});