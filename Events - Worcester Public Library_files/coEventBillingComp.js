"use strict";

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CoEventBilling = function () {
  function CoEventBilling() {
    var eventId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var dbData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, CoEventBilling);

    this.eventId = typeof eventId === 'undefined' || eventId === null ? 0 : eventId;
    this.typeId = 0;
    this.body = '';
    this.header = '';
    this.display = '';
    this.mode = typeof mode === 'undefined' || mode === null ? 0 : mode;
    this.ticketData = typeof dbData === 'undefined' || dbData === null ? [] : typeof dbData.ticketData !== 'undefined' ? _typeof(dbData.ticketData) === 'object' && !Array.isArray(dbData.ticketData) ? [dbData] : dbData.ticketData : [];
    this.numTickets = 0;
    this.showActive = 0;
    this.showCost = 0;
    this.locked = 0;
  }

  _createClass(CoEventBilling, [{
    key: "addTicketType",
    value: function addTicketType() {
      var self = this;
      var types = document.querySelectorAll('.ticket-group-input');
      var box = document.querySelector('#ticket-box');
      var ele = self.buildTicketInput(null, types.length);
      box.append(ele);
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var self = this;
      $('.ticket-debug-button').on('click', function () {
        self.getTicketTypeValues();
      });
      $('.ticket-add-button').on('click', function () {
        self.addTicketType();
      });
      $('.enable_billing').on('switchChange.bootstrapSwitch', function (e, state) {
        self.toggleGroupInputCost();
      }).bootstrapSwitch();
    }
  }, {
    key: "buildTicketInput",
    value: function buildTicketInput(ticket, idx) {
      if (typeof idx === 'undefined') idx = 0;
      var self = this;
      var tindex = idx;
      var dindex = (tindex + 1).toString();
      var cgi = document.createElement('co-group-input');
      var costValue = ticket !== null ? typeof ticket.amount !== 'undefined' ? parseFloat(ticket.amount).toFixed(2) : '' : '';
      var isActive = ticket !== null ? typeof ticket.active !== 'undefined' ? ticket.active : 0 : 0;
      var typeValue = ticket !== null ? typeof ticket.name !== 'undefined' ? ticket.name : '' : '';
      var maxValue = ticket !== null ? typeof ticket.max !== 'undefined' ? ticket.max : 0 : 0;
      var typeId = ticket !== null ? typeof ticket.typeId !== 'undefined' ? parseInt(ticket.typeId) : 0 : 0;
      var readOnly = self.locked === 1;
      var disabled = self.locked === 1;
      var inputs = [{
        'label': 'TYPE',
        'value': typeValue,
        'valueName': 'type',
        'options': 'null',
        'type': 'text',
        'disabled': false,
        'readOnly': false,
        'id': 'registration_type_' + dindex,
        'size': 'col-lg-4 col-md-4 col-sm-4 col-xs-4'
      }, {
        'label': 'MAX QTY',
        'value': maxValue,
        'valueName': 'qty',
        'options': 'null',
        'type': 'text',
        'disabled': false,
        'readOnly': false,
        'id': 'registration_type_qty_' + dindex,
        'size': 'col-tiny'
      }];
      inputs.push({
        'label': 'COST',
        'icon': '$',
        'value': costValue,
        'valueName': 'cost',
        'options': 'null',
        'type': 'text',
        'disabled': disabled,
        'readOnly': readOnly,
        'visible': self.showCost,
        'id': 'registration_type_cost_' + dindex,
        'size': 'col-tiny'
      });

      if (self.showActive) {
        inputs.push({
          'label': 'ACTIVE',
          'value': isActive,
          'valueName': 'active',
          'options': 'single',
          'type': 'checkbox',
          'disabled': disabled,
          'readOnly': readOnly,
          'id': 'registration_type_active_' + dindex,
          'size': 'col-tiny'
        });
      }

      cgi.classList.add('ticket-group-input');
      cgi.setAttribute('icon', 'am-profile');
      cgi.setAttribute('include-labels', tindex === 0 ? '1' : '0');
      cgi.setAttribute('allow-delete', self.locked > 0 ? '0' : '1');
      cgi.setAttribute('edit-popup', '0');
      cgi.setAttribute('debug', '0');
      cgi.setAttribute('data-id', 'ticketIndex-' + dindex);
      cgi.setAttribute('data-typeid', typeId);
      cgi.setAttribute('data-inputs', JSON.stringify(inputs));
      return cgi;
    }
  }, {
    key: "buildTicketList",
    value: function buildTicketList() {
      var list = [];
      var self = this;

      if (self.ticketData.length > 0) {
        self.ticketData.forEach(function (ticket, idx) {
          list.push(self.buildTicketInput(ticket, idx));
        });
      } else {
        list.push(self.buildTicketInput(null, 0));
      }

      var box = document.querySelector('#ticket-box');
      list.forEach(function (l) {
        box.append(l);
      });
    }
  }, {
    key: "getTicketTypeValues",
    value: function getTicketTypeValues() {
      var ret = [];
      var self = this;
      var types = document.querySelectorAll('.ticket-group-input');

      if (types.length > 0) {
        types.forEach(function (type) {
          var tid = type.getAttribute('data-typeid');
          var t = type.get('type');
          var q = type.get('qty');
          var c = type.get('cost');
          var a = type.get('active');

          if (!self.showActive) {
            a = 1;
          }

          if (!self.showCost) {
            c = 0.00;
          }

          var o = {
            'active': a,
            'cost': c,
            'qty': q,
            'type': t
          };

          if (tid > 0) {
            o.typeid = tid;
          }

          ret.push(o);
          console.log('Group Input Data: ', o);
        });
      }

      return ret;
    }
  }, {
    key: "toggleGroupInputCost",
    value: function toggleGroupInputCost() {
      var self = this;
      var costInputs = document.querySelectorAll('[v-name=\'cost\']');
      self.showCost = !self.showCost;

      if (costInputs.length > 0) {
        costInputs.forEach(function (i) {
          i.style.display = self.showCost ? '' : 'none';
        });
      }
    }
  }, {
    key: "init",
    value: function init(eventId, showCost, showActive) {
      var locked = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var templateId = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var self = this;
      var params = {
        eventid: eventId
      };

      if (templateId > 0) {
        params = {
          eventid: templateId
        };
      }

      if (typeof eventId !== 'undefined' && templateId === 0) self.eventId = eventId;
      if (typeof showCost !== 'undefined') self.showCost = showCost;
      if (typeof showActive !== 'undefined') self.showActive = showActive;
      if (typeof locked !== 'undefined') self.locked = locked;
      return new Promise(function (resolve, reject) {
        $.get('/ajax/fetch/get_event_ticket_data', params, function (data) {
          try {
            data = JSON.parse(data);

            if (_typeof(data) === 'object') {
              if (data.type == 'success') {
                self.ticketData = typeof data.ticketData === 'undefined' ? [] : data.ticketData;
                self.numTickets = self.ticketData.length;
                self.buildTicketList();
              } else {
                self.Utils.showAlert(data);
              }
            }

            self.bindEvents();
            resolve(1);
          } catch (err) {
            resolve(0);
          }

          ;
        });
      });
    }
  }, {
    key: "deleteData",
    value: function deleteData(type) {
      var self = this;
      var delfetch = null;

      if (self.typeId > 0) {
        var delData = new FormData();
        delData.append('id', self.typeId);

        if (self.mode === 0) {
          $.post('/ajax/fetch/delete_ticket_type', {
            id: self.typeId
          }, function (data) {
            try {
              if ((typeof deldata === "undefined" ? "undefined" : _typeof(deldata)) === 'object') {
                if (deldata.type == 'success') {
                  closeDialog(true);
                  self.Utils.showAlert(deldata);
                  self.updateTable();
                }
              }

              return 1;
            } catch (err) {
              return 0;
            }

            ;
          });
        }
      } else {
        if (typeof type !== 'undefined') {
          self.ticketData.forEach(function (td, i) {
            if (td.type === type) {
              delete self.ticketData[i];
              self.updateTable();
            }
          });
        }
      }

      return 1;
    }
  }, {
    key: "saveData",
    value: function saveData() {
      var self = this;

      if (self.ticketData.length > 0) {
        if (self.mode === 0) {
          return new Promise(function (resolve, reject) {
            $.post('/ajax/fetch/update_ticket_type', {
              eventId: self.eventId,
              data: JSON.stringify(self.ticketData)
            }, function (data) {
              resolve(data);
            });
          });
        }
      }

      return Promise.resolve({
        type: 'error',
        message: 'failed to save registration type data',
        title: 'Error!'
      });
    }
  }]);

  return CoEventBilling;
}();

