"use strict";

;

(function ($, window, document, undefined) {
  "use strict";

  var pluginName = "amChannel",
      defaults = {};

  function Plugin(element, options) {
    this.element = element;
    this.$element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.days = {};
    this.currentShow = false;
    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function init() {
      var self = this;
      $(this.element).addClass('amp-channel');
      this.resetStage();
      this.refreshTimer = setInterval(function () {
        self.updateChannel();
      }, 60000);
      this.updateChannel();
    },
    resetStage: function resetStage() {
      if (this.stage) this.stage.remove();
      this.stage = $('<div></div>').appendTo(this.element);
    },
    render: function render() {
      var self = this;
      var show = this.getCurrentShowId();

      if (this.currentShow.id !== show.id || this.currentShow.revision !== show.revision) {
        $.getJSON(self.settings.apiServer + '/v1/broadcasts/show/' + show.id, {
          location: $('meta[name=location-id]').attr('content') || false
        }, function (json, textStatus) {
          self.resetStage();
          $(self.stage).amShow({
            scenes: json,
            overlay: self.days.overlay || false
          });
        });
      }

      if (this.currentShow && !show) {
        self.resetStage();
      }

      this.currentShow = show;
    },
    getCurrentShowId: function getCurrentShowId() {
      var show = false;
      var self = this;
      var now = moment();
      var today = now.format('dddd');
      var date = now.format('MM/DD/YYYY');
      var min = (parseInt(now.format('H')) * 60 + parseInt(now.format('m'))) * 60;

      if (this.days && this.days.specials && this.days.specials[date]) {
        $.each(this.days.specials[date], function (index, val) {
          if (min >= val.start && min < val.end) {
            show = val;
          }
        });
      }

      if (!show && this.days[today]) {
        $.each(self.days[today], function (index, val) {
          if (min >= val.start && min < val.end) {
            show = val;
          }
        });
      }

      return show;
    },
    updateChannel: function updateChannel() {
      var self = this;
      $.getJSON(self.settings.apiServer + '/v1/broadcasts/channel/' + this.settings.channel, function (json, textStatus) {
        self.days = json;
        self.render();
      });
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery, window, document);

;

(function ($, window, document, undefined) {
  "use strict";

  var pluginName = "amShow",
      defaults = {
    overlay: false,
    scenes: []
  };

  function Plugin(element, options) {
    this.element = element;
    this.$element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this._waitForContentCount = 0;
    this._sceneShouldBeFinished = 0;
    this._maxOutAnimationDuration = 0;
    this._playerCreated = 0;
    this._widgetCache = [];
    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function init() {
      var self = this;
      self.currentScene = 0;
      this.$element.addClass('amp-show');
      this.$element.css({
        backgroundColor: '#232323',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0',
        left: '0'
      });
      this.render();
    },
    checkHTML: function checkHTML(html) {
      if (typeof html !== 'undefined') {
        if (html.length > 0) {
          var d = $('<div />');
          d.innerHTML = html;
          return d.innerHTML.length > 0;
        }
      }

      return false;
    },
    getWidgetContent: function getWidgetContent(layer, id, loc, frame) {
      var self = this;
      loc = loc || $('meta[name=location-id]').attr('content');
      var ret = "";
      var d = {
        contentonly: 'yes',
        id: id,
        style: 'broadcast'
      };

      if (loc && loc.length > 0) {
        d.location = loc;
      }

      if (frame && frame == 0) {
        d.bodyonly = true;
      }

      $.ajax({
        url: '/widget',
        dataType: 'html',
        data: d
      }).done(function (html) {
        if (parseInt(id) > 0) {
          if (!self._widgetCache[id]) self._widgetCache[id] = '';

          if (self.checkHTML(html)) {
            self._widgetCache[id] = $(html);
            layer.html(self._widgetCache[id].clone());
            self.initWidget(layer);
          }
        }
      }).fail(function () {
        if (typeof self._widgetCache[id] !== 'undefined') {
          layer.html(self._widgetCache[id].clone());
          self.initWidget(layer);
        }
      });
    },
    initVideos: function initVideos(layer) {
      var self = this;
      $('.video-content', layer).each(function (index, el) {
        if ($(this).find('video').length > 0) return;
        $(this).css({
          width: '100%',
          height: '100%'
        });
        $(this).empty();
        var val = $(this).data('details');

        if (val.src && val.src.length > 0) {
          var $v = $('<video src="' + val.src + '"/>');
          $v.on("play", function () {
            self._waitForContentCount++;
          });
          $v.on("pause", function () {
            self._waitForContentCount--;
          });
          $v.on("ended", function () {
            self._waitForContentCount--;
            self.nextScene();
          });
          $v.css({
            width: '100%',
            height: '100%'
          });

          if (val.controls) {
            $v.attr('controls', 'controls');
          }

          if (val.loop) {
            $v.attr('loop', 'loop');
          }

          $v.attr('preload', val.preload);
          var video = $v[0];
          video.muted = val.muted;
          video.poster = val.src.replace('.mp4', '.jpg').replace('co.uploads', 'co.uploads.thumbnails').replace('/video/', '/thumbnails/');

          if (val.autoplay) {
            video.muted = true;
            video.play();
          }

          $(this).append($v);
        } else {
          $(this).addClass('background').append('<div>Please select a video in the properties</div>');
        }
      });
    },
    initWidget: function initWidget(layer) {
      var self = this;
      var settings = layer.data('settings');
      if (!settings) return;
      $('.ame-events-slideshow', layer).removeClass('ame-events-slideshow').addClass('ame-events-slideshow-embedded');
      var $slideShow = $('.ame-events-slideshow-embedded', layer);

      if ($slideShow.length > 0) {
        self._waitForContentCount++;
        $slideShow.removeAttr('data-cycle-next').removeAttr('data-cycle-prev').removeAttr('data-cycle-pause-on-hover');
        $('.ame-events-slideshow-button', layer).remove();
        $('.ame-events-slideshow-image, .ame-events-slideshow-info', $slideShow).height(self.$element.height());
        $slideShow.cycle({
          loop: 1
        }).one('cycle-finished', function (event) {
          setTimeout(function () {
            self._waitForContentCount--;
            self.nextScene();
          }, 0);
        }).on('cycle-after', function (event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
          self.updateFonts();
        });
      }

      var $events = $('.ame-brodcast-events', layer);

      if ($events.length > 0) {
        if (!$events.data('done')) {
          $events.data('done', true);
          self._waitForContentCount++;
          var pageTotal = $('.ame-brodcast-event-page', $events).length;
          $('[data-event-page=0]', $events).first().addClass('page-active');
          var currentPage = 0;
          var looper = setInterval(function () {
            currentPage++;

            if (currentPage >= pageTotal) {
              clearInterval(looper);
              self._waitForContentCount--;
              self.nextScene();
            } else {
              $('[data-event-page]', $events).removeClass('page-active');
              $('[data-event-page=' + currentPage + ']', $events).first().addClass('page-active');
              self.updateFonts();
            }
          }, 10000);
        }
      }

      var $nyplcollections = $('ul.nyplcollection', layer);

      if ($nyplcollections.length > 0) {
        if (!$nyplcollections.data('done')) {
          var render = function render(item) {
            $(title).text(item.data.title);
            $(creator).text(item.data.creator);
            $(dateCreated).text(item.data.dateCreated);
            $(division).text(item.data.division);
            $(imageId).text('Image ID:' + item.data.imageId);
            $('>div', image).css({
              'background-image': 'url("https://images.nypl.org/index.php?id=' + item.data.imageId + '&t=w")'
            });
            $('>div', qrcode).css({
              'background-image': 'url("https://chart.googleapis.com/chart?cht=qr&chl=' + encodeURIComponent(item.data.url) + '&chs=150x150&chf=bg,s,58595b&chco=58595b&chld=L|0")'
            });
            self.updateFonts();
          };

          var setItem = function setItem(item) {
            if (!item.data) {
              $.getJSON('/nyplitem?id=' + item.id).then(function (data) {
                if (data.numResults.$ === '0') {
                  item.notFound = true;
                  pos++;
                  setItem(items[pos]);
                  return;
                }

                var capture = Array.isArray(data.capture) ? data.capture.shift() : data.capture;
                var division = Array.isArray(data.mods.location) ? data.mods.location.filter(function (l) {
                  l.type === 'division';
                }).map(function (c) {
                  return c.physicalLocation.$;
                }).shift() : data.mods.location.physicalLocation.$;
                var originInfo = Array.isArray(data.mods.originInfo) ? data.mods.originInfo[0] : data.mods.originInfo;
                var name = Array.isArray(data.mods.name) ? data.mods.name[0] : data.mods.name;
                if (name) name = name.namePart.$;
                var titleInfo = Array.isArray(data.mods.titleInfo) ? data.mods.titleInfo[0] : data.mods.titleInfo;
                item.data = {
                  title: titleInfo.title.$,
                  dateCreated: originInfo.dateCreated ? originInfo.dateCreated.$ : originInfo.dateIssued.$,
                  creator: name,
                  division: division,
                  imageUUID: capture.uuid.$,
                  imageId: capture.imageID.$,
                  url: 'https://digitalcollections.nypl.org/items/' + capture.uuid.$ + '#/?uuid=' + capture.uuid.$
                };
                render(item);
              });
            } else {
              render(item);
            }
          };

          $nyplcollections.data('done', true);
          self._waitForContentCount++;
          $nyplcollections.parent().hide();
          var items = [];
          $('li', $nyplcollections).each(function (idx, item) {
            items.push({
              id: $(item).data('id')
            });
          });
          var pos = 0;
          var stage = $('<div>').addClass('nyplcollection-stage').css({
            'position': 'relative',
            'height': '100%',
            'width': '100%'
          }).appendTo(layer);
          var image = $('<div class="nyplcollection-image"><div></div></div>').appendTo(stage);
          var info = $('<div class="nyplcollection-info"><div></div></div>').appendTo(stage);
          var description = $('<div class="nyplcollection-description"><div></div></div>').appendTo(info);
          var title = $('<div class="nyplcollection-title"></div>').appendTo(description);
          var creator = $('<div class="nyplcollection-creator"></div>').appendTo(description);
          var dateCreated = $('<div class="nyplcollection-date-created"></div>').appendTo(description);
          var division = $('<div class="nyplcollection-division"></div>').appendTo(description);
          var imageId = $('<div class="nyplcollection-image-id"></div>').appendTo(description);
          var footer = $('<div class="nyplcollection-footer"></div>').appendTo(stage);
          var qrcode = $('<div class="nyplcollection-qrcode"><div></div></div>').appendTo(footer);
          $('<div class="nyplcollection-message"><div class="nyplcollection-message-title">Explore NYPL\'s Digital Collections</div><div>Get free access to more than 900,000 items digitized from our world-renowned collections, including prints, photographs, maps, manuscripts, video, and more, with new materials added every day.</div></div>').appendTo(footer);
          setItem(items[pos]);
          var looper = setInterval(function () {
            pos++;

            if (pos >= items.length) {
              clearInterval(looper);
              self._waitForContentCount--;
              self.nextScene();
            } else {
              setItem(items[pos]);
            }
          }, parseInt($nyplcollections.data('delay')));
        }
      }

      var $scroller = $('.ams-scrolling-box', layer);

      if ($scroller.length > 0) {
        if (!$scroller.data('done')) {
          $scroller.data('done', true);
          $scroller.height($scroller.closest('.layer').height());
          $scroller.mCustomScrollbar({
            axis: 'y',
            theme: 'rounded-dark',
            callbacks: {
              onOverflowY: function onOverflowY() {
                self._waitForContentCount++;
                var sh = $('>div', this)[0].scrollHeight;
                var h = $scroller.height();
                setTimeout(function () {
                  $scroller.mCustomScrollbar('scrollTo', 'bottom', {
                    scrollInertia: Math.floor(sh / h) * 15000,
                    scrollEasing: 'linear'
                  });
                }, 2000);
              },
              onTotalScroll: function onTotalScroll() {
                setTimeout(function () {
                  self._waitForContentCount--;
                  self.nextScene();
                }, 2000);
              }
            }
          });
        }
      }

      $('.headingtext', layer).css('color', settings.headingColour || '"rgb(255, 255, 255)"');
      $('.subheadingtext', layer).css('color', settings.subHeadingColour || '"rgb(255, 255, 255)"');
      $('.bodytext', layer).css('color', settings.textColour || '"rgb(255, 255, 255)"');

      try {
        $('.twitter', layer).each(function () {
          var username = $(this).attr('id');
          if (username.length === 0) return;
          $(this).tweet({
            modpath: '/tw/index.php',
            username: username,
            avatar_size: 48,
            count: 5,
            loading_text: 'loading twitter feed...'
          });
        });
      } catch (e) {}

      try {
        var self = this;
        $('.video_player').each(function () {
          function videoIdFromURL(url) {
            var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            var match = url.match(regExp);

            if (match && match[2].length == 11) {
              return match[2];
            } else {
              return false;
            }
          }

          var config_obj = $(this).data('video');

          if (typeof config_obj.video_service !== 'undefined' && config_obj.video_service == "Vimeo") {
            var this_widget = $(this)[0].parentNode.parentNode;
            var vidHeight = $(this_widget).css('height');
            var vidWidth = $(this_widget).css('width');
            var tag = document.createElement('script');
            tag.src = "https://player.vimeo.com/api/player.js";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            var waitForVimeo = function waitForVimeo(callback) {
              var checkVimeo = function checkVimeo() {
                if (typeof window.Vimeo === 'undefined') {
                  return false;
                } else {
                  return true;
                }
              };

              if (checkVimeo()) {
                callback();
              } else {
                var interval = setInterval(function () {
                  if (checkVimeo()) {
                    clearInterval(interval);
                    callback();
                  }
                }, 700);
              }
            };

            waitForVimeo(function () {
              var result = config_obj.vimeo_url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i);

              if (!(result && Array.isArray(result) && result[1])) {
                return;
              }

              if (self._playerCreated > 0) {
                return;
              } else {
                self._playerCreated++;
              }

              var video_id = result[1];
              var options = {
                id: video_id,
                width: vidWidth,
                height: vidHeight,
                loop: false
              };
              var player = new Vimeo.Player('player', options);
              player.on("loaded", function () {
                if (typeof config_obj.vimeo.start !== 'undefined' && config_obj.vimeo.start > 0) {
                  player.setCurrentTime(config_obj.vimeo.start);
                } else {
                  player.setCurrentTime(0);
                }

                if (config_obj.vimeo.autostart == "1") {
                  player.play();
                }
              });
              player.on("play", function (e) {
                self._waitForContentCount++;
                var endPoint = e.duration;

                if (typeof config_obj.vimeo.end !== 'undefined' && config_obj.vimeo.end) {
                  endPoint = config_obj.vimeo.end;
                }

                player.addCuePoint(endPoint, {
                  customKey: 'customValue'
                }).then(function (id) {})["catch"](function (error) {});
              });
              player.on("cuepoint", function (e) {
                player.removeCuePoint(e.id).then(function (id) {
                  player.pause();
                  self._playerCreated--;
                  self._waitForContentCount--;
                  self.nextScene();
                })["catch"](function (error) {});
              });

              if (config_obj.vimeo.captions == "1") {
                player.enableTextTrack('en').then(function (track) {})["catch"](function (error) {});
              } else if (config_obj.vimeo.captions == "0") {
                player.disableTextTrack().then(function () {})["catch"](function (error) {});
              }

              if (config_obj.vimeo.mute == "1") {
                player.setVolume(0);
              }
            });
          } else if (typeof config_obj.video_service === 'undefined' || config_obj.video_service == "YouTube") {
            if (self._playerCreated > 0) {
              return;
            } else {
              self._playerCreated++;
            }

            config_obj.yt['playlist'] = videoIdFromURL(config_obj.youtube_url);
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/player_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            var this_widget = $(this)[0].parentNode.parentNode;

            var play_yt = function play_yt() {
              var vidHeight = $(this_widget).css('height');
              var vidWidth = $(this_widget).css('width');
              var player = new YT.Player('player', {
                enablejsapi: "1",
                playerVars: config_obj.yt,
                height: vidHeight,
                width: vidWidth,
                videoId: videoIdFromURL(config_obj.youtube_url),
                events: {
                  'onApiChange': function onApiChange(event) {},
                  'onReady': function onReady(event) {
                    self._waitForContentCount++;
                  },
                  'onStateChange': function onStateChange(event) {
                    if (event.data == YT.PlayerState.PLAYING) {
                      if (typeof config_obj.caption_size !== 'undefined' && config_obj.caption_size !== 0) {
                        if (typeof player.setOption == 'function') {
                          player.setOption('captions', 'fontSize', config_obj.caption_size);
                        }
                      }
                    }

                    if (event.data == YT.PlayerState.ENDED) {
                      if (config_obj.youtube_loop != "1") {
                        self._waitForContentCount--;

                        if (typeof player.stopVideo() == 'function') {
                          player.stopVideo();
                        }

                        self._playerCreated--;
                        self.nextScene();
                      }
                    }
                  }
                }
              });
            };
          }

          if (window.initialPlay == false) {
            play_yt();
          }

          window.onYouTubePlayerAPIReady = function () {
            window.initialPlay = false;
            play_yt();
          };
        });
      } catch (e) {}

      self.updateFonts();
    },
    checkVisibleScenes: function checkVisibleScenes() {
      var self = this;
      var nextVisibleScene = -1;
      $(self.settings.scenes).each(function (i) {
        var startTime = self.settings.scenes[i].startTime;
        var endTime = self.settings.scenes[i].endTime;
        startTime = typeof startTime === "undefined" ? false : startTime;
        endTime = typeof endTime === "undefined" ? false : endTime;

        if (startTime && endTime) {
          if (moment().isBetween(startTime, endTime)) {
            if (nextVisibleScene === -1) {
              nextVisibleScene = i;
            }
          }
        } else if (startTime && !endTime) {
          if (moment().isSameOrAfter(startTime)) {
            if (nextVisibleScene === -1) {
              nextVisibleScene = i;
            }
          }
        } else if (!startTime && endTime) {
          if (moment().isSameOrBefore(endTime)) {
            if (nextVisibleScene === -1) {
              nextVisibleScene = i;
            }
          }
        } else if (!startTime && !endTime) {
          if (nextVisibleScene === -1) {
            nextVisibleScene = i;
          }
        }
      });
      return nextVisibleScene;
    },
    nextScene: function nextScene() {
      var self = this;
      var scene = JSON.parse(JSON.stringify(this.settings.scenes[this.currentScene]));

      if (scene.holdScene) {
        return;
      }

      if (self._waitForContentCount > 0) {
        return;
      }

      if (this._sceneShouldBeFinished == 0) {
        return;
      }

      if ($('.deferredOut').length) {
        $('.deferredOut').each(function (index, element) {
          $(element).addClass('animated').addClass($(element).data('outAnimation'), function () {
            $(this).removeClass('deferredOut');
          });
        }).promise().done(function () {
          setTimeout(function () {
            self.nextScene();
          }, self._maxOutAnimationDuration * 1000);
        });
        return;
      }

      self._waitForContentCount = 0;
      self.currentScene++;
      if (self.currentScene >= self.settings.scenes.length) self.currentScene = 0;
      var startTime = self.settings.scenes[self.currentScene].startTime;
      var endTime = self.settings.scenes[self.currentScene].endTime;
      startTime = typeof startTime === "undefined" ? false : startTime;
      endTime = typeof endTime === "undefined" ? false : endTime;

      if (startTime && endTime) {
        if (moment().isBetween(startTime, endTime)) {
          self.render();
        } else {
          self.nextScene();
        }
      } else if (startTime && !endTime) {
        if (moment().isSameOrAfter(startTime)) {
          self.render();
        } else {
          self.nextScene();
        }
      } else if (!startTime && endTime) {
        if (moment().isSameOrBefore(endTime)) {
          self.render();
        } else {
          self.nextScene();
        }
      } else if (!startTime && !endTime) {
        self.render();
      } else {
        self.nextScene();
      }
    },
    updateFonts: function updateFonts() {
      var self = this;
      $('>div', self.element).each(function (index, el) {
        $(el).css('font-size', self._getFontSize() + 'px');
      });
    },
    _getFontSize: function _getFontSize() {
      var self = this;
      return self.$element.innerWidth() / 350 * 8;
    },
    addLayers: function addLayers(layers) {
      var self = this;
      var length = 0;
      $.each(layers, function (index, val) {
        if (!val.duration) val.duration = 5;
        if (!val.delay) val.delay = 0;
        if (!val.animationDuration) val.animationDuration = 0.5;
        var t = val.animationDuration + val.delay + val.duration + 0.5;
        if (t > length) length = t;
        var layer = $('<div class="layer"></div>');

        if (val.type == 'background') {
          layer.prependTo(self.element);
        } else {
          layer.appendTo(self.element);
        }

        layer.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
          layer.css('opacity', val.css.opacity || 1).removeClass(val.inAnimation);
        });
        layer.attr('id', val.id);
        layer.css(val.css);
        layer.data('settings', val);
        layer.css({
          opacity: 0,
          position: 'absolute',
          overflow: 'hidden',
          'animation-duration': val.animationDuration + 's'
        });
        layer.attr('data-type', val.type);

        switch (val.type) {
          case 'text':
            layer.html(decodeURIComponent(val.text));
            layer.css('font-size', self._getFontSize() + 'px');
            break;

          case 'widget':
            self.getWidgetContent(layer, val.widget, val.location || false, val.frame || 1);
            break;

          case 'video':
            $('<div class="video-content"/>').data('details', val).appendTo(layer);
            self.initVideos(layer);
            break;

          default:
            break;
        }

        if (val.url && val.url.length > 0) {
          layer.css('cursor', 'pointer').on('click', function (event) {
            event.preventDefault();
            window.open(val.url, '_blank');
          });
          ;
        }

        if (val.inAnimation && val.inAnimation !== 'none') {
          setTimeout(function () {
            layer.addClass('animated').addClass(val.inAnimation);
          }, val.delay * 1000);
        } else {
          layer.css('opacity', val.css.opacity || 1);
        }

        if (val.outAnimation && val.outAnimation !== 'none') {
          setTimeout(function () {
            if (self._waitForContentCount > 0) {
              if (val.animationDuration > self._maxOutAnimationDuration) {
                self._maxOutAnimationDuration = val.animationDuration;
              }

              layer.addClass('deferredOut').data("outAnimation", val.outAnimation);
            } else {
              layer.addClass('animated').addClass(val.outAnimation);
            }
          }, (val.duration + val.delay) * 1000);
        }
      });
      return length;
    },
    render: function render() {
      var self = this;
      var scene = JSON.parse(JSON.stringify(this.settings.scenes[this.currentScene]));
      var nextScene = self.checkVisibleScenes();

      if (nextScene != -1) {
        if (nextScene >= this.currentScene) {
          this.currentScene = nextScene;
          scene = JSON.parse(JSON.stringify(this.settings.scenes[this.currentScene]));
        }
      } else {
        scene = JSON.parse('{"id":"FS5BC","layers":[{"id":"U418s","type":"text","css":{"width":"54.28%","height":"54.07%","top":"17.99%","left":"19.97%","color":"rgb(0,0,0)"},"text":"%3Cp%3E%3Cspan%20style%3D%22color%3A%20%23ffffff%3B%22%3ENo%20scenes%20are%20scheduled%20to%20be%20visible%20in%20this%20broadcast.%3C%2Fspan%3E%3C%2Fp%3E"},{"id":"jT7aG","type":"background","css":{"width":"100%","height":"100%","top":"0%","left":"0%","backgroundColor":"transparent","backgroundRepeat":"no-repeat","backgroundPosition":"0% 0%","backgroundImage":"","backgroundSize":"20%","display":"none"}}],"pos":1}');
        $('.ame-events-slideshow-embedded', this.$element).cycle('destroy');
        this.$element.empty();
        var length = this.addLayers(scene.layers.reverse());

        if (this.settings.overlay) {
          this.addLayers(this.settings.overlay);
        }

        return;
      }

      self._sceneShouldBeFinished = 0;
      $('.ame-events-slideshow-embedded', this.$element).cycle('destroy');
      this.$element.empty();
      var length = this.addLayers(scene.layers.reverse());

      if (this.settings.overlay) {
        this.addLayers(this.settings.overlay);
      }

      setTimeout(function () {
        self._sceneShouldBeFinished = 1;

        if (self._waitForContentCount < 1) {
          self.nextScene();
        }
      }, length * 1000);
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery, window, document);