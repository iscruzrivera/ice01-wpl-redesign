"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CoUtils = function () {
  function CoUtils() {
    _classCallCheck(this, CoUtils);

    this.changed = false;
    this.changetimeout = 0;
    this.savingData = false;
  }

  _createClass(CoUtils, [{
    key: "addButton",
    value: function addButton(selector, label, btnclass, callback, extras, parent, attrs) {
      var $btn = false;
      var attributes = [];

      if (typeof attrs !== 'undefined') {
        attributes = attrs;
      }

      if ($.type(extras) === 'array') {
        var $holder = $('<div class="btn-group"></div>');
        $btn = $('<button class="btn ' + btnclass + '">' + label + '</button>');
        $btn.on('click', callback);
        $holder.append($btn);
        $holder.append('<button class="btn ' + btnclass + ' dropdown-toggle" data-toggle="dropdown"><i class="fa fa-caret-down"></i>&nbsp;</button>');
        var $list = $('<ul class="dropdown-menu" style="right: 0; left: auto;"></ul>');
        $holder.append($list);

        for (var i in extras) {
          var $li = $('<li></li>');
          var $link = $('<a href="#">' + extras[i].label + '</a>');
          $link.on('click', extras[i].action);
          $li.append($link);
          $list.append($li);
        }

        if (parent) {
          $(selector, parent).append($holder);
        } else {
          $(selector).append($holder);
        }
      } else {
        $btn = $("<button class='btn " + btnclass + "'>" + label + '</button>');
        $btn.on('click', callback);

        if (parent) {
          $(selector, parent).append($btn);
        } else {
          $(selector).append($btn);
        }
      }

      if (Array.isArray(attrs)) {
        for (var a = 0; a < attributes.length; a++) {
          var attr = attributes[a];
          $btn.attr(attr.name, attr.value);
        }
      }

      return $btn;
    }
  }, {
    key: "addBreadcrumbs",
    value: function addBreadcrumbs(crumbs) {
      $('.breadcrumbgrp').empty();

      for (var i in crumbs) {
        if (sandbox === 1 && crumbs[i].text === 'Home') crumbs[i].text = 'Sandbox';
        if (crumbs[i].text === undefined) return;
        var $crumb = false;

        if (crumbs[i].sublist) {
          var id = makeid();
          $crumb = $('<span class="btn btn-crumb"></span>');
          $crumb.append('<a data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" id="' + id + '" href="#">' + crumbs[i].text + ' <span class="caret"></span></a>');
          var $menu = $('<ul class="dropdown-menu" aria-labelledby="' + id + '"></ul>');

          for (var v in crumbs[i].sublist) {
            $menu.append("<li><a class='crumb-nav-link' href='" + v + "'>" + crumbs[i].sublist[v] + '</a></li>');
          }

          $crumb.append($menu);
        } else {
          $crumb = $('<a class="btn btn-crumb" href="' + crumbs[i].link + '">' + crumbs[i].text + '</a>').attr('id', makeid());
        }

        $('.breadcrumbgrp').append($crumb);
      }
    }
  }, {
    key: "cancelChanges",
    value: function cancelChanges() {
      if (this.changetimeout) clearTimeout(this.changetimeout);
      this.changed = false;
    }
  }, {
    key: "changedHappend",
    value: function changedHappend(itm) {
      var _this = this;

      if (this.changetimeout) clearTimeout(this.changetimeout);
      this.changetimeout = setTimeout(function () {
        if (!_this.savingData) {
          _this.changed = true;
        } else {
          _this.changed = false;
        }
      }, 200);
    }
  }, {
    key: "confirmBox",
    value: function confirmBox(title, message, opencallback, closecallback, yeslabel, nolabel) {
      if (!yeslabel) yeslabel = '<i class="fa fa-check"></i> ok';
      if (!nolabel) nolabel = 'cancel';
      this.openDialogWithMessage(title, message, [{
        classname: 'btn btn-save',
        label: yeslabel,
        action: function action() {
          this.closeDialog(true);
        }
      }, {
        classname: 'btn btn-edit',
        label: nolabel,
        action: function action() {
          this.closeDialog(false);
        }
      }], opencallback, closecallback);
    }
  }, {
    key: "confirmChanges",
    value: function confirmChanges() {
      this.changed = false;
    }
  }, {
    key: "contentLoaded",
    value: function contentLoaded() {
      $('.track').each(function () {
        switch ($(this).prop('tagName')) {
          case 'INPUT':
          case 'SELECT':
          case 'TEXTAREA':
            $(this).on('propertychange keyup input paste', function () {
              changedHappend(this);
            });
            break;

          default:
            if (console) console.log('unknown tagName', $(this).prop('tagName'));
            break;
        }
      });
      this.initToolTips();
    }
  }, {
    key: "initToolTips",
    value: function initToolTips() {
      $('label[tip]').qtip({
        show: {
          delay: 500
        },
        hide: {
          fixed: true
        },
        content: {
          attr: 'tip'
        },
        position: {
          target: 'mouse',
          my: 'bottom left',
          at: 'top right',
          adjust: {
            mouse: false
          }
        },
        style: {
          classes: 'qtip-shadow helptextbody'
        }
      });
    }
  }, {
    key: "showAlert",
    value: function showAlert(message, callback) {
      if (typeof callback === 'undefined') {
        callback = null;
      }

      if ($.type(message) === 'object') {
        this.showNotification(message.title, message.message, message.type, message.timeout, callback);
      } else {
        this.showNotification('Success', message, 'success');
      }
    }
  }, {
    key: "showNotification",
    value: function showNotification(title, message, classname, timeout, callback) {
      if (timeout === undefined) timeout = 2500;
      var $notice = $('<div class="notification"><div class="title">' + title + '</div><div class="message">' + message + '</div></div>');
      $('body').append($notice);
      if (classname) $notice.addClass(classname);

      if (timeout) {
        $notice.slideDown(200).delay(timeout).slideUp(200, function () {
          $(this).remove();

          if (typeof callback === 'function') {
            callback();
          }
        });
      } else {
        $notice.slideDown(200);
      }

      return $notice;
    }
  }, {
    key: "startMiniEditor",
    value: function startMiniEditor(selector, width, resize, defaultPath) {
      if (!width) width = 400;
      if (!resize) resize = 'horizontal';
      if (tinymce.EditorManager.get(selector.substring(1))) tinymce.EditorManager.get(selector.substring(1)).remove();
      return tinymce.init({
        branding: false,
        selector: selector,
        convert_urls: false,
        theme: 'modern',
        width: width,
        height: 100,
        resize: resize,
        plugins: ['advlist autolink lists link image charmap anchor hr', 'searchreplace visualblocks code fullscreen', 'insertdatetime media table contextmenu paste textcolor colorpicker'],
        image_title: true,
        menubar: false,
        toolbar: 'undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor',
        paste_as_text: true,
        moxiemanager_title: 'Choose a file',
        moxiemanager_path: defaultPath,
        external_plugins: {
          moxiemanager: '/moxiemanager/plugin.min.js'
        }
      });
    }
  }, {
    key: "startEditor",
    value: function startEditor(selector, defaultPath, forceNewLines) {
      if (typeof forceNewLines === 'undefined') var forceNewLines = true;
      if (tinymce.EditorManager.get(selector.substring(1))) tinymce.EditorManager.get(selector.substring(1)).remove();
      tinymce.init({
        branding: false,
        selector: selector,
        convert_urls: false,
        theme: 'modern',
        width: '100%',
        height: 300,
        resize: 'horizontal',
        valid_elements: '*[*]',
        plugins: ['advlist autolink lists link image charmap anchor hr', 'searchreplace visualblocks code fullscreen', 'insertdatetime media table contextmenu paste textcolor colorpicker'],
        image_title: true,
        menubar: 'edit insert view format table tools',
        browser_spellcheck: true,
        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor',
        moxiemanager_title: 'Choose a file',
        moxiemanager_path: defaultPath,
        force_br_newlines: forceNewLines,
        force_p_newlines: forceNewLines,
        paste_as_text: true,
        external_plugins: {
          moxiemanager: '/moxiemanager/plugin.min.js'
        },
        menu: {
          file: {
            title: 'File',
            items: 'newdocument'
          },
          edit: {
            title: 'Edit',
            items: 'undo redo | cut copy paste pastetext | selectall'
          },
          insert: {
            title: 'Insert',
            items: 'amFieldsMenuItem | link anchor media | template hr'
          },
          view: {
            title: 'View',
            items: 'visualaid'
          },
          format: {
            title: 'Format',
            items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'
          },
          table: {
            title: 'Table',
            items: 'inserttable tableprops deletetable | cell row column'
          },
          tools: {
            title: 'Tools',
            items: 'spellchecker code'
          },
          newmenu: {
            title: 'New Menu',
            items: 'newmenuitem'
          }
        },
        style_formats_merge: true,
        style_formats: [{
          title: 'Custom inline styles',
          items: [{
            title: 'Custom style 1',
            inline: 'span',
            classes: 'custom1'
          }, {
            title: 'Custom style 2',
            inline: 'span',
            classes: 'custom2'
          }, {
            title: 'Custom style 3',
            inline: 'span',
            classes: 'custom3'
          }, {
            title: 'Custom style 4',
            inline: 'span',
            classes: 'custom4'
          }, {
            title: 'Custom style 5',
            inline: 'span',
            classes: 'custom5'
          }, {
            title: 'Custom style 6',
            inline: 'span',
            classes: 'custom6'
          }, {
            title: 'Custom style 7',
            inline: 'span',
            classes: 'custom7'
          }, {
            title: 'Custom style 8',
            inline: 'span',
            classes: 'custom8'
          }, {
            title: 'Custom style 9',
            inline: 'span',
            classes: 'custom9'
          }, {
            title: 'Custom style 10',
            inline: 'span',
            classes: 'custom10'
          }]
        }, {
          title: 'Custom block styles',
          items: [{
            title: 'Custom style 1',
            block: 'p',
            classes: 'custom1'
          }, {
            title: 'Custom style 2',
            block: 'p',
            classes: 'custom2'
          }, {
            title: 'Custom style 3',
            block: 'p',
            classes: 'custom3'
          }, {
            title: 'Custom style 4',
            block: 'p',
            classes: 'custom4'
          }, {
            title: 'Custom style 5',
            block: 'p',
            classes: 'custom5'
          }, {
            title: 'Custom style 6',
            block: 'p',
            classes: 'custom6'
          }, {
            title: 'Custom style 7',
            block: 'p',
            classes: 'custom7'
          }, {
            title: 'Custom style 8',
            block: 'p',
            classes: 'custom8'
          }, {
            title: 'Custom style 9',
            block: 'p',
            classes: 'custom9'
          }, {
            title: 'Custom style 10',
            block: 'p',
            classes: 'custom10'
          }]
        }, {
          title: 'Image Left',
          selector: 'img',
          styles: {
            'float': 'left',
            'margin': '0 20px 20px 0'
          }
        }, {
          title: 'Image Right',
          selector: 'img',
          styles: {
            'float': 'right',
            'margin': '0 0 20px 20px'
          }
        }]
      });
      return;
    }
  }, {
    key: "startEditorWithNotificationTags",
    value: function startEditorWithNotificationTags(selector, defaultPath, menuItems) {
      if (typeof menuItems !== 'undefined') {
        var notificationTags = [];

        for (var itemKey in menuItems) {
          notificationTags.push({
            text: 'Insert {{' + itemKey + '}} - ' + menuItems[itemKey],
            value: '{{' + itemKey + '}}'
          });
        }

        if (notificationTags.length <= 0) {
          return this.startEditor(selector, defaultPath);
        }
      } else {
        return this.startEditor(selector, defaultPath);
      }

      if (tinymce.EditorManager.get(selector.substring(1))) tinymce.EditorManager.get(selector.substring(1)).remove();
      tinymce.init({
        branding: false,
        selector: selector,
        convert_urls: false,
        theme: 'modern',
        width: '100%',
        height: 300,
        resize: 'horizontal',
        valid_elements: '*[*]',
        plugins: ['advlist autolink lists link image charmap anchor hr', 'searchreplace visualblocks code fullscreen', 'insertdatetime media table contextmenu paste textcolor colorpicker'],
        image_title: true,
        menubar: 'edit insert view format table tools',
        toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor ',
        toolbar2: 'communicotags',
        moxiemanager_title: 'Choose a file',
        moxiemanager_path: defaultPath,
        paste_as_text: true,
        external_plugins: {
          moxiemanager: '/moxiemanager/plugin.min.js'
        },
        setup: function setup(editor) {
          editor.addButton('communicotags', {
            type: 'listbox',
            text: 'Insert Notification Tag',
            icon: false,
            onselect: function onselect(e) {
              editor.insertContent(this.value());
            },
            values: notificationTags
          });
        },
        menu: {
          file: {
            title: 'File',
            items: 'newdocument'
          },
          edit: {
            title: 'Edit',
            items: 'undo redo | cut copy paste pastetext | selectall'
          },
          insert: {
            title: 'Insert',
            items: 'amFieldsMenuItem | link anchor media | template hr'
          },
          view: {
            title: 'View',
            items: 'visualaid'
          },
          format: {
            title: 'Format',
            items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'
          },
          table: {
            title: 'Table',
            items: 'inserttable tableprops deletetable | cell row column'
          },
          tools: {
            title: 'Tools',
            items: 'spellchecker code'
          },
          newmenu: {
            title: 'New Menu',
            items: 'newmenuitem'
          }
        },
        style_formats_merge: true,
        style_formats: [{
          title: 'Custom inline styles',
          items: [{
            title: 'Custom style 1',
            inline: 'span',
            classes: 'custom1'
          }, {
            title: 'Custom style 2',
            inline: 'span',
            classes: 'custom2'
          }, {
            title: 'Custom style 3',
            inline: 'span',
            classes: 'custom3'
          }, {
            title: 'Custom style 4',
            inline: 'span',
            classes: 'custom4'
          }, {
            title: 'Custom style 5',
            inline: 'span',
            classes: 'custom5'
          }, {
            title: 'Custom style 6',
            inline: 'span',
            classes: 'custom6'
          }, {
            title: 'Custom style 7',
            inline: 'span',
            classes: 'custom7'
          }, {
            title: 'Custom style 8',
            inline: 'span',
            classes: 'custom8'
          }, {
            title: 'Custom style 9',
            inline: 'span',
            classes: 'custom9'
          }, {
            title: 'Custom style 10',
            inline: 'span',
            classes: 'custom10'
          }]
        }, {
          title: 'Custom block styles',
          items: [{
            title: 'Custom style 1',
            block: 'p',
            classes: 'custom1'
          }, {
            title: 'Custom style 2',
            block: 'p',
            classes: 'custom2'
          }, {
            title: 'Custom style 3',
            block: 'p',
            classes: 'custom3'
          }, {
            title: 'Custom style 4',
            block: 'p',
            classes: 'custom4'
          }, {
            title: 'Custom style 5',
            block: 'p',
            classes: 'custom5'
          }, {
            title: 'Custom style 6',
            block: 'p',
            classes: 'custom6'
          }, {
            title: 'Custom style 7',
            block: 'p',
            classes: 'custom7'
          }, {
            title: 'Custom style 8',
            block: 'p',
            classes: 'custom8'
          }, {
            title: 'Custom style 9',
            block: 'p',
            classes: 'custom9'
          }, {
            title: 'Custom style 10',
            block: 'p',
            classes: 'custom10'
          }]
        }, {
          title: 'Image Left',
          selector: 'img',
          styles: {
            'float': 'left',
            'margin': '0 20px 20px 0'
          }
        }, {
          title: 'Image Right',
          selector: 'img',
          styles: {
            'float': 'right',
            'margin': '0 0 20px 20px'
          }
        }]
      });
    }
  }]);

  return CoUtils;
}();