var EventBillingDropdown = function (_CoEventBilling) {
  _inherits(EventBillingDropdown, _CoEventBilling);

  var _super = _createSuper(EventBillingDropdown);

  function EventBillingDropdown(eventId, mode, dbData) {
    var _this;

    var enableCost = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var simple = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var controlPanel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    _classCallCheck(this, EventBillingDropdown);

    _this = _super.call(this, eventId, mode, dbData);
    _this.$element = '';
    _this.simple = simple;
    _this.enableCost = enableCost;
    _this.isControl = controlPanel;
    return _this;
  }

  _createClass(EventBillingDropdown, [{
    key: "dropdown",
    get: function get() {
      var row = $("<div />").addClass("row amf-row");
      var field = $("<div />").addClass('col-sm-8 field');
      var label = $("<label for='ticket-dd' class='control-label'></label>").text("Registration").append("<span class='required-field'></span></label>");

      if (this.$element.length === 0) {
        this.buildDropdown();
      }

      if (this.simple) {
        row = $('<div />').addClass('form-pair');
        row.append(label).append(this.$element);
        return row;
      } else {
        label.addClass('col-sm-4');
      }

      field.append(this.$element);
      row.append(label).append(field);
      return row;
    }
  }, {
    key: "buildDropdown",
    value: function buildDropdown() {
      var $dd = $('<select/>');
      $dd.prop('id', 'ticket-dd');
      var self = this;

      try {
        console.log('td: ', self.ticketData);

        if (self.ticketData.length > 0) {
          $dd.empty();
          $dd.append("<option value=''>Select a registration type</option>");
          $dd.addClass("am-input form-control");
          self.ticketData.forEach(function (ticket, idx) {
            var $opt = $('<option />');
            var amount = 0.00;
            var optText = '';

            if (parseInt(ticket.active)) {
              if (!ticket.available && !self.isControl) {
                $opt.prop('disabled', true);
                $opt.text('SOLD OUT');
              }

              $opt.attr('data-available', ticket.available);

              if (self.enableCost) {
                amount = parseFloat(ticket.amount);
                optText = ticket.name + ' - $' + (amount > 0 ? amount.toFixed(2) : '0.00');
                $opt.text(optText);
                $opt.val(ticket.typeId).attr('data-cost', amount.toFixed(2)).attr('data-typeid', ticket.typeId);
              } else {
                amount = 0.00;
                optText = ticket.name;
                $opt.text(optText);
                $opt.val(ticket.typeId).attr('data-cost', amount.toFixed(2)).attr('data-typeid', ticket.typeId);
              }

              $dd.append($opt);
            }
          });
        } else {
          $dd.append("<option value='-1'>No tickets available for event.</option>");
        }

        this.$element = $dd;
      } catch (err) {
        console.log('error: ', err);
        this.$element = '';
      }
    }
  }]);

  return EventBillingDropdown;
}(CoEventBilling);

