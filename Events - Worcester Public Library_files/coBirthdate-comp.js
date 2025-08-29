"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () { })); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _CustomElement() {
  return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}

;
Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement, HTMLElement);

/*eslint-disable*/
var currentDocumentCoBirthdate = document.currentScript.ownerDocument;
/*
    Name: Communico Elements - v1 - Birth date input
    Description: This is a single row that can display multiple inputs in a single row and return all values from said inputs

    Component Creation:
    <co-birthdate
        years="###"
        max-birthdate="###" // Number of years old max, for use (9-18) would mark as red if over 18
        min-birthdate="###" // Number of years old min, for use (9-18) would mark as red if under 18,
        show-month="1/0" // 1 is on (default)
        show-day="1/0" // 1 is on (default)
        id="birthdate"
    ></co-birthdate>

    Fetch individual values:


    Fetch values of all inputs:


    TODO:

*/

var CoBirthdate = /*#__PURE__*/function (_CustomElement2) {
  _inherits(CoBirthdate, _CustomElement2);

  var _super = _createSuper(CoBirthdate);

  function CoBirthdate() {
    _classCallCheck(this, CoBirthdate);

    return _super.call(this);
  }

  _createClass(CoBirthdate, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      var template = currentDocumentCoBirthdate.querySelector('#co-birthdate-template');
      var instance = template.content.cloneNode(true);
      this.id = '';
      this.debug = false;
      this.showDay = 1;
      this.showMonth = 1;
      this.years = 0;
      this.birthdate = '';

      if (!this.shadowRoot) {
        this.attachShadow({
          mode: 'open'
        });
        this.shadowRoot.appendChild(instance);
      }

      var rq = parseInt(this.getAttribute('birthdate-required'));
      var sd = parseInt(this.getAttribute('show-day'));
      var md = parseInt(this.getAttribute('show-month'));
      var up = parseInt(this.getAttribute('use-pretty-months'));
      this.showDay = !isNaN(sd) ? sd : 1;
      this.showMonth = !isNaN(md) ? md : 1;
      this.showPrettyMonth = !isNaN(up) ? up : 1;
      this.birthdateRequired = !isNaN(rq) ? rq : 0;
      this.debug = parseInt(this.getAttribute('debug'));
      this.years = parseInt(this.getAttribute('years'));
      this.maxYear = this.getAttribute('max-age') !== null ? this.getAttribute('max-age') : 0;
      this.minYear = this.getAttribute('min-age') !== null ? this.getAttribute('min-age') : 0;
      this.render();
    }
  }, {
    key: "disconnectedCallback",
    value: function disconnectedCallback() {
      console.log('Deleted: ', this.id);
    }
  }, {
    key: "genID",
    value: function genID() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      var i;

      for (i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    }
  }, {
    key: "render",
    value: function render() {
      //const cb = this.shadowRoot.querySelector('.co-switch').querySelector('.co-switch-checkbox');
      if (typeof this.id === 'undefined' || this.id === '') this.id = this.genID();
      var container = this.shadowRoot.querySelector('.co-birthdate-container');
      var row = document.createElement('div');
      var div = document.createElement('div');
      var select = document.createElement('select');
      var label = document.createElement('label');
      var icon = document.createElement('i');
      var top = div.cloneNode();

      if (isNaN(this.years) || this.years === 0) {
        this.years = 100;
      }

      if (this.birthdateRequired) {
        var dob_label = this.shadowRoot.querySelector('.dob-label');
        var req_span = document.createElement('span');
        req_span.textContent = '*';
        req_span.style.color = '#ED0202';
        dob_label.append(req_span);
      } // Reset the container


      container.innerHTML = '';
      row.classList.add('row');
      var dCol = div.cloneNode();
      var mCol = div.cloneNode();
      var yCol = div.cloneNode();
      var dSel = null;
      var mSel = null;
      var ySel = select.cloneNode();
      dCol.classList.add('col-xs-4');
      mCol.classList.add('col-xs-4');
      yCol.classList.add('col-xs-4');
      ySel.classList.add('form-control');
      ySel.setAttribute('id', 'years_select');
      var minYear = moment().subtract(this.years, 'years').year();
      var maxYear = moment().year();

      if (this.maxYear > 0) {
        minYear = moment().subtract(this.maxYear, 'years').year();
      }

      if (this.minYear > 0) {
        maxYear = moment().subtract(this.minYear, 'years').year();
      }

      var defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Year...';
      ySel.append(defaultOpt);

      for (var y = maxYear; y >= minYear; y--) {
        var opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y.toString();
        ySel.append(opt);
      }

      ySel.addEventListener('change', this.updateDate);

      if (!isNaN(this.showDay) && this.showDay === 1) {
        dSel = select.cloneNode();
        dSel.setAttribute('id', 'days_select');
        dSel.classList.add('form-control');

        for (var d = 1; d <= 31; d++) {
          var opt = document.createElement('option');
          opt.value = d;
          opt.textContent = d.toString();
          dSel.append(opt);
        }

        dSel.addEventListener('change', this.updateDate);
      }

      if (!isNaN(this.showMonth) && this.showMonth === 1) {
        mSel = select.cloneNode();
        mSel.setAttribute('id', 'months_select');
        mSel.classList.add('form-control');

        for (var m = 1; m <= 12; m++) {
          var opt = document.createElement('option');
          opt.value = m;

          if (this.showPrettyMonth == 1) {
            opt.textContent = moment().month(m - 1).format('MMMM');
          } else {
            opt.textContent = m.toString();
          }

          mSel.append(opt);
        }

        mSel.addEventListener('change', this.updateDate);
      }

      if (mSel !== null) {
        var mfg = div.cloneNode();
        var ml = label.cloneNode();
        ml.textContent = 'Month:';
        mfg.classList.add('form-group');
        mfg.append(ml);
        mfg.append(mSel);
        mCol.append(mfg);
        row.append(mCol);
      }

      if (dSel !== null) {
        var dfg = div.cloneNode();
        var dl = label.cloneNode();
        dl.textContent = 'Day:';
        dfg.classList.add('form-group');
        dfg.append(dl);
        dfg.append(dSel);
        dCol.append(dfg);
        row.append(dCol);
      }

      var yfg = div.cloneNode();
      var yl = label.cloneNode();
      yl.textContent = 'Year:';
      yfg.classList.add('form-group');
      yfg.append(yl);
      yfg.append(ySel);
      yCol.append(yfg);
      row.append(yCol);
      container.append(row);
    }
  }, {
    key: "reset",
    value: function reset() {
      var cb = document.querySelector('co-birthdate');
      var sr = cb.shadowRoot;
      var selects = sr.querySelectorAll('select');
      selects.forEach(function (select) {
        select.selectedIndex = 0;
      });
    }
  }, {
    key: "updateDate",
    value: function updateDate() {
      var ds = null;
      var ms = null;
      var cb = document.querySelector('co-birthdate');
      var sr = cb.shadowRoot;
      var ys = sr.querySelector('#years_select');
      var mom = moment();
      mom.hour(0);
      mom.minute(0);
      mom.second(1);

      if (parseInt(ys.value) > 0) {
        mom.year(parseInt(ys.value));
      } else {
        return;
      }

      if (!isNaN(cb.showMonth) && cb.showMonth === 1) {
        ms = sr.querySelector('#months_select');

        if (parseInt(ms.value) >= 0) {
          var month = parseInt(ms.value) - 1;
          mom.month(month);
        }
      }

      if (!isNaN(cb.showDay) && cb.showDay === 1) {
        ds = sr.querySelector('#days_select');

        if (parseInt(ds.value) > 0) {
          mom.date(parseInt(ds.value));
        }
      }

      if (ds !== null || ms !== null) {
        var days = mom.daysInMonth();

        if (days < 31 && ds !== null) {
          var badDays = sr.querySelectorAll('#days_select > option');

          if (badDays.length > 0) {
            for (var bd = 0; bd < badDays.length; bd++) {
              var d = badDays[bd];

              if (parseInt(d.value) > 0 && parseInt(d.value) > days) {
                d.parentNode.removeChild(d);
              }
            }
          }
        } // Since we may have removed, we have to make sure that we add back, when valid.


        if (days > 28 && ds !== null) {
          var daysOpts = sr.querySelectorAll('#days_select > option');

          if (daysOpts.length > 0) {
            // Check to see if 29-31 exist in the drop down
            for (var bd = 29; bd <= days; bd++) {
              var dayOpt = sr.querySelector('#days_select > option[value="' + bd.toString() + '"]'); // Doesn't exist, pop it back in.

              if (dayOpt === null) {
                var opt = document.createElement('option');
                opt.value = bd;
                opt.textContent = bd.toString();
                ds.append(opt);
              }
            }
          }
        }
      } // Just the year, so we don't care about days


      if (ds !== null && ms !== null) {
        cb.birthdate = mom.format('YYYY-MM-DD');
      }

      if (ds === null && ms !== null) {
        cb.birthdate = mom.format('YYYY-MM');
      }

      if (ds === null && ms === null) {
        cb.birthdate = mom.format('YYYY');
      }

      return;
    }
  }, {
    key: "formattedBirthdate",
    get: function get() {
      this.updateDate();
      return this.birthdate;
    }
  }, {
    key: "isValid",
    get: function get() {
      var cb = document.querySelector('co-birthdate');
      var sr = cb.shadowRoot;
      var years = sr.querySelector('#years_select');
      var months = sr.querySelector('#months_select');
      var days = sr.querySelector('#months_select');
      var ok = true;

      if (this.showDay) {
        if (isNaN(parseInt(days.value)) || days.value === null) {
          ok = false;
        }
      }

      if (this.showMonth) {
        if (isNaN(parseInt(months.value)) || months.value === null) {
          ok = false;
        }
      }

      if (isNaN(parseInt(years.value)) || years.value === null) {
        ok = false;
      }

      return ok;
    }
  }, {
    key: "requiredOK",
    get: function get() {
      var r = true;

      if (this.birthdateRequired === 1) {
        var cb = document.querySelector('co-birthdate');
        var sr = cb.shadowRoot;
        var years = sr.querySelector('#years_select');
        var year = years.options[years.selectedIndex].value;
        r = year !== '';
      }

      return r;
    }
  }]);

  return CoBirthdate;
}(_CustomElement);

var registerCoBirthdate = function registerCoBirthdate() {
  return customElements.define('co-birthdate', CoBirthdate);
};

registerCoBirthdate();