var CoTextFunctions = function () {
  function CoTextFunctions() {
    _classCallCheck(this, CoTextFunctions);
  }

  _createClass(CoTextFunctions, [{
    key: "capitalizeTool",
    value: function capitalizeTool(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  }]);

  return CoTextFunctions;
}();

var CoDataFunctions = function () {
  function CoDataFunctions(client) {
    _classCallCheck(this, CoDataFunctions);

    this.apiURL = '';
    this.client = client;
    this.opts = {};
    this.configAPI();
  }

  _createClass(CoDataFunctions, [{
    key: "clear",
    value: function clear() {
      this.opts = {};
    }
  }, {
    key: "configAPI",
    value: function configAPI() {
      var u = document.URL;
      var main = true;
      this.apiURL = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
    }
  }, {
    key: "options",
    set: function set(optionObj) {
      this.opts = optionObj;
    }
  }, {
    key: "clientInfo",
    get: function get() {
      var self = this;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var csURL, res, json;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                csURL = self.apiURL + "/v1/".concat(self.client, "/details");
                _context.next = 3;
                return fetch(csURL);

              case 3:
                res = _context.sent;
                _context.next = 6;
                return res.json();

              case 6:
                json = _context.sent;
                return _context.abrupt("return", json);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    }
  }, {
    key: "clientSettings",
    get: function get() {
      var self = this;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var csURL, res, json;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                csURL = self.apiURL + "/v1/".concat(self.client, "/settings");
                _context2.next = 3;
                return fetch(csURL);

              case 3:
                res = _context2.sent;
                _context2.next = 6;
                return res.json();

              case 6:
                json = _context2.sent;
                return _context2.abrupt("return", json);

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    }
  }, {
    key: "locations",
    get: function get() {
      var self = this;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var locURL, res, json;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                locURL = self.apiURL + "/v1/".concat(self.client, "/locations?only_with_external_rooms=").concat(self.opts.externalRooms, "&only_with_patron_rooms=").concat(self.opts.patronRooms);
                _context3.next = 4;
                return fetch(locURL);

              case 4:
                res = _context3.sent;
                _context3.next = 7;
                return res.json();

              case 7:
                json = _context3.sent;
                return _context3.abrupt("return", json);

              case 11:
                _context3.prev = 11;
                _context3.t0 = _context3["catch"](0);
                return _context3.abrupt("return", _context3.t0);

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[0, 11]]);
      }))();
    }
  }, {
    key: "mapcheck",
    get: function get() {
      var self = this;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var locURL, opts, res, json;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                locURL = self.apiURL + "/v2/".concat(self.client, "/locations/checkrestrictions/");
                opts = {
                  widgetid: self.opts.widgetid,
                  postcode: self.opts.postcode,
                  state: self.opts.state
                };
                _context4.next = 5;
                return fetch(locURL, {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(opts)
                });

              case 5:
                res = _context4.sent;
                _context4.next = 8;
                return res.json();

              case 8:
                json = _context4.sent;
                return _context4.abrupt("return", json);

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](0);
                return _context4.abrupt("return", _context4.t0);

              case 15:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[0, 12]]);
      }))();
    }
  }, {
    key: "openingHours",
    get: function get() {
      var self = this;
      var d = self.opts.date === '' ? moment().format('YYYY-MM-DD') : self.opts.date;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var ucURL, res, json;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                ucURL = self.apiURL + "/v2/".concat(self.client, "/opening-hours/").concat(d, "/1");
                _context5.next = 4;
                return fetch(ucURL);

              case 4:
                res = _context5.sent;
                _context5.next = 7;
                return res.json();

              case 7:
                json = _context5.sent;
                return _context5.abrupt("return", json);

              case 11:
                _context5.prev = 11;
                _context5.t0 = _context5["catch"](0);
                return _context5.abrupt("return", _context5.t0);

              case 14:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[0, 11]]);
      }))();
    }
  }, {
    key: "roomById",
    get: function get() {
      var self = this;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        var rURL, res, json;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                rURL = self.apiURL + "/v2/".concat(self.client, "/room/").concat(self.opts.roomId, "?include_roomdetail_data=1");
                _context6.next = 4;
                return fetch(rURL);

              case 4:
                res = _context6.sent;
                _context6.next = 7;
                return res.json();

              case 7:
                json = _context6.sent;
                return _context6.abrupt("return", json);

              case 11:
                _context6.prev = 11;
                _context6.t0 = _context6["catch"](0);
                return _context6.abrupt("return", _context6.t0);

              case 14:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[0, 11]]);
      }))();
    }
  }, {
    key: "roomBylocations",
    get: function get() {
      var self = this;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
        var locationParams, rblURL, res, json;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                locationParams = '';
                _context7.prev = 1;

                if (Array.isArray(self.opts.locationIds)) {
                  locationParams = self.opts.locationIds.join(',');
                } else if (typeof self.opts.locationIds === 'string') {
                  locationParams = locationIds;
                }

                rblURL = self.apiURL + "/v2/".concat(self.client, "/rooms/").concat(locationParams);
                _context7.next = 6;
                return fetch(rblURL);

              case 6:
                res = _context7.sent;
                _context7.next = 9;
                return res.json();

              case 9:
                json = _context7.sent;
                return _context7.abrupt("return", json);

              case 13:
                _context7.prev = 13;
                _context7.t0 = _context7["catch"](1);
                return _context7.abrupt("return", _context7.t0);

              case 16:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, null, [[1, 13]]);
      }))();
    }
  }, {
    key: "userClasses",
    get: function get() {
      var self = this;
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
        var ucURL, res, json;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                ucURL = self.apiURL + "/v2/".concat(self.client, "/userclasses?mode=1");
                _context8.next = 4;
                return fetch(ucURL);

              case 4:
                res = _context8.sent;
                _context8.next = 7;
                return res.json();

              case 7:
                json = _context8.sent;
                return _context8.abrupt("return", json);

              case 11:
                _context8.prev = 11;
                _context8.t0 = _context8["catch"](0);
                return _context8.abrupt("return", _context8.t0);

              case 14:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[0, 11]]);
      }))();
    }
  }]);

  return CoDataFunctions;
}();