var EventBillingInfo = function (_CoEventBilling2) {
  _inherits(EventBillingInfo, _CoEventBilling2);

  var _super2 = _createSuper(EventBillingInfo);

  function EventBillingInfo(eventId, mode, dbData) {
    var _this2;

    _classCallCheck(this, EventBillingInfo);

    _this2 = _super2.call(this, eventId, mode, dbData);
    _this2.text = '';
    return _this2;
  }

  _createClass(EventBillingInfo, [{
    key: "info",
    get: function get() {
      if (this.text.length === 0) {
        this.buildInfo();
      }

      return this.text;
    }
  }, {
    key: "buildInfo",
    value: function buildInfo() {
      var self = this;
      self.text = $('<span class="fa-stack ticket-symbol" style="font-size:12px"><i class="fa fa-circle fa-stack-2x" style="color: #2bafbe"></i><i class="fa fa-usd fa-stack-1x fa-inverse"></i></span> Paid Registration ');
    }
  }]);

  return EventBillingInfo;
}(CoEventBilling);

var EventBillingMultipleSelector = function (_CoEventBilling3) {
  _inherits(EventBillingMultipleSelector, _CoEventBilling3);

  var _super3 = _createSuper(EventBillingMultipleSelector);

  function EventBillingMultipleSelector(eventId, mode, dbData) {
    var _this3;

    var enableCost = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var seatLimit = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var patronView = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    var ticketsBooked = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [];
    var mainTicketType = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;

    _classCallCheck(this, EventBillingMultipleSelector);

    _this3 = _super3.call(this, eventId, mode, dbData);
    _this3.enableCost = enableCost;
    _this3.seatLimit = parseInt(seatLimit);
    _this3.viewmode = patronView;
    _this3.options = [];
    _this3.selected = [];
    _this3.ticketQty = [];
    _this3.types = [];
    _this3.$element = '';
    _this3.ticketsBooked = ticketsBooked;
    _this3.mainTicketType = mainTicketType;
    return _this3;
  }

  _createClass(EventBillingMultipleSelector, [{
    key: "selector",
    get: function get() {
      var row = $("<div />").addClass("row amf-row");
      var field = $("<div />").addClass('col-sm-12');
      var labelRow = $("<div class='col-sm-12'><h5>Choose registration type <span class='required-field'></span></h5></div>");

      if (this.$element.length === 0) {
        this.$element = this.buildList();
        this.$element.data({
          'regType': this
        });
      }

      field.append(this.$element);
      row.append(labelRow).append(field);
      return row;
    }
  }, {
    key: "buildQtyDropdown",
    value: function buildQtyDropdown(min, max) {
      var qtyDD = $('<select class="list-ticket-qty-dd"/>');

      if (max > self.seatLimit && self.seatLimit > 0) {
        max = self.seatLimit;
      }

      for (var q = min; q <= max; q++) {
        var opt = $('<option />');
        opt.text(q).val(q);
        qtyDD.append(opt);
      }

      return qtyDD;
    }
  }, {
    key: "buildList",
    value: function buildList() {
      var self = this;

      if (self.ticketData.length > 0) {
        var listGroup = $('<div class="list-group ticket-list" />');
        var listItem = $('<div class="list-group-item ticket-list-item" />');
        var listItemContent = $('<div class="list-group-item-text ticket-item-content" />');
        var itemSelected = false;
        self.ticketData.forEach(function (ticket, idx) {
          var tempItem = listItem.clone();
          var tempContent = listItemContent.clone();
          var tempTitle = $('<div class="list-ticket-title" />');
          var tempCost = $('<div class="list-ticket-cost" />');
          var tempQty = $('<div class="list-ticket-qty" />');
          var tempQtyDD = null;
          var amount = 0.00;
          var available = parseInt(ticket.available);
          var ticketTypeInt = Number(ticket.typeId);
          var ticketsBooked = self.ticketsBooked && Boolean(self.ticketsBooked[ticketTypeInt]) ? self.ticketsBooked[ticketTypeInt] : 0;

          if (parseInt(ticket.active)) {
            var minTicketNum = ticketTypeInt == self.mainTicketType ? 1 : 0;

            if (available <= ticketsBooked) {
              tempCost.text('FULL');
              tempQtyDD = self.buildQtyDropdown(Math.max(minTicketNum, ticketsBooked - 100), ticketsBooked);
            } else {
              tempQtyDD = self.buildQtyDropdown(Math.max(minTicketNum, ticketsBooked - 100), available);

              if (!itemSelected) {
                window.tempQtyDD = tempQtyDD;
                tempQtyDD.val(0);
                itemSelected = true;
              }

              if (self.enableCost) {
                amount = parseFloat(ticket.amount);
                tempCost.text('$' + (amount > 0 ? amount.toFixed(2) : '0.00'));
              } else {
                amount = 0.00;
                tempCost.text('');
              }
            }

            tempTitle.text(ticket.name);
            tempQtyDD.attr('data-cost', amount.toFixed(2)).attr('data-typeid', ticket.typeId).attr('data-limit', self.seatLimit).attr('data-type', ticket.name).attr('data-left', ticket.available);

            if (tempQtyDD !== null) {
              tempQty.append(tempQtyDD);
            } else {
              tempQty.text('n/a');
            }

            tempContent.append(tempTitle).append(tempCost).append(tempQty);
            tempItem.append(tempContent);
            listGroup.append(tempItem);
          }
        });
        return listGroup;
      }

      return false;
    }
  }, {
    key: "hasSelection",
    value: function hasSelection() {
      if (this.$element) {
        var $dd = this.$element.find('select.list-ticket-qty-dd');
        var sum = 0;

        for (var i = 0; i < $dd.length; i++) {
          var $el = $($dd[i]);
          sum += parseInt($el.val());
        }

        return sum > 0;
      }

      return false;
    }
  }, {
    key: "highlightFields",
    value: function highlightFields() {
      if (this.$element) {
        var $dd = this.$element.find('select.list-ticket-qty-dd');
        $dd.each(function (ix, el) {
          $(el).addClass("hightlight-field").delay(6000).queue(function () {
            $(this).removeClass("hightlight-field").dequeue();
          });
        });
      }
    }
  }, {
    key: "updateList",
    value: function updateList(ticketData, ticketsBooked) {
      this.ticketData = ticketData;
      this.ticketsBooked = ticketsBooked;
      $('.list-ticket-qty-dd').each(function () {
        var ticketId = Number($(this).attr('data-typeid'));
        var isFull = $(this).attr('data-left') == ticketsBooked[ticketId];
        $(this).parent().siblings('.list-ticket-cost').text(isFull ? 'FULL' : '');
      });
    }
  }]);

  return EventBillingMultipleSelector;
}(CoEventBilling);

