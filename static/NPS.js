function NPS (opts) {
  if (!(this instanceof NPS)) {
    return new NPS(opts);
  }
  var _this = this;

  if (this._get_cookie('NPS_sended') === '1') {
    return;
  }

  if (Math.random() >= opts.showRate {
    this._set_cookie('NPS_sended', '1');
    return;
  }
  
  this._opts = opts;
  this._fadeDuration = 300;

  _this._init(opts);
}

NPS.prototype._get_cookie = function (name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
NPS.prototype._set_cookie = function (name, value) {
  document.cookie = name + "=" + value + ";path=/";
}

NPS.prototype._init = function (opts) {

  this._makeView(opts);
}

NPS.prototype._makeView = function (opts) {
  var _this = this;

  this.$node = $("<div/>")
    .addClass("NPS");

  var $content = this.$content = $("<div/>")
    .addClass("NPS__content")
    .appendTo(this.$node);

  $("<div/>")
    .addClass("NPS__message")
    .text(opts.message)
    .appendTo($content);

  var $likeTitles = $("<div/>")
    .addClass("NPS__like-titles")
    .appendTo($content);

  $("<div/>")
    .addClass("NPS__not-like-title")
    .text(opts.notLikeTitle)
    .appendTo($likeTitles);
  $("<div/>")
    .addClass("NPS__like-title")
    .text(opts.likeTitle)
    .appendTo($likeTitles);

  $("<div/>")
    .addClass("NPS__like-title--mobile")
    .text(opts.likeTitle)
    .appendTo($content);

  var $buttons = $("<div/>")
    .addClass("NPS__buttons")
    .appendTo($content);
  var $buttonsMobile = $("<div/>")
    .addClass("NPS__buttons--mobile")
    .appendTo($content);
  
  for (var i = 0; i <= 10; ++i) {
    var $buttonContainer = $("<div/>")
      .addClass("NPS__button-container")
      .addClass("n"+i)
      .appendTo($buttons);
    var $button = $("<div/>")
      .addClass("NPS__button")
      .addClass("n"+i)
      .text(i)
      .appendTo($buttonContainer);
      (function () {
        var rate = i;
        $button.click(function () {
          _this._vote = rate.toString();
          if (rate <= 5) {
            _this._showFeedback();
          } else {
            _this._send(rate);
            _this._hide();
          }
        });
      })();    

    var mi = 10 - i
    var $buttonContainerMobile = $("<div/>")
      .addClass("NPS__button-container")
      .addClass("n"+mi)
      .appendTo($buttonsMobile);
    var $mobileButton = $("<div/>")
      .addClass("NPS__button")
      .addClass("n"+mi)
      .text(mi)
      .appendTo($buttonContainerMobile);
      
      (function () {
        var rate = mi;
        $mobileButton.click(function () {
          _this._vote = rate.toString();
          if (rate <= 5) {
            _this._showFeedback();
          } else {
            _this._send(rate);
            _this._hide();
          }
        });
      })();   
  }

  $("<div/>")
    .addClass("NPS__not-like-title--mobile")
    .text(opts.notLikeTitle)
    .appendTo($content);

  $("<div/>")
    .addClass("NPS__close")
    .appendTo(this.$node)
    .click(function () {
      // _this._send('Close');
      // _this._vote = "close";
      _this._hide();
    });

  this.$node.hide().fadeIn(this._fadeDuration);
  $("body").append(this.$node);
}

NPS.prototype._showFeedback = function () {
  if (this._opts.isFeedbackEnabled !== true) {
    this._hide();
    return;
  }

  var _this = this;

  this.$content.html("");

  $("<div/>")
    .addClass("NPS__feedback-title")
    .text(this._opts.feedbackTitle)
    .appendTo(this.$content);

  var $feedbackTextareaContainer = $("<div/>")
  .addClass("NPS__feedback-textarea-container")
  .appendTo(this.$content);
  var $feedbackTextarea = $("<textarea/>")
    .addClass("NPS__feedback-textarea")
    .attr("id", "feedbackTextarea")
    .appendTo($feedbackTextareaContainer);

  $("<button/>")
    .addClass("NPS__feedback-send")
    .text("SEND")
    .appendTo(this.$content)
    .click(function () {
      _this._hide();
      _this._send(_this._vote, $feedbackTextarea.val());
    });
}

NPS.prototype._hide = function () {
  this.$node.fadeOut(this._fadeDuration);
}

NPS.prototype._send = function (thevote, reaction) {
    if (this._isSended != null) {
        return;
    }

    let data = {
        user_action: "" + thevote, // NYA
    }

    if (reaction != undefined) {
        data.feedback = reaction;
    }

    $.ajax({
        type: "POST",
        url: this._opts.endpoint,
        crossDomain: true,
        data: JSON.stringify(data),
        dataType: "json",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });


  this._isSended = true;
  this._set_cookie('NPS_sended', '1');
}