var CoDialog = function () {
  function CoDialog() {
    _classCallCheck(this, CoDialog);

    this.opening = false;
  }

  _createClass(CoDialog, [{
    key: "openDialogWithData",
    value: function openDialogWithData(data, title, opencallback, closecallback) {
      var $box = $('<div class="temp_dialog"></div>').hide().html(data);
      $box.addClass('dlg');

      if (title) {
        $box.prepend('<div class="dlgtitle"><div class="gldbuttons"></div><div class="cbox-title">' + title + '</div></div>');
      }

      var maskHeight = $(document).height();
      var maskWidth = $(window).width();
      var openBoxes = $('body').find('div.temp_dialog.dlg').length;
      var baseIndex = 100;
      var $mask = $('<div class="temp_mask overlay"></div>').hide();
      $mask.css({
        'width': maskWidth,
        'height': maskHeight,
        'zIndex': baseIndex + openBoxes * 100
      });
      $box.css({
        'zIndex': baseIndex + openBoxes * 110
      });
      $('body').append($mask);
      $mask.click(function () {});
      var cb = closecallback;
      $box.on('dlg.close', function (e, state) {
        document.documentElement.style.cursor = '';
        if ($.isFunction(cb)) cb(state);
      });
      $mask.fadeIn('fast');
      $('body').append($box);
      $box.position({
        of: $(window)
      });

      if ($box.height() + 300 > $(window).height()) {
        var pos = ($(window).height() - $box.height()) / 2;
        $box.css('top', $(window).scrollTop() + (pos > 0 ? pos : 0) + 'px');
      } else {
        $box.css('top', $(window).scrollTop() + 150 + 'px');
      }

      if (opencallback) opencallback($box);
      $box.fadeIn(200);
      return $box;
    }
  }, {
    key: "openDialog",
    value: function openDialog(url, title, opencallback, closecallback) {
      if (this.opening) return;
      this.opening = true;
      $.ajax({
        url: url,
        success: function success(data) {
          openDialogWithData(data, title, opencallback, closecallback);
          this.opening = false;
        }
      });
    }
  }, {
    key: "openDialogWithMessage",
    value: function openDialogWithMessage(title, message, buttons, opencallback, closecallback) {
      var $data = $('<div class="cbox-body cbox-message"><div class="message">' + message + '</div><div class="buttons"></div></div>');

      for (var i in buttons) {
        $('.buttons', $data).append($('<button class="btn ' + buttons[i].classname + '">' + buttons[i].label + '</button>').on('click', buttons[i].action));
      }

      openDialogWithData($data, title, opencallback, closecallback);
    }
  }, {
    key: "closeAllDialogs",
    value: function closeAllDialogs(state, callback) {
      $('.temp_dialog').each(function () {
        $(this).trigger('dlg.close', [state]);
        $(this).remove();
      });
      $('.temp_mask').remove();

      if (callback) {
        callback();
      }
    }
  }, {
    key: "closeDialog",
    value: function closeDialog(state) {
      $('.temp_dialog').last().trigger('dlg.close', [state]);
      $('.temp_dialog').last().fadeOut(200, function () {
        $(this).remove();
      });
      $('.temp_mask').last().fadeOut(200, function () {
        $(this).remove();
      });
    }
  }]);

  return CoDialog;
}();

var CoInputProcessor = function () {
  function CoInputProcessor(inputDefinitions) {
    _classCallCheck(this, CoInputProcessor);

    this.inputs = [];
    this.topLabels = [];
    this.rawInputs = inputDefinitions;
  }

  _createClass(CoInputProcessor, [{
    key: "processInputs",
    value: function processInputs() {
      var _this2 = this;

      this.inputs = [];
      this.topLabels = [];

      if (Array.isArray(this.rawInputs) && this.rawInputs.length > 0) {
        this.rawInputs.forEach(function (raw) {
          if (typeof raw.type === 'undefined') return;

          if (typeof raw.disabled === 'undefined') {
            raw.disabled = false;
          } else {
            raw.disabled = raw.disabled;
          }

          if (typeof raw.readOnly === 'undefined') {
            raw.readOnly = false;
          } else {
            raw.readOnly = raw.readOnly;
          }

          if (typeof raw.visible === 'undefined') {
            raw.visible = true;
          } else {
            raw.visible = raw.visible;
          }

          var construct = [];
          var options = [];
          var inp = null;
          var vname = typeof raw.valueName !== 'undefined' ? raw.valueName : null;

          if (raw.visible) {
            _this2.topLabels.push({
              text: raw.label,
              size: raw.size
            });
          }

          switch (raw.type) {
            case 'email':
            case 'number':
            case 'text':
            case 'tel':
              inp = document.createElement('input');
              inp.type = raw.type;
              inp.id = raw.id;
              inp.value = raw.value;
              inp.setAttribute('v-name', vname);
              if (raw.disabled) inp.disabled = true;
              if (raw.readOnly) inp.readOnly = true;

              if (typeof raw.icon !== 'undefined') {
                if (raw.icon.length > 0) {
                  var ig = document.createElement('div');
                  var iga = document.createElement('span');
                  ig.classList.add('input-group');
                  iga.classList.add('input-group-addon');
                  inp.classList.add('form-control');
                  iga.innerHTML = raw.icon;
                  ig.append(iga);
                  ig.append(inp);
                  inp.setAttribute('input-group', '');
                  inp = ig;
                }
              }

              if (!raw.visible) inp.style.display = 'none';

              _this2.inputs.push({
                type: raw.type,
                element: inp,
                multiple: false,
                size: raw.size,
                name: vname
              });

              break;

            case 'checkbox':
            case 'radio':
              construct = [];

              try {
                options = JSON.parse(raw.options);
              } catch (err) {
                options = raw.options;
              }

              var label = document.createElement('label');
              label.classList.add('co-input-label');
              inp = document.createElement('input');
              inp.type = raw.type;
              inp.name = raw.id;
              inp.setAttribute('v-name', vname);

              if (Array.isArray(options) && options.length > 0) {
                label.className = raw.type + '-inline';
                options.forEach(function (option) {
                  var l = label.cloneNode();
                  var i = inp.cloneNode();
                  if (raw.disabled) i.disabled = true;
                  if (raw.readOnly) i.readOnly = true;
                  if (!raw.visible) i.style.display = 'none';
                  i.checked = parseInt(option.value);
                  i.value = option.value;
                  i.append(option.label);
                  construct.push(l.appendChild(i));
                });

                _this2.inputs.push({
                  type: raw.type,
                  element: construct,
                  multiple: true,
                  size: raw.size,
                  name: vname
                });
              }

              if (options === 'single' && raw.type === 'checkbox') {
                var l = label.cloneNode();
                var i = inp.cloneNode();
                if (raw.disabled) i.disabled = true;
                if (raw.readOnly) i.readOnly = true;
                if (!raw.visible) i.style.display = 'none';
                i.value = raw.value;
                i.checked = parseInt(raw.value);
                l.appendChild(i);
                construct.push(l);

                _this2.inputs.push({
                  type: raw.type,
                  element: construct,
                  multiple: false,
                  size: raw.size,
                  name: vname
                });
              }

              break;

            case 'select':
              construct = [];
              options = raw.options;
              var select = document.createElement('select');
              var opt = document.createElement('option');

              if (Array.isArray(options) && options.length > 0) {
                select.className = 'form-control';
                if (raw.disabled) select.disabled = true;
                if (raw.readOnly) select.readOnly = true;
                if (!raw.visible) select.style.display = 'none';
                select.setAttribute('v-name', vname);
                options.forEach(function (option) {
                  var o = opt.cloneNode();
                  o.value = option.value;
                  o.innerHTML = option.label;
                  select.appendChild(o);
                });
                if (raw.value) select.value = raw.value;

                _this2.inputs.push({
                  type: raw.type,
                  element: select,
                  multiple: false,
                  size: raw.size,
                  name: vname
                });
              }

              break;

            default:
              break;
          }
        });
      }

      return true;
    }
  }]);

  return CoInputProcessor;
}();

var coPhoneInput = function () {
  function coPhoneInput() {
    _classCallCheck(this, coPhoneInput);

    this.filter = [];
    this.init();
  }

  _createClass(coPhoneInput, [{
    key: "bindEvents",
    value: function bindEvents() {
      var _this3 = this;

      var phoneInputs = document.querySelectorAll("[data-phone]");

      for (var p = 0; p < phoneInputs.length; p++) {
        var phoneInput = phoneInputs[p];
        phoneInput.placeholder = "XXX-XXX-XXXX";
        phoneInput.addEventListener('keydown', function (e) {
          if (_this3.filter.indexOf(e.keyCode) < 0) {
            e.preventDefault();
            return;
          }
        });
        phoneInput.addEventListener('keyup', function (e) {
          var input = e.target;

          var formatted = _this3.formatPhoneText(input.value);

          var isError = _this3.validatePhone(formatted) || formatted.length == 0;
          var color = isError ? "gray" : "red";
          var borderWidth = isError ? "1px" : "3px";
          input.style.borderColor = color;
          input.style.borderWidth = borderWidth;
          input.value = formatted;
        });
      }
    }
  }, {
    key: "formatPhoneText",
    value: function formatPhoneText(value) {
      value = this.replaceAll(value.trim(), "-", "");
      if (value.length > 3 && value.length <= 6) value = value.slice(0, 3) + "-" + value.slice(3);else if (value.length > 6) value = value.slice(0, 3) + "-" + value.slice(3, 6) + "-" + value.slice(6);
      return value;
    }
  }, {
    key: "init",
    value: function init() {
      this.setupFilter();
      this.bindEvents();
    }
  }, {
    key: "replaceAll",
    value: function replaceAll(src, search, replace) {
      return src.split(search).join(replace);
    }
  }, {
    key: "setupFilter",
    value: function setupFilter() {
      var keypadZero = 48;
      var numpadZero = 96;
      this.filter = [8, 9, 46, 37, 39];

      for (var i = 0; i <= 9; i++) {
        this.filter.push(i + keypadZero);
        this.filter.push(i + numpadZero);
      }
    }
  }, {
    key: "validatePhone",
    value: function validatePhone(p) {
      var phoneRe = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
      var digits = p.replace(/\D/g, "");
      return phoneRe.test(digits);
    }
  }]);

  return coPhoneInput;
}();