var EventBillingPaymentForm = function () {
  function EventBillingPaymentForm() {
    var offline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      off: false,
      txt: ''
    };
    var showOffline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, EventBillingPaymentForm);

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
    this.offline = offline.off;
    this.offlineText = offline.txt;
    var error = $('<div class="amnp-spacer"><div class="amnp-error-message"></div></div>');
    var offlineInput = '<label class="btn btn-default">' + '<input type="radio" name="options" value="offline" autocomplete="off">Pay In Person</label>';
    var payType = showOffline ? $('<div class="amnp-payment-toggle">' + '<label  class="col-sm-4 control-label">Payment type' + '</label>' + '<div class="col-sm-8 field">' + '<div class="btn-group" data-toggle="buttons">' + '<label class="btn btn-default active">' + '<input type="radio" name="options" value="card" autocomplete="off" checked>Card</label>' + offlineInput + '</div>' + '</div>' + '<div class="col-sm-4">' + '</div>' + '<div class="col-sm-8 am-form-desc">' + '</div>' + '</div>') : $('<div class="amnp-payment-toggle"></div>');
    var offType = $('<div class="amnp-payment-toggle"></div>');
    var offlineForm = $('<div class="amnp-offline-form"></div>').html(this.offlineText).css('text-align', 'center');
    this.offlineForm = [{
      label: '',
      html: offType,
      type: 'content-block',
      id: 'paymentTypeBlock'
    }, {
      label: '',
      html: offlineForm,
      type: 'content-block',
      id: 'offlineMessageBlock'
    }], this.paymentForm = [{
      label: '',
      html: error,
      type: 'content-block',
      id: 'errorDetails',
      hide: true,
      "class": 'payform-field'
    }, {
      label: '',
      html: payType,
      type: 'content-block',
      id: 'paymentTypeBlock'
    }, {
      label: 'First Name',
      type: 'text',
      id: 'firstName',
      required: true,
      "class": 'payform-field'
    }, {
      label: 'Last Name',
      type: 'text',
      id: 'lastName',
      required: true,
      "class": 'payform-field'
    }, {
      label: 'Card Number',
      type: 'ccard',
      id: 'cardNumber',
      required: true,
      "class": 'payform-field',
      placeholder: '1234 5678 9012 3456'
    }, {
      label: 'Expiration',
      type: 'expiration',
      id: 'expiration',
      required: true,
      "class": 'payform-field',
      placeholder: 'MM / YYYY'
    }, {
      label: 'CVC',
      type: 'cvc',
      id: 'cvc',
      required: true,
      "class": 'payform-field',
      placeholder: '000'
    }];
  }

  _createClass(EventBillingPaymentForm, [{
    key: "form",
    get: function get() {
      if (!this.offline) {
        return this.buildForm();
      }

      return this.buildOffline();
    }
  }, {
    key: "buildForm",
    value: function buildForm() {
      var formFrame = $('<div />');
      this.$form = new FormMaker('PayPalForm', '', this.paymentForm, null, null, null, false, false, true, true, true, false, true).form;
      formFrame.addClass('amnp-card-form').append(this.$form);
      return formFrame;
    }
  }, {
    key: "buildOffline",
    value: function buildOffline() {
      var formFrame = $('<div />');
      this.$form = new FormMaker('OfflinePayForm', '', this.offlineForm, null, null, null, false, false, true, true, true, false, true).form;
      formFrame.addClass('amnp-card-form').append(this.$form);
      return formFrame;
    }
  }]);

  return EventBillingPaymentForm;
}();

