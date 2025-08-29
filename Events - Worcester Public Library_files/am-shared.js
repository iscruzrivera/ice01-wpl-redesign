"use strict";

(function ($) {
  $.fn['amShared'] = {};

  $.fn['amShared']._getJSON = function (url, params) {
    return new Promise(function (resolve, reject) {
      $.getJSON(url, params).done(resolve).fail(reject);
    });
  };

  $.fn['amShared']._bindFormEvents = function (form) {
    form.on('focus', '.events2-missing-field', function (event) {
      $(this).removeClass('events2-missing-field');
    });
  };

  $.fn['amShared']._isFormClean = function (form) {
    var clean = true;
    var requiredFields = $('label>.required-field', form);

    for (var ii = requiredFields.length - 1; ii >= 0; ii--) {
      var input = $(requiredFields[ii]).closest('label').parent().find('.am-input');
      var inputClean = true;

      if (input.get(0)) {
        switch (input.get(0).tagName.toLowerCase()) {
          case 'input':
            switch (input.attr('type')) {
              case 'checkbox':
                inputClean = input.is(':checked');
                break;

              default:
                inputClean = input.val().trim().length > 0;
            }

            break;

          case 'select':
            if (input.attr('id') === 'ticket-dd') {
              var selected = input.children('option:selected').val();
              inputClean = typeof selected !== 'undefined' && selected !== null ? selected.length > 0 : false;
            } else {
              inputClean = input.val().length > 0;
            }

            break;

          case 'textarea':
          default:
            inputClean = input.val().length > 0;
        }
      }

      if (!inputClean) {
        input.addClass("hightlight-field").delay(6000).queue(function () {
          $(this).removeClass("hightlight-field").dequeue();
        });
        clean = false;
      }
    }

    return clean;
  };

  $.fn['amShared']._eraseCookie = function (name) {
    this._createCookie(name, "", -1);
  };

  $.fn['amShared']._createCookie = function (name, value, days) {
    var expires = "";

    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toGMTString();
    }

    document.cookie = name + "=" + value + expires + "; path=/";
  };

  $.fn['amShared']._readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];

      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }

      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  };

  $.fn['amShared']._createFieldWithObject = function (field) {
    return $.fn['amShared']._createField(field.name, field.type, field.title, field.required, field.append, field.helpText, field.min, field.link);
  };

  $.fn['amShared']._createField = function (id, type, label, required, append, desc, min, link) {
    if (!type) type = 'text';
    if (!label) label = '';
    if (!desc) desc = '';
    if (!min) min = '0';
    var field = $('<div class="row amf-row"></div>');
    field.addClass('am-field-' + type);

    if (append) {
      $('<div class="col-sm-8"><div class="input-group field"></div></div>').appendTo(field);
      $('.input-group', field).append(append);
    } else {
      $('<div class="col-sm-8 field"></div>').appendTo(field);
    }

    var isInModal = $(".amPopup .amPopupContent").length > 0;
    var isInRoomPicker = $("#content .roompicker").length > 0;
    var isInControlPanel = $(".control-layout").length > 0;
    var isReserveScreen = $('.amnp-reserve-screen-shared').length > 0;
    var helpEl = $('<div class="col-sm-4"></div><div class="col-sm-8 am-form-desc">' + desc + '</div>');

    switch (type) {
      case 'textarea':
        field.find('.field').prepend('<textarea class="am-input form-control" id="' + id + '"></textarea>');
        break;

      case 'select':
        field.find('.field').prepend('<select class="am-input form-control" id="' + id + '"></select>');
        break;

      case 'number':
        field.find('.field').prepend('<input type="' + type + '" class="am-input form-control" min="' + min + '" pattern="[0-9]" id="' + id + '">');
        break;

      case 'checkbox':
        field.find('.field').prepend('<input type="' + type + '" class="am-input" id="' + id + '">');
        var formDescEl = $(helpEl).filter('.am-form-desc');
        var checkboxElContainer = field.find('.field input').parent();

        if (isInModal || isInRoomPicker) {
          checkboxElContainer.removeClass('col-sm-8').addClass('col-sm-1').css('padding-left', 0).css('padding-right', 0).css('padding-top', '7px');
          $(helpEl).filter('.col-sm-4').css('display', 'none');
          formDescEl.removeClass('col-sm-8').addClass('col-sm-6').css('padding-top', '8px').css('padding-left', 0);
        }

        if (isInControlPanel && isReserveScreen) {
          formDescEl.css('padding-top', 0);
          checkboxElContainer.css('padding-top', 0);
        }

        break;

      default:
        field.find('.field').prepend('<input type="' + type + '" class="am-input form-control" id="' + id + '">');
        break;
    }

    var labelEl = $('<label for="' + id + '" class="col-sm-4 control-label">' + label + ' </label>').prependTo(field);
    if (required) labelEl.append('<span class="required-field"></span>');

    if (undefined !== link && false !== link) {
      helpEl.filter('.am-form-desc').wrapInner('<a target="_blank" href="' + link + '"" ></a>');
    }

    helpEl.appendTo(field);
    field.on('click', 'input,textarea,select', function () {
      $(this).removeClass('hightlight-field');
    });
    return field;
  };
})(jQuery);