var FormMaker = function () {
  function FormMaker(name, title, fields, buttons, evts, classes, isPopup, isInline, isHorizontal, isSaveable, isInForm) {
    var forEmail = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : false;
    var isPaymentForm = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : false;
    var formAction = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : false;
    var formMethod = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : false;

    _classCallCheck(this, FormMaker);

    this.$form = '';

    try {
      this.data = fields;
    } catch (e) {
      throw 'Fields must be specified to generate form.';
    }

    this.$form = null;
    this.fields = [];
    this.idList = [];
    this.btns = typeof buttons === 'undefined' ? false : buttons;
    this.name = typeof name === 'undefined' ? 'Generic Form' : name;
    this.title = typeof title === 'undefined' ? 'Generic Form' : title;
    this.evts = typeof evts === 'undefined' ? false : evts;
    this.data = typeof fields === 'undefined' ? false : fields;
    this.classes = typeof classes === 'undefined' ? false : classes;
    this.forEmail = typeof forEmail === 'undefined' ? false : forEmail;
    this.isPopup = typeof isPopup === 'undefined' ? false : isPopup;
    this.isInForm = typeof isInForm === 'undefined' ? false : isInForm;
    this.isInline = typeof isInline === 'undefined' ? false : isInline;
    this.isSaveable = typeof isSaveable === 'undefined' ? false : isSaveable;
    this.isHorizontal = typeof isHorizontal === 'undefined' ? false : isHorizontal;
    this.isPaymentForm = typeof isPaymentForm === 'undefined' ? false : isPaymentForm;
    this.formAction = typeof formAction === 'undefined' ? false : formAction;
    this.formMethod = typeof formMethod === 'undefined' ? false : formMethod;
  }

  _createClass(FormMaker, [{
    key: "form",
    get: function get() {
      this.buildForm();
      return this.$form;
    }
  }, {
    key: "buildForm",
    value: function buildForm() {
      var _this4 = this;

      var sub = $('<button />');
      var name = this.name;
      this.$form = $('<form />');
      this.$form.addClass(this.classes);

      if (this.formAction) {
        this.$form.attr('action', this.formAction);
      }

      if (this.formMethod) {
        this.$form.attr('method', this.formMethod);
      }

      sub.addClass('btn btn-default').attr('type', 'submit');
      if (this.name.indexOf(' ') >= 0) name = this.name.replace(' ', '_');
      if (this.isInline) this.$form.addClass('form-inline');
      if (this.isHorizontal) this.$form.addClass('form-horizontal');
      this.$form.attr('id', name);
      this.createFields();
      var $fieldRow = $('<div class="row amf-row"/>');
      var $fieldCol = $('<div class="col-md-12"/>');

      if (this.fields.length > 0) {
        if (this.isPopup) {
          $fieldRow.addClass('patron-popup');
        }

        this.fields.forEach(function ($formGroup, i) {
          if (typeof $formGroup.naked !== 'undefined') {
            _this4.$form.append($formGroup.input);
          } else {
            var frClone = $fieldRow.clone();
            var fcClone = $fieldCol.clone();
            fcClone.append($formGroup.label);
            fcClone.append($formGroup.input);
            frClone.append(fcClone);

            if (i === 0) {
              frClone.addClass('top-row');
            }

            _this4.$form.append(frClone);
          }
        });

        if (this.buttons) {
          this.createButtons();
        } else {
          if (!this.isPopup && !this.isInForm) {
            this.$form.append(sub);
          }
        }
      }

      var errRow = $fieldRow.clone();
      var errCol = $fieldCol.clone();
      errCol.append($('<div class="amnp-error-message" />'));
      errRow.append(errCol);
      this.$form.append(errRow);
      if (this.isPopup) this.wrapFormWithModal();
      this.createEvents();
    }
  }, {
    key: "createButtons",
    value: function createButtons() {
      this.buttons.forEach(function (btn) {});
    }
  }, {
    key: "createBlocks",
    value: function createBlocks() {}
  }, {
    key: "createEvents",
    value: function createEvents() {
      var _this5 = this;

      if (typeof this.evts !== 'undefined' && this.evts !== false && this.evts !== null) {
        if (this.evts.length > 0) {
          this.evts.forEach(function (evt) {
            if (evt.type !== '' && evt.func !== null) {
              $(evt.selector, _this5.$form).off().on(evt.type, evt.func);
            }
          });
        }
      }
    }
  }, {
    key: "createFields",
    value: function createFields() {
      var _this6 = this;

      var fg = $('<div/>');
      var input = $('<input />');
      var select = $('<select />');
      var label = $('<label />');
      var option = $('<option />');
      var textarea = $('<textarea />');
      var curId = 0;
      var ic = null;
      var hIn = null;
      var lbl = null;
      var lb = null;
      input.addClass('am-input');
      this.data.forEach(function (field) {
        if (_this6.idList.indexOf(field.id) === -1) {
          curId = field.id;
        } else {
          curId = field.id + '-' + _this6.idList.length - 1;
        }

        lb = $('<div/>');
        hIn = $('<div/>');

        _this6.idList.push(curId);

        switch (field.type) {
          case 'content-block':
            if (typeof field.html !== 'undefined') {
              _this6.fields.push({
                label: '',
                input: field.html
              });
            }

            break;

          case 'checkbox':
          case 'radio':
            var bootstrap = [];
            var multiples = [];

            var _short = field.type === 'checkbox' ? 'cb' : 'r';

            var bg = typeof field.buttonGroup !== 'undefined' ? field.buttonGroup : false;
            input.removeClass('am-input');

            if (Array.isArray(field.options) && field.options.length > 0) {
              var opts = 0;
              field.options.forEach(function (option) {
                ic = input.clone();
                ic.attr('type', field.type).attr('name', curId + '-' + _short + '-' + opts).val(option.value);
                if (field.selected) ic.prop('checked', 'checked');
                if (field.required) ic.attr('required', field.required);
                if (field.readonly) ic.prop('readonly', 'readonly');
                if (field.hide) ic.css('display', 'none');
                if (field.text) ic.attr('data-text', field.text);
                multiples.push(ic);
                opts++;
              });
            }

            if (field.options === 'single') {
              var l = label.clone();
              var i = input.clone();
              i.attr('type', field.type).attr('name', curId + '-' + _short + '-1');
              if (field.selected) i.prop('checked', 'checked');
              if (field.required) i.attr('required', field.required);
              if (field.readonly) i.prop('readonly', 'readonly');
              if (field.hide) i.css('display', 'none');
              if (field.text) i.attr('data-text', field.text);
              multiples.push(i);
            }

            if (multiples.length > 0) {
              var div = $('<div />');
              label = $('<label />');
              if (bg) label.addClass('btn btn-default  active');
              if (!bg) div.addClass(field.type);
              multiples.forEach(function (cb) {
                var dc = div.clone();
                var lc = label.clone();
                var txt = typeof cb.attr('data-text') === 'undefined' ? cb.val() : cb.attr('data-text');
                lc.text(txt).append(cb);

                if (!bg) {
                  dc.append(lc);
                  bootstrap.push(dc);
                } else {
                  label.removeClass('active');
                  bootstrap.push(lc);
                }
              });

              if (_this6.isHorizontal) {
                var dBs = $('<div class="col-sm-8 field"/>');

                var _bg = $('<div class="btn-group" data-toggle="buttons"/>');

                if (_bg) {
                  _bg.append(bootstrap);

                  dBs.append(_bg);
                } else {
                  dBs.append(bootstrap);
                }

                _this6.fields.push({
                  label: _this6.paymentForm ? $('<label class="col-sm-4 control-label">Payment Type</label>') : label,
                  input: dBs,
                  multiple: true
                });
              } else {
                _this6.fields.push({
                  label: false,
                  input: bootstrap,
                  multiple: true
                });
              }
            }

            break;

          case 'range':
            ic = input.clone();
            lbl = label.clone();

            if (field.range) {
              ic.attr('id', curId).attr('type', field.type).addClass('form-control');
              lbl.text(field.label).attr('for', curId);
              if (field.range.max) ic.attr('max', field.range.max);
              if (field.range.min) ic.attr('min', field.range.min);
              if (field.range.step) ic.attr('step', field.range.step);
              if (field.required) ic.attr('required', field.required);
              if (field.readonly) ic.prop('readonly', 'readonly');
              if (field.value) ic.val(field.value);
              if (field.hide) ic.css('display', 'none');

              if (_this6.isHorizontal) {
                hIn.addClass('col-sm-8 field').append(ic);
                lb.addClass('col-sm-4 control-label').append(lbl);

                _this6.fields.push({
                  label: lb,
                  input: hIn
                });
              } else {
                _this6.fields.push({
                  label: lb,
                  input: ic
                });
              }
            }

            break;

          case 'select':
            var sc = select.clone();
            lbl = label.clone();

            if (field.options.length > 0) {
              var opts = 0;
              var def = option.clone();
              sc.attr('id', curId).addClass('form-control');
              def.text('Select an Option').val('');
              lbl.text(field.label).attr('for', curId);
              sc.append(def);
              if (field.required) sc.attr('required', field.required);
              if (field.multiple) sc.attr('multiple', 'multiple');
              if (field.readonly) sc.prop('readonly', 'readonly');
              if (field.hide) sc.css('display', 'none');

              _this6.field.options.forEach(function (opt) {
                var oc = option.clone();
                oc.val(opt.value);
                sc.append(oc);
              });

              if (_this6.isHorizontal) {
                hIn.addClass('col-sm-8 field').append(sc);
                lbl.addClass('col-sm-4 control-label').append(lbl);

                _this6.fields.push({
                  label: lb,
                  input: hIn
                });
              } else {
                _this6.fields.push({
                  label: lb,
                  input: sc
                });
              }
            }

            break;

          case 'textarea':
            var ta = textarea.clone();
            lbl = label.clone();
            ta.attr('id', curId).addClass('form-control');
            lbl.text(field.label).attr('for', curId);
            if (field.value) ta.val(field.value);
            if (field.readonly) ta.prop('readonly', 'readonly');
            if (field.hide) ta.css('display', 'none');

            if (_this6.isHorizontal) {
              hIn.addClass('col-sm-8 field').append(ta);
              lb.addClass('col-sm-4 control-label').append(lbl);

              _this6.fields.push({
                label: lb,
                input: hIn
              });
            } else {
              _this6.fields.push({
                label: lb,
                input: ta
              });
            }

            break;

          case 'email':
            var emailInp = _this6.buildSendField(field, curId);

            if (_typeof(emailInp) === 'object') {
              _this6.fields.push({
                label: emailInp.label,
                input: emailInp.input
              });
            }

            break;

          case 'hidden':
          case 'submit':
            var fld = _this6.buildHiddenSubmitField(field, curId);

            _this6.fields.push(fld);

            break;

          default:
            if (['color', 'password', 'date', 'text', 'tel', 'number', 'ccard', 'cvc', 'expiration'].indexOf(field.type) > -1) {
              var _fld = _this6.buildTextField(field, curId);

              _this6.fields.push(_fld);
            }

            break;
        }
      });
    }
  }, {
    key: "buildSendField",
    value: function buildSendField(field, curId) {
      var emailField = this.buildTextField(field, curId);

      if (_typeof(emailField) === 'object') {
        var inp = emailField.input;
        var b = $('<button />').addClass('btn popup-btn').attr('type', 'button').attr('id', 'sendEmail').text('Send');
        var ig = $('<div />').addClass('input-group');
        var igb = $('<span />').addClass('input-group-btn');
        ig.append(inp);
        igb.append(b);
        ig.append(igb);
        return {
          label: emailField.label,
          input: ig
        };
      }

      return false;
    }
  }, {
    key: "buildHiddenSubmitField",
    value: function buildHiddenSubmitField(field, curId) {
      var hIn = $('<div/>');
      var input = $('<input />');
      var lbl = $('<label />');
      var lb = $('<div/>');
      input.attr('id', curId).attr('type', field.type);
      lbl.text(field.label).attr('for', curId);
      if (field.required) input.attr('required', field.required);
      if (field.value) input.val(field.value);
      if (field.hide) input.css('display', 'none');
      return {
        label: lbl,
        input: input,
        naked: typeof field.naked !== 'undefined' ? field.naked : false
      };
    }
  }, {
    key: "buildTextField",
    value: function buildTextField(field, curId) {
      var hIn = $('<div/>');
      var input = $('<input />');
      var lbl = $('<label />');
      var lb = $('<div/>');
      input.attr('id', curId).attr('type', field.type).addClass('form-control');
      lbl.text(field.label).attr('for', curId);
      if (field.required) input.attr('required', field.required);
      if (field.value) input.val(field.value);
      if (field.placeholder) input.attr('placeholder', field.placeholder);
      if (field.readonly) input.prop('readonly', 'readonly');
      if (field.hide) input.css('display', 'none');
      if (field.type === 'ccard') input.payment('formatCardNumber');
      if (field.type === 'cvc') input.payment('formatCardCVC');
      if (field.type === 'expiration') input.payment('formatCardExpiry');

      if (this.isHorizontal) {
        hIn.addClass('col-sm-8 field').append(input);

        if (field.type === 'ccard') {
          var holder = $('<div/>');
          holder.addClass('card-logo').css('margin-bottom', '.5em');

          if (typeof field.cardTypes !== 'undefined') {
            field.cardTypes.forEach(function (cardType) {
              if (cardType.visible) {
                switch (cardType.type) {
                  case 'amex':
                    holder.append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/American Express.png"/>'));
                    break;

                  case 'diners':
                    holder.append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/Diners Club (Inverted).png"/>'));
                    break;

                  case 'discover':
                    holder.append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/Discover.png"/>'));
                    break;

                  case 'mc':
                    holder.append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/MasterCard (Inverted).png"/>'));
                    break;

                  case 'visa':
                    holder.append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/Visa (Inverted).png"/>'));
                    break;
                }
              }
            });
          } else {
            holder.append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/American Express.png"/>')).append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/Diners Club (Inverted).png"/>')).append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/Discover.png"/>')).append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/MasterCard (Inverted).png"/>')).append($('<img style="width:50px;" src="//inc.libnet.info/images/card-logos/Visa (Inverted).png"/>'));
          }

          hIn.append(holder);
        }

        lb.addClass('col-sm-4 control-label').append(lbl);
        return {
          label: lb,
          input: hIn
        };
      } else {
        return {
          label: lbl,
          input: input
        };
      }
    }
  }, {
    key: "titleCase",
    value: function titleCase(phrase) {
      return phrase.replace(/\W\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  }, {
    key: "wrapFormWithModal",
    value: function wrapFormWithModal() {
      var $content = $('<div />');
      var $header = $('<div />');
      var $footer = $('<div />');
      var $dialog = $('<div />');
      var $modal = $('<div />');
      var $body = $('<div />');
      var name = this.name.indexOf(' ') >= 0 ? this.name.replace(' ', '_') : this.name;
      $body.addClass('modal-body');
      $modal.addClass('modal fade').attr('tabindex', '-1').attr('role', 'dialog').addClass(name + '-dialog');
      $dialog.addClass('amPopup fmPopup').attr('role', 'document');
      $content.addClass('amPopupContent');
      $footer.addClass('modal-footer').append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
      $header.addClass('modal-header patron-popup').append('<div style="float:right"><a class="close-brochure-popup" style="cursor: pointer;">close</a></div>').append('<h3 class=\'modal-title patron-popup heading-text\' >' + this.titleCase(this.title) + '</h3>');

      if (this.isSaveable) {
        $footer.append('<button type="button" class="btn btn-primary">Save</button>');
      } else {
        $footer.append('<button type="button" class="btn btn-primary">Submit</button>');
      }

      if (this.$form.length > 0) {
        $body.append(this.$form);
      }

      if (this.forEmail) {
        $content.append($header).append($body);
      } else {
        $content.append($header).append($body).append($footer);
      }

      $dialog.append($content);
      $modal.append($dialog);
      $modal.on('hidden.bs.modal', function (e) {
        $(e.target).remove();
      });
      this.$form = $modal;
    }
  }]);

  return FormMaker;
}();