var EventBillingSubscriptions = function () {
  function EventBillingSubscriptions() {
    var _this4 = this;

    var dateId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var recurringId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var eventInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var eventList = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, EventBillingSubscriptions);

    this.$form = '';
    this.formEvents = [];
    this.patronName = '';
    this.patronEmail = '';
    this.slotsNeeded = 1;
    this.dateId = dateId;
    this.recurringId = recurringId;
    this.utils = new CoUtils();
    this.eventInfo = eventInfo;
    this.eventList = eventList;

    if (Object.keys(this.eventInfo).length === 0) {
      return false;
    }

    var eventDescription = '<p>' + ' <strong>' + this.eventInfo.title + '</strong>' + ' <br>' + this.eventInfo.datestring + ' <br><i class="fa fa-map-marker"></i>&nbsp;' + this.eventInfo.location + ' <br><br>We\'re sorry this event is currently full, but we can notify you by email if any spaces become available.' + '</p>';
    var interestedForm = $('<div class="amnp-interested-form"></div>').css('text-align', 'center').html(eventDescription);
    this.interestedForm = [{
      label: '',
      html: interestedForm,
      type: 'content-block',
      id: 'interestedHeader',
      "class": ''
    }, {
      label: 'Email',
      type: 'email',
      id: 'patronEmail',
      required: true,
      "class": 'billing-sub-field'
    }];
    var data = {
      patronEmail: '',
      eventId: this.dateId,
      recurringId: this.recurringId
    };
    this.formEvents = [{
      type: 'click',
      func: function func(e) {
        $('.Event_Full-dialog').on('hidden.bs.modal', function (eh) {
          $(eh.target).remove();
        }).modal('hide');
      },
      selector: '.close-brochure-popup'
    }];
    this.formEvents.push({
      type: 'click',
      func: function func(e) {
        var spinner = $('<i class="fa fa-spinner fa-spin email-spinner"></i>');
        $(e.target).append(" ").append(spinner).prop('disabled', true);
        var email = $('#patronEmail', _this4.$form).val();

        if (email === '') {
          alert('An email is required');
          return;
        } else {
          data.patronEmail = email;
          data.action = 'subscribe';
        }

        $.post("/interested", data, function (d) {
          $(".email-spinner").remove();
          $(e.target).prop('disabled', false);
          interestedForm.modal('hide');

          if (d === 'subscribed') {
            alert("You have successfully subscribed to this event.");
          }

          if (d === 'failed') {
            alert("Something went wrong when attempting to save your subscription. Please try again.");
          }
        });
      },
      selector: '#sendEmail'
    });
  }

  _createClass(EventBillingSubscriptions, [{
    key: "subscriptionForm",
    get: function get() {
      return this.buildForm();
    }
  }, {
    key: "buildForm",
    value: function buildForm() {
      this.$form = new FormMaker('Event Full', 'Sign up to be notified', this.interestedForm, null, this.formEvents, "interested-form", true, false, false, false, false, true, false).form;
      return this.$form;
    }
  }]);

  return EventBillingSubscriptions;
}();