var PayPal = function () {
  function PayPal() {
    _classCallCheck(this, PayPal);

    this.$form = '';
    this.paymentData = {
      firstName: '',
      lastName: '',
      cardNumber: '',
      expiration: '',
      cvc: '',
      total: 0.00,
      type: ''
    };
    var header = '';
    var error = '';
    $('<div class="amnp-spacer"><div class="amnp-error-message"></div></div>');
    this.paymentForm = [{
      label: '',
      html: header,
      type: 'content-block',
      id: 'paymentDetailsHeader'
    }, {
      label: '',
      html: error,
      type: 'content-block',
      id: 'errorDetails',
      hide: true
    }, {
      label: 'First Name',
      type: 'text',
      id: 'card_first_name',
      required: true
    }, {
      label: 'Last Name',
      type: 'text',
      id: 'card_last_name',
      required: true
    }, {
      label: 'Card Number',
      type: 'ccard',
      id: 'card_number',
      required: true,
      placeholder: '1234 5678 9012 3456'
    }, {
      label: 'Expiration',
      type: 'expiration',
      id: 'expiration',
      required: true,
      placeholder: 'MM / YYYY'
    }, {
      label: 'CVC',
      type: 'cvc',
      id: 'cvc',
      required: true,
      placeholder: '000'
    }, _defineProperty({
      label: '',
      type: 'content-block',
      id: 'paymentTotal',
      html: ''
    }, "id", 'paymentSummary')];
  }

  _createClass(PayPal, [{
    key: "form",
    get: function get() {
      return this.buildForm();
    }
  }, {
    key: "buildForm",
    value: function buildForm() {
      var formFrame = $('<div />');
      this.$form = new FormMaker('PayPalForm', '', this.paymentForm, null, null, null, false, false, true, true, true).form;
      formFrame.addClass('amnp-card-form').append(this.$form);
      return formFrame;
    }
  }]);

  return PayPal;
}();

var PayPalPayFlow = function () {
  function PayPalPayFlow() {
    var _this$paypalChargeDat;

    var Type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'S';
    var testMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var client = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    _classCallCheck(this, PayPalPayFlow);

    this.$form = '';
    var header = '';
    var error = '';
    var isStage = window.location.href.indexOf('stage.') > 0;
    var isTest = window.location.href.indexOf('test.') > 0;
    var isLive = !isStage && !isTest;
    this.client = client;
    this.DataFunctions = null;
    this.paymentForm = [{
      label: '',
      html: header,
      type: 'content-block',
      id: 'paymentDetailsHeader'
    }, {
      label: '',
      html: error,
      type: 'content-block',
      id: 'errorDetails',
      hide: true
    }, {
      label: 'First Name',
      type: 'text',
      id: 'card_first_name',
      required: true
    }, {
      label: 'Last Name',
      type: 'text',
      id: 'card_last_name',
      required: true
    }, {
      label: 'Card Number',
      type: 'ccard',
      id: 'card_number',
      name: 'card_number',
      required: true,
      placeholder: '1234 5678 9012 3456'
    }, {
      label: 'Expiration',
      type: 'expiration',
      id: 'expiration',
      name: 'expiration',
      required: true,
      placeholder: 'MM / YYYY'
    }, {
      label: 'CVC',
      type: 'cvc',
      id: 'CVV2',
      name: 'CVV2',
      required: true,
      placeholder: '000'
    }, _defineProperty({
      label: '',
      type: 'content-block',
      id: 'paymentTotal',
      html: ''
    }, "id", 'paymentSummary')];
    this.paypalChargeData = (_this$paypalChargeDat = {
      'SECURETOKEN': '',
      'SECURETOKENID': '',
      'SILENTTRAN': 'TRUE',
      'EMAIL': '',
      'MODE': 'TEST',
      'TENDER': 'C',
      'TRXTYPE': 'S',
      'CVV2': '',
      'EXPDATE': '',
      'ACCT': '',
      'BILLTOFIRSTNAME': '',
      'BILLTOLASTNAME': ''
    }, _defineProperty(_this$paypalChargeDat, "EMAIL", ''), _defineProperty(_this$paypalChargeDat, 'CURRENCY', ''), _defineProperty(_this$paypalChargeDat, 'AMT', 0.00), _this$paypalChargeDat);
    this.clientInfo = null;
    this.clientSettings = null;
    this.testMode = testMode == 1;
    this.payPalUrl = this.testMode ? 'https://pilot-payflowlink.paypal.com' : 'https://payflowlink.paypal.com';
    this.apiURL = 'https://api-us.communico.co';
    if (isLive) this.apiURL = 'https://api-us.communico.co';
    if (isStage) this.apiURL = 'https://api-stage.communico.co';
    if (isTest) this.apiURL = 'https://api-test.communico.co';
    this.apiURL = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
  }

  _createClass(PayPalPayFlow, [{
    key: "buildForm",
    value: function () {
      var _buildForm = _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
        var formFrame, self, settings;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                formFrame = $('<div />');
                self = this;

                if (!(self.client !== null)) {
                  _context9.next = 13;
                  break;
                }

                _context9.next = 5;
                return self.getCardSettings();

              case 5:
                settings = _context9.sent;

                if (!settings) {
                  _context9.next = 11;
                  break;
                }

                self.paymentForm[4]['cardTypes'] = settings;
                self.$form = new FormMaker('PayPalForm', '', self.paymentForm, null, null, null, false, false, true, true, true, false, true, self.payPalUrl, 'POST').form;
                formFrame.addClass('amnp-card-form').append(self.$form);
                return _context9.abrupt("return", formFrame);

              case 11:
                _context9.next = 16;
                break;

              case 13:
                self.$form = new FormMaker('PayPalForm', '', self.paymentForm, null, null, null, false, false, true, true, true, false, true, self.payPalUrl, 'POST').form;
                formFrame.addClass('amnp-card-form').append(self.$form);
                return _context9.abrupt("return", formFrame);

              case 16:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function buildForm() {
        return _buildForm.apply(this, arguments);
      }

      return buildForm;
    }()
  }, {
    key: "createBookingBlock",
    value: function createBookingBlock(booking) {
      var self = this;
      var message = '<i class="fa fa-check-circle"></i>&nbsp;Reservation For: ';
      var ref = '	<div class="events2-reg-thanks-ref">Ref:<span class="events2-reg-thanks-ref-num">' + booking.reference + '</span></div>';
      var costContainer = '';
      var costMessage = '';
      var costFinalText = '';
      var mediatedMessage = '';
      var mediated = false;

      if (!booking.ok) {
        message = '<span style="color:#ED0202;"><i class="fa fa-times-circle"></i>&nbsp;' + booking.message + '</span>';
        ref = '';
      }

      var lock = '';

      if (booking.mediated == 'true' || booking.mediated == 1) {
        mediated = !mediated;

        if (self.clientSettings && self.clientSettings.rooms_mediated_booking_message) {
          mediatedMessage = '<div class="amrp-status-inreview"><i class="fa fa-info-circle"></i>' + '&nbsp' + self.clientSettings.rooms_mediated_booking_message + '</div>';
        } else {
          mediatedMessage = '<div class="amrp-status-inreview"><i class="fa fa-info-circle"></i>' + '&nbspReservation of this room requires approval. Your reservation is pending review. You will receive another notification once your request is approved.</div>';
        }

        if (booking.lock_code && booking.lock_code.length > 0 && self.clientSettings.rooms_remotelock_show_on_confirmationscreen_mediated == 1) {
          lock = '<div class="events2-reg-thanks-pin"><span><i class="am-unlock"></i>Door code: </span>' + booking.lock_code + '</div>' + '<div class="events2-reg-thanks-pin-message"><i class="fa fa-info-circle"></i>' + '<div class="events2-reg-thanks-pin-message-title">This room has a door lock.</div>' + '<div class="events2-reg-thanks-pin-message-body">You will need to enter the ' + booking.lock_code.length + ' digit door code to unlock the room. Note: The code will not work before your room booking start time.</div>' + '</div>';
        }
      } else {
        if (booking.lock_code && booking.lock_code.length > 0) {
          lock = '<div class="events2-reg-thanks-pin"><span><i class="am-unlock"></i>Door code: </span>' + booking.lock_code + '</div>' + '<div class="events2-reg-thanks-pin-message"><i class="fa fa-info-circle"></i>' + '<div class="events2-reg-thanks-pin-message-title">This room has a door lock.</div>' + '<div class="events2-reg-thanks-pin-message-body">You will need to enter the ' + booking.lock_code.length + ' digit door code to unlock the room. Note: The code will not work before your room booking start time.</div>' + '</div>';
        }
      }

      if (booking.ok) {
        var cost = booking.amt;

        if (cost > 0) {
          costContainer = $('<div />').addClass('events2-cost-msg');
          costMessage = 'The total cost of this booking was $' + self.formatCurrency(cost) + '.';

          if (mediated) {
            costMessage += ' Payment will be collected once the booking is confirmed.';
          }

          costContainer.text(costMessage);
          costFinalText = costContainer.wrap('<div/>').parent().html();
        }
      }

      var thanksHead = $('<div class="events2-reg-thanks-evtitle">' + booking.title + '</div>' + '<div class="events2-reg-thanks-evlocation"><i class="fa fa-map-marker"></i>&nbsp;' + booking.loc + '</div>');
      var thanksBody = $('<div class="events2-reg-thanks-event">' + '	<div class="events2-reg-thanks-sub-title">' + message + '</div>' + (booking.ok ? mediatedMessage : "") + '	<div class="events2-reg-thanks-evdate">' + moment(booking.start_time).format('MMMM Do, YYYY') + '</div>' + '	<div class="events2-reg-thanks-evtime">' + moment(booking.start_time).format('HH:mm') + ' - ' + moment(booking.end_time).format('HH:mm') + '</div>' + ref + lock + costFinalText + '</div>');
      return {
        head: thanksHead,
        body: thanksBody
      };
    }
  }, {
    key: "formatCurrency",
    value: function formatCurrency(amount) {
      return parseFloat(amount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }
  }, {
    key: "getCardSettings",
    value: function () {
      var _getCardSettings = _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
        var self, params, response;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                self = this;
                params = {
                  client: self.client
                };
                _context10.prev = 2;
                _context10.next = 5;
                return fetch("".concat(self.apiURL, "/v2/").concat(self.client, "/paypal/card_settings"), {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(params)
                });

              case 5:
                response = _context10.sent;
                _context10.next = 8;
                return response.json();

              case 8:
                return _context10.abrupt("return", _context10.sent);

              case 11:
                _context10.prev = 11;
                _context10.t0 = _context10["catch"](2);
                console.error(_context10.t0);

              case 14:
                return _context10.abrupt("return");

              case 15:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[2, 11]]);
      }));

      function getCardSettings() {
        return _getCardSettings.apply(this, arguments);
      }

      return getCardSettings;
    }()
  }, {
    key: "showEventSummary",
    value: function showEventSummary(registrationData) {
      if (typeof registrationData.registrations !== 'undefined') {
        var registered = "";
        var waitlisted = "";
        var extraHTML = '';

        if (registrationData.registrations.length > 0) {
          $.each(registrationData.registrations, function (index, date) {
            if (registrationData.extraDates && registrationData.extraDates.length > 0) $.each(registrationData.extraDates, function (index, val) {
              if (val.id == date.id) {
                if (date.intent == 1) {
                  if (registered === "") {
                    registered = "<div class='events2-reg-thanks-sub-title'><i class='fa fa-check-circle'></i>&nbsp;Also Registered For:</div>";
                  }

                  registered += '<div class="events2-reg-thanks-event">' + '<div class="events2-reg-thanks-evdate">' + val.datestring + '</div>' + '<div class="events2-reg-thanks-evtime">' + val.time_string + '</div>' + '<div class="events2-reg-thanks-ref">Ref:<span class="events2-reg-thanks-ref-num">' + date.ref + '</span></div>' + '</div>';
                } else {
                  if (waitlisted === "") {
                    waitlisted = "<div class='events2-reg-thanks-sub-title'><i class='fa fa-users'></i>&nbsp;On waitlist for:</div>";
                  }

                  waitlisted += '<div class="events2-reg-thanks-event">' + '<div class="events2-reg-thanks-evdate">' + val.datestring + '</div>' + '<div class="events2-reg-thanks-evtime">' + val.time_string + '</div>' + '<div class="events2-reg-thanks-ref">Ref:<span class="events2-reg-thanks-ref-num">' + date.ref + '</span></div>' + '</div>';
                }
              }
            });
          });
          extraHTML += registered + waitlisted;
        }

        var regFor = registrationData.master.regtype == 1 ? "" : " waitlist";
        var attendanceType = registrationData.master.attendanceType != "ONLINE" ? "" : " for a virtual event";
        var website = window.websiteUrl || "";
        var thanksPopupStage = $('<div class="events2-reg-person-popup">' + '<div class="events2-reg-thanks-stage">' + '<div class="events2-reg-thanks-title">Thanks, you&apos;re now registered' + attendanceType + '!</div>' + '<div class="events2-reg-thanks-head">' + '<div class="events2-reg-thanks-evtitle">' + registrationData.details.title + '</div>' + '<div class="events2-reg-thanks-evlocation"><i class="fa fa-map-marker"></i>&nbsp;' + registrationData.details.location + '</div>' + '</div>' + '<div class="events2-reg-thanks-body">' + '<div class="events2-reg-thanks-sub-title"><i class="fa fa-check-circle"></i>&nbsp;Registered for' + regFor + ':</div>' + '<div class="events2-reg-thanks-event">' + '	<div class="events2-reg-thanks-evdate">' + registrationData.details.datestring + '</div>' + '	<div class="events2-reg-thanks-evtime">' + registrationData.details.time_string + '</div>' + '	<div class="events2-reg-thanks-ref">Ref:<span class="events2-reg-thanks-ref-num">' + registrationData.ref + '</span></div>' + '</div>' + '' + extraHTML + '' + '</div>' + '<div class="events2-reg-thanks-online">' + '<div class="events2-reg-thanks-online-title">View online</div>' + '<div>You can manage your event registrations and bookings at:</div>' + '<div><a href="' + website + '/myevents">' + (window.websiteUrl || window.location.hostname) + '/myevents</a></div>' + '</div>' + '</div>' + '</div>');
        return thanksPopupStage;
      }
    }
  }, {
    key: "hideProcessingAnimation",
    value: function hideProcessingAnimation() {
      $('.amnp-paypal-loader').parent().parent().remove();
      $('.amnp-processing-charge').parent().parent().remove();
      $('.amnp-processing-charge-sm').remove();
    }
  }, {
    key: "showProcessingAnimation",
    value: function showProcessingAnimation(targetEle) {
      var animbody = $('<div class="events2-reg-thanks-body"></div>');
      var animation = $('<div class="row"><div class="col-md-12"><div class="amnp-paypal-loader"><div class="amnp-spinner"></div></div></div></div>');
      var message = $('<div class="row"><div class="col-md-12"><p class="amnp-processing-charge">Processing booking. Please Wait.</p></div></div>');
      var stage = $('<div class="events2-reg-thanks-stage"></div>');
      animbody.append(animation).append(message);
      targetEle.addClass('events2-reg-paypal-thanks-body');
      stage.append(animbody).appendTo(targetEle);
    }
  }, {
    key: "showProcessingAnimationSmall",
    value: function showProcessingAnimationSmall(targetEle) {
      var mypages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (mypages) {
        $('<div class="ammev-name"><div class="amnp-paypal-loader-sm"><div class="amnp-spinner"></div></div></div>').appendTo(targetEle);
        $('<div class="ammev-name"><p class="amnp-processing-charge-sm">Processing booking. Please Wait.</p></div>').appendTo(targetEle);
      } else {
        var animbody = $('<div class="events2-reg-thanks-body"></div>');
        var animation = $('<div class="row"><div class="col-md-12"><div class="amnp-paypal-loader-sm"><div class="amnp-spinner"></div></div></div></div>');
        var message = $('<div class="row"><div class="col-md-12"><p class="amnp-processing-charge">Processing booking. Please Wait.</p></div></div>');
        var stage = $('<div class="events2-reg-thanks-stage"></div>');
        animbody.append(animation).append(message);
        targetEle.addClass('events2-reg-paypal-thanks-body');
        stage.append(animbody).appendTo(targetEle);
      }
    }
  }, {
    key: "showProcessingAnimationSmallCP",
    value: function showProcessingAnimationSmallCP(targetEle) {
      $('<div class="ammev-name"><p class="amnp-processing-charge-sm">Processing... Please Wait.</p></div>').appendTo(targetEle);
    }
  }, {
    key: "showProcessingErrorAnimation",
    value: function showProcessingErrorAnimation(targetEle, type) {
      var msg = '';

      switch (type) {
        case 'attend':
          msg = 'Event Registration(s) Failed to Save. Card was not charged. Please try again.';
          break;

        case 'reserve':
          msg = 'Room Booking(s) Failed to Save. Card was not charged. Please try again.';
          break;
      }

      var animationHTML = "\n\t\t\t<div class=\"row\">\n\t\t\t\t<div class=\"col-md-12\">\n\t\t\t\t\t<div class=\"amnp-paypal-loader\">\n\t\t\t\t\t\t<div class=\"svg-box\">\n\t\t\t\t\t\t\t<svg class=\"circular red-stroke\">\n\t\t\t\t\t\t\t\t<circle class=\"path\" cx=\"75\" cy=\"75\" r=\"50\" fill=\"none\" stroke-width=\"5\" stroke-miterlimit=\"10\"/>\n\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t<svg class=\"circular red-stroke\">\n\t\t\t\t\t\t\t\t<circle class=\"path\" cx=\"75\" cy=\"75\" r=\"50\" fill=\"none\" stroke-width=\"5\" stroke-miterlimit=\"10\"/>\n\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t<svg class=\"cross red-stroke\">\n\t\t\t\t\t\t\t\t<g transform=\"matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-502.652,-204.518)\">\n\t\t\t\t\t\t\t\t\t<path class=\"first-line\" d=\"M634.087,300.805L673.361,261.53\" fill=\"none\"/>\n\t\t\t\t\t\t\t\t</g>\n\t\t\t\t\t\t\t\t<g transform=\"matrix(-1.28587e-16,-0.79961,0.79961,-1.28587e-16,-204.752,543.031)\">\n\t\t\t\t\t\t\t\t\t<path class=\"second-line\" d=\"M634.087,300.805L673.361,261.53\"/>\n\t\t\t\t\t\t\t\t</g>\n\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class=\"row\">\n\t\t\t\t<div class=\"col-md-12\">\n\t\t\t\t\t<p class=\"amnp-processing-final\">".concat(msg, "</p>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t");
      var $animation = $(animationHTML);
      targetEle.append($animation);
    }
  }, {
    key: "showProcessingSuccessAnimation",
    value: function showProcessingSuccessAnimation(targetEle, type) {
      var msg = '';

      switch (type) {
        case 'attend':
          msg = 'Event Registration(s) saved and charged successfully.';
          break;

        case 'reserve':
          msg = 'Room Booking(s) saved and charged successfully.';
          break;
      }

      var animationHTML = "\n\t\t\t<div class=\"row\">\n\t\t\t\t<div class=\"col-md-12\">\n\t\t\t\t\t<div class=\"amnp-paypal-loader\">\n\t\t\t\t\t\t<div class=\"svg-box\">\n\t\t\t\t\t\t\t<svg class=\"circular green-stroke\"><circle class=\"path\" cx=\"75\" cy=\"75\" r=\"50\" fill=\"none\" stroke-width=\"5\" stroke-miterlimit=\"10\"/></svg><svg class=\"checkmark green-stroke\">\n\t\t\t\t\t\t\t\t<g transform=\"matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)\">\n\t\t\t\t\t\t\t\t\t<path class=\"checkmark__check\" fill=\"none\" d=\"M616.306,283.025L634.087,300.805L673.361,261.53\"/>\n\t\t\t\t\t\t\t\t</g>\n\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class=\"row\">\n\t\t\t\t<div class=\"col-md-12\">\n\t\t\t\t\t<p class=\"amnp-processing-final\">".concat(msg, "</p>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t");
      var $animation = $(animationHTML);
      targetEle.append($animation);
    }
  }, {
    key: "showReserveSummary",
    value: function showReserveSummary(bookingData, txData, isControl) {
      var self = this;
      var bookings = JSON.parse(bookingData);
      var blocks = '';
      var body = '';
      var head = '';
      var page = $("#paypalResponsePage");
      var stage = $('.amnp-booker-holder');
      var foot = $('<div class="events2-reg-thanks-online">' + '	<div class="events2-reg-thanks-online-title">View online</div>' + '	<div>You can manage your room bookings at:</div>' + '	<div><a href="/myreservations">' + window.location.hostname + '/myreservations</a></div>' + '</div>');
      var storage = window.sessionStorage || false;
      var screenThankyou = $('<div class="amnp-thanks-screen"></div>').appendTo(page);
      stage.empty();
      stage.append('<div class="events2-reg-thanks-title">Your room booking information</div>');
      this.getClientSettings().then(function (ok) {
        if (ok) {
          for (var b = 0; b < bookings.length; b++) {
            blocks = self.createBookingBlock(bookings[b]);
            body = $('<div class="events2-reg-thanks-body"></div>');
            head = $('<div class="events2-reg-thanks-head"></div>');
            body.append(blocks.body);
            head.append(blocks.head);
            stage.append(head).append(body);
            screenThankyou.append(stage);
          }

          screenThankyou.addClass('events2-reg-paypal-thanks-body');
          if (storage) storage.removeItem('communicoReserveCart');
          screenThankyou.append(foot);
        }
      });
    }
  }, {
    key: "updateForm",
    value: function updateForm() {
      var field = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      this.$form.children(field).val(value);
    }
  }, {
    key: "getClientSettings",
    value: function () {
      var _getClientSettings = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                if (!(this.client && this.client !== '')) {
                  _context11.next = 9;
                  break;
                }

                this.DataFunctions = new CoDataFunctions(this.client);
                _context11.next = 4;
                return this.DataFunctions.clientSettings;

              case 4:
                this.clientSettings = _context11.sent;
                _context11.next = 7;
                return this.DataFunctions.clientInfo;

              case 7:
                this.clientInfo = _context11.sent;
                return _context11.abrupt("return", true);

              case 9:
                return _context11.abrupt("return", false);

              case 10:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function getClientSettings() {
        return _getClientSettings.apply(this, arguments);
      }

      return getClientSettings;
    }()
  }, {
    key: "getRefund",
    value: function () {
      var _getRefund = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(service, params) {
        var self, response, json;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                self = this;
                params.service = service;
                _context12.next = 4;
                return fetch("".concat(self.apiURL, "/v2/").concat(self.client, "/paypal/payflow_refund"), {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(params)
                });

              case 4:
                response = _context12.sent;
                _context12.next = 7;
                return response.json();

              case 7:
                json = _context12.sent;
                return _context12.abrupt("return", json);

              case 9:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function getRefund(_x, _x2) {
        return _getRefund.apply(this, arguments);
      }

      return getRefund;
    }()
  }, {
    key: "getTokens",
    value: function () {
      var _getTokens = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(params) {
        var self, response, json;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                self = this;
                _context13.next = 3;
                return fetch("".concat(self.apiURL, "/v2/").concat(self.client, "/paypal/payflow_tokens"), {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(params)
                });

              case 3:
                response = _context13.sent;
                _context13.next = 6;
                return response.json();

              case 6:
                json = _context13.sent;

                if (!(typeof json.SECURETOKEN !== 'undefined')) {
                  _context13.next = 12;
                  break;
                }

                this.paypalChargeData.SECURETOKEN = json.SECURETOKEN;
                this.paypalChargeData.SECURETOKENID = json.SECURETOKENID;
                _context13.next = 13;
                break;

              case 12:
                return _context13.abrupt("return", false);

              case 13:
                return _context13.abrupt("return", true);

              case 14:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function getTokens(_x3) {
        return _getTokens.apply(this, arguments);
      }

      return getTokens;
    }()
  }, {
    key: "sendEventTransaction",
    value: function () {
      var _sendEventTransaction = _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
        var transactionData,
            sessionId,
            isRefund,
            isSeries,
            isControl,
            tenderType,
            self,
            hinput,
            form,
            pciTransactionData,
            tokens,
            ti3,
            ti4,
            ti5,
            ti6,
            iframe,
            _args14 = arguments;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                transactionData = _args14.length > 0 && _args14[0] !== undefined ? _args14[0] : null;
                sessionId = _args14.length > 1 && _args14[1] !== undefined ? _args14[1] : 0;
                isRefund = _args14.length > 2 && _args14[2] !== undefined ? _args14[2] : false;
                isSeries = _args14.length > 3 && _args14[3] !== undefined ? _args14[3] : false;
                isControl = _args14.length > 4 && _args14[4] !== undefined ? _args14[4] : false;
                tenderType = _args14.length > 5 && _args14[5] !== undefined ? _args14[5] : 'C';
                self = this;
                hinput = $('<input type="hidden">');
                form = null;

                if (!(transactionData === null)) {
                  _context14.next = 11;
                  break;
                }

                return _context14.abrupt("return", false);

              case 11:
                _context14.next = 13;
                return self.getClientSettings();

              case 13:
                transactionData['MODE'] = self.testMode ? 'TEST' : 'LIVE';
                transactionData['TENDER'] = tenderType;
                transactionData['TRXTYPE'] = 'S';

                if (!isRefund) {
                  _context14.next = 24;
                  break;
                }

                transactionData['TRXTYPE'] = 'C';
                form = $('<form />').addClass('hidden').attr('id', 'PayPalForm').attr('action', self.payPalUrl);
                _context14.next = 21;
                return self.getRefund('ATTEND', transactionData);

              case 21:
                return _context14.abrupt("return", _context14.sent);

              case 24:
                form = $('#PayPalForm');

                if (!(form.length > 0)) {
                  _context14.next = 57;
                  break;
                }

                pciTransactionData = JSON.parse(JSON.stringify(transactionData));
                delete pciTransactionData['ACCT'];
                delete pciTransactionData['CVV2'];
                delete pciTransactionData['EXPDATE'];
                _context14.next = 32;
                return self.getTokens(pciTransactionData);

              case 32:
                tokens = _context14.sent;

                if (!tokens) {
                  _context14.next = 54;
                  break;
                }

                Object.keys(transactionData).forEach(function (tdkey) {
                  if (typeof self.paypalChargeData[tdkey] !== 'undefined') {
                    self.paypalChargeData[tdkey] = transactionData[tdkey];
                  }
                });
                Object.keys(self.paypalChargeData).forEach(function (key) {
                  if ($('#' + key, form).length === 0) {
                    var ti = hinput.clone();
                    ti.attr('id', key);
                    ti.attr('name', key);
                    ti.val(self.paypalChargeData[key]);
                    ti.appendTo(form);
                  } else {
                    $('#' + key, form).val(self.paypalChargeData[key]);
                  }
                });

                if (sessionId !== 0) {
                  ti3 = hinput.clone();
                  ti3.attr('id', 'USER1').attr('name', 'USER1').val(sessionId).appendTo(form);
                }

                ti4 = hinput.clone();
                ti4.attr('id', 'USER2').attr('name', 'USER2').val(self.clientInfo.data.id).appendTo(form);
                ti5 = hinput.clone();
                ti5.attr('id', 'USER3').attr('name', 'USER3').val(isControl ? '1' : '0').appendTo(form);
                ti6 = hinput.clone();
                ti6.attr('id', 'USER4').attr('name', 'USER4').val('attend').appendTo(form);
                iframe = $("<iframe src='".concat(self.payPalUrl, "' height='400px' width='100%' name='pp-iframe' style='display: none; overflow-y: hidden;' frameBorder='0' scrolling='no'></iframe>"));
                $('.events2-reg-paypal-thanks-body').append(iframe);
                form.css('display', 'none');
                form.attr('target', 'pp-iframe');
                form.attr('method', 'post');
                $(document.body).append(form);
                form.submit();
                setInterval(function () {
                  if ($(iframe).attr('src').indexOf("".concat(self.payPalUrl)) != -1) {
                    self.hideProcessingAnimation();
                    $(iframe).css("display", "block");
                  }
                }, 4000);
                return _context14.abrupt("return", true);

              case 54:
                return _context14.abrupt("return", false);

              case 55:
                _context14.next = 58;
                break;

              case 57:
                return _context14.abrupt("return", false);

              case 58:
                return _context14.abrupt("return");

              case 59:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function sendEventTransaction() {
        return _sendEventTransaction.apply(this, arguments);
      }

      return sendEventTransaction;
    }()
  }, {
    key: "sendReserveTransaction",
    value: function () {
      var _sendReserveTransaction = _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
        var transactionData,
            bookingsToCharge,
            sessionId,
            isRefund,
            isControl,
            isMediated,
            tenderType,
            self,
            hinput,
            form,
            transType,
            amount,
            bookingIds,
            send,
            forwardData,
            pciTransactionData,
            tokens,
            ti3,
            ti4,
            ti5,
            ti6,
            iframe,
            _args15 = arguments;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                transactionData = _args15.length > 0 && _args15[0] !== undefined ? _args15[0] : null;
                bookingsToCharge = _args15.length > 1 && _args15[1] !== undefined ? _args15[1] : [];
                sessionId = _args15.length > 2 && _args15[2] !== undefined ? _args15[2] : '';
                isRefund = _args15.length > 3 && _args15[3] !== undefined ? _args15[3] : false;
                isControl = _args15.length > 4 && _args15[4] !== undefined ? _args15[4] : false;
                isMediated = _args15.length > 5 && _args15[5] !== undefined ? _args15[5] : false;
                tenderType = _args15.length > 6 && _args15[6] !== undefined ? _args15[6] : 'C';
                self = this;
                hinput = $('<input type="hidden">');
                form = null;
                transType = 'S';
                amount = 0.00;

                if (!(transactionData === null)) {
                  _context15.next = 14;
                  break;
                }

                return _context15.abrupt("return", false);

              case 14:
                _context15.next = 16;
                return self.getClientSettings();

              case 16:
                transactionData['MODE'] = self.testMode ? 'TEST' : 'LIVE';
                transactionData['TENDER'] = tenderType;
                transactionData['TRXTYPE'] = transType;
                transactionData.bookingIds = [];

                if (!isRefund) {
                  _context15.next = 33;
                  break;
                }

                transType = !isMediated ? 'C' : 'V';
                transactionData['TRXTYPE'] = transType;
                form = $('<form />').addClass('hidden').attr('id', 'PayPalForm').attr('action', self.payPalUrl);
                bookingIds = [];
                bookingsToCharge.forEach(function (booking) {
                  if (typeof booking.amt !== 'undefined') {
                    amount += parseFloat(booking.amt);
                    bookingIds.push(booking.id);
                    send = true;
                  }
                });
                transactionData.AMT = amount.toFixed(2);
                transactionData.bookingIds = bookingIds.join(',');
                _context15.next = 30;
                return self.getRefund('RESERVE', transactionData);

              case 30:
                return _context15.abrupt("return", _context15.sent);

              case 33:
                form = $('#PayPalForm');

              case 34:
                if (isMediated && !isRefund) {
                  transType = 'A';
                }

                if (!(form.length > 0)) {
                  _context15.next = 76;
                  break;
                }

                send = false;
                forwardData = [];
                transactionData['TRXTYPE'] = transType;
                amount = 0.00;
                bookingsToCharge.forEach(function (booking) {
                  if (booking.json.ok && typeof booking.json.id !== 'undefined' && typeof booking.json.amt !== 'undefined') {
                    amount += parseFloat(booking.json.amt);
                    if (booking.json.status && parseInt(booking.json.status, 10) === 3) transactionData.TRXTYPE = 'A';
                    send = true;
                    forwardData.push(booking.json);
                  }
                });
                transactionData.AMT = amount.toFixed(2);
                pciTransactionData = JSON.parse(JSON.stringify(transactionData));
                delete pciTransactionData['ACCT'];
                delete pciTransactionData['CVV2'];
                delete pciTransactionData['EXPDATE'];
                _context15.next = 48;
                return self.getTokens(pciTransactionData);

              case 48:
                tokens = _context15.sent;

                if (!tokens) {
                  _context15.next = 73;
                  break;
                }

                Object.keys(transactionData).forEach(function (tdkey) {
                  if (typeof self.paypalChargeData[tdkey] !== 'undefined') {
                    self.paypalChargeData[tdkey] = transactionData[tdkey];
                  }
                });
                Object.keys(self.paypalChargeData).forEach(function (key) {
                  if ($('#' + key, form).length === 0) {
                    var ti = hinput.clone();
                    ti.attr('id', key);
                    ti.attr('name', key);
                    ti.val(self.paypalChargeData[key]);
                    ti.appendTo(form);
                  } else {
                    $('#' + key, form).val(self.paypalChargeData[key]);
                  }
                });

                if (sessionId !== '') {
                  ti3 = hinput.clone();
                  ti3.attr('id', 'USER1').attr('name', 'USER1').val(sessionId).appendTo(form);
                }

                ti4 = hinput.clone();
                ti4.attr('id', 'USER2').attr('name', 'USER2').val(self.clientInfo.data.id).appendTo(form);
                ti5 = hinput.clone();
                ti5.attr('id', 'USER3').attr('name', 'USER3').val(isControl ? '1' : '0').appendTo(form);
                ti6 = hinput.clone();
                ti6.attr('id', 'USER4').attr('name', 'USER4').val('reserve').appendTo(form);

                if (!send) {
                  _context15.next = 71;
                  break;
                }

                iframe = $("<iframe src='".concat(self.payPalUrl, "' height='400px' width='100%' name='pp-iframe' style='display: none; overflow-y: hidden;' frameBorder='0' scrolling='no'></iframe>"));
                $('.events2-reg-thanks-body').append(iframe);
                $('.card-form').show();
                form.css('display', 'none');
                form.attr('target', 'pp-iframe');
                form.attr('method', 'post');
                form.after(iframe);
                $(document.body).append(form);
                form.submit();
                setInterval(function () {
                  if ($(iframe).attr('src').indexOf("".concat(self.payPalUrl)) != -1) {
                    self.hideProcessingAnimation();
                    $(iframe).css("display", "block");
                    $('.amnp-confirm-screen').css("display", "block");
                    $('[class*="amnp-booking-"]').css("display", "none");
                    $('.amnp-buttons').css("display", "none");
                  }
                }, 4000);
                return _context15.abrupt("return", true);

              case 71:
                _context15.next = 74;
                break;

              case 73:
                return _context15.abrupt("return", false);

              case 74:
                _context15.next = 77;
                break;

              case 76:
                return _context15.abrupt("return", false);

              case 77:
                return _context15.abrupt("return");

              case 78:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function sendReserveTransaction() {
        return _sendReserveTransaction.apply(this, arguments);
      }

      return sendReserveTransaction;
    }()
  }]);

  return PayPalPayFlow;
}();