var EventBillingTicketList = function () {
  function EventBillingTicketList() {
    var tickets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var recurringMod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var wholeOnly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var showCost = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var currencySymbol = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'USD';

    _classCallCheck(this, EventBillingTicketList);

    this.ticketTypes = [];
    this.tickets = tickets;
    this.ticketTotal = 0.00;
    this.ticketMod = recurringMod;
    this.wholeOnly = wholeOnly;
    this.showCost = showCost;
    this.currencySymbol = currencySymbol;
  }

  _createClass(EventBillingTicketList, [{
    key: "list",
    get: function get() {
      if (this.tickets.length === 0) return '';
      return this.buildList();
    }
  }, {
    key: "buildList",
    value: function buildList() {
      var $frame = $('<div class="amnp-ticket-details"/>');
      var $bookingSummary = $('<div class="amnp-booking-summary col-md-12"></div>');
      this.sumTickets();

      for (var k in this.ticketTypes) {
        var type = this.ticketTypes[k];
        var $bookingSummaryCost = $('<div class="amnp-booking-summary-total amnp-booking-summary-noborder"></div>').appendTo($bookingSummary);
        $('<div class="amnp-booking-summary-booking-ticket amnp-booking-summary-border"></div>').text(type.name).appendTo($bookingSummaryCost);
        $('<div class="amnp-booking-summary-booking-qty amnp-booking-summary-border"></div>').text('qty: ' + type.qty).appendTo($bookingSummaryCost);

        if (this.showCost) {
          $('<div class="amnp-booking-summary-booking-cost amnp-booking-summary-border">' + this.currencySymbol + '' + parseFloat(type.cost).toFixed(2) + '</div>').appendTo($bookingSummaryCost);
          this.ticketTotal += parseFloat(type.cost);
        } else {
          $('<div class="amnp-booking-summary-booking-cost amnp-booking-summary-border">&nbsp;</div>').appendTo($bookingSummaryCost);
        }
      }

      ;

      if (this.showCost) {
        var $bookingSummaryTotal = $('<div class="amnp-booking-summary-total amnp-booking-summary-noborder"></div>').appendTo($bookingSummary);
        $('<div class="amnp-booking-summary-booking-subtotal amnp-booking-summary-border">sub total</div>').appendTo($bookingSummaryTotal);
        $('<div class="amnp-booking-summary-booking-total-cost amnp-booking-summary-border">' + this.currencySymbol + '' + parseFloat(this.ticketTotal).toFixed(2) + '</div>').appendTo($bookingSummaryTotal);
      }

      if (this.ticketMod > 1 && !this.wholeOnly) {
        var $bookingSummaryAddOn = $('<div class="amnp-booking-summary-total amnp-booking-summary-noborder"></div>').appendTo($bookingSummary);
        $('<div class="amnp-booking-summary-booking-subtotal amnp-booking-summary-border">x' + this.ticketMod + ' dates</div>').appendTo($bookingSummaryAddOn);
        $('<div class="amnp-booking-summary-booking-total-cost amnp-booking-summary-border">' + this.currencySymbol + '' + (parseFloat(this.ticketTotal).toFixed(2) * this.ticketMod).toFixed(2) + '</div>').appendTo($bookingSummaryAddOn);
      }

      $bookingSummary.appendTo($frame);
      return $frame;
    }
  }, {
    key: "sumTickets",
    value: function sumTickets() {
      var _this5 = this;

      this.tickets.forEach(function (ticket) {
        if (typeof _this5.ticketTypes[ticket.type] === 'undefined') {
          _this5.ticketTypes[ticket.type] = {
            qty: 0,
            name: ticket.name,
            cost: 0,
            isGuest: ticket.id.indexOf('g-') >= 0
          };
        }

        _this5.ticketTypes[ticket.type].qty++;
        _this5.ticketTypes[ticket.type].cost += parseFloat(ticket.cost);
      });
    }
  }]);

  return EventBillingTicketList;
}();