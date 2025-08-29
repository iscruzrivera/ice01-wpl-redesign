"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/*eslint-disable*/
var currentDocumentCoAddress = document.currentScript.ownerDocument;
/*
    Name: Communico Elements - v1 - Address input
    Description: This is a single row that can display multiple inputs in a single row and return all values from said inputs

    Component Creation:
    <co-address     
        require-google-autocomplete="0/1" // 0 is default
        use-google-autocomplete="1/0" // 1 is default
        use-google-map-preview="0/1" // 0 is default
        use-communico-verify="0/1" // 0 is default
        show-address3="0/1" // 0 is default
        country="US" // "US" is default                
        id="address-box"
    ></co-address>

    Fetch individual values:

    Fetch values of all inputs:

    TODO:
    
*/

var CoAddress = /*#__PURE__*/function (_HTMLElement) {
  _inherits(CoAddress, _HTMLElement);

  var _super = _createSuper(CoAddress);

  function CoAddress() {
    _classCallCheck(this, CoAddress);

    return _super.call(this);
  }

  _createClass(CoAddress, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      var template = currentDocumentCoAddress.querySelector('#co-address-template');
      var instance = template.content.cloneNode(true);
      this.id = '';
      this.debug = false;
      this.country = "US";
      this.showAddress3 = 0;
      this.showGroupName = 0;
      this.requireGoogleAutocomplete = 0;
      this.useGoogleAutocomplete = 1;
      this.useMapPreview = 0;
      this.useCommunicoVerify = 0;

      if (!this.shadowRoot) {
        this.attachShadow({
          mode: 'open'
        });
        this.shadowRoot.appendChild(instance);
      }

      var rq = parseInt(this.getAttribute('address-required'));
      var sa = parseInt(this.getAttribute('show-address3'));
      var sg = parseInt(this.getAttribute('show-group-name'));
      var rga = parseInt(this.getAttribute('require-google-autocomplete'));
      var uga = parseInt(this.getAttribute('use-google-autocomplete'));
      var ugm = parseInt(this.getAttribute('use-google-map-preview'));
      var ucv = parseInt(this.getAttribute('use-communico-verify'));
      this.country = this.getAttribute('country');
      this.debug = parseInt(this.getAttribute('debug'));
      this.defaultState = this.getAttribute('state');
      this.addressRequired = !isNaN(rq) ? rq : 0;
      this.showAddress3 = !isNaN(sa) ? sa : 0;
      this.showGroupName = !isNaN(sg) ? sg : 0;
      this.requireGoogleAutocomplete = !isNaN(rga) ? rga : 0;
      this.useGoogleAutocomplete = !isNaN(uga) ? uga : 1;
      this.useMapPreview = !isNaN(ugm) ? ugm : 0;
      this.useCommunicoVerify = !isNaN(ucv) ? ucv : 0;
      this.usedGoogleAutocomplete = false;
      this.googleAutocompleteMapObject = null;

      if (this.requireGoogleAutocomplete === 1) {
        this.useGoogleAutocomplete = 1;
      }

      if (this.useGoogleAutocomplete === 1) {//this.initGoogleAddressAutocomplete();
      }

      if (this.useMapPreview === 1) {//this.initGoogleMapPreview();
      }

      this.cityStateOptions = null;

      if (this.hasAttribute('lookup-city-state')) {
        this.cityStateOptions = JSON.parse(this.getAttribute('lookup-city-state'));
      }

      this.render();
    }
  }, {
    key: "address",
    get: function get() {
      var ca = document.querySelector('co-address');
      var sr = ca.shadowRoot;
      var city_state_element = sr.getElementById('city_state');
      var city = sr.getElementById('city').value;
      var state = sr.getElementById('state').value;
      var city_state = city_state_element.value;

      if (null !== this.cityStateOptions) {
        var city_state_selected = sr.getElementById('city_state').querySelectorAll('option[value="' + city_state + '"]');

        if (city_state_selected.length > 0) {
          var split_city_state = city_state_selected[0].innerText.split(", ");

          if (split_city_state.length > 0) {
            var _split_city_state$map = split_city_state.map(function (x) {
              return x.trim();
            });

            var _split_city_state$map2 = _slicedToArray(_split_city_state$map, 2);

            city = _split_city_state$map2[0];
            state = _split_city_state$map2[1];
          } else {
            var _split_city_state$spl = split_city_state.split(" ");

            var _split_city_state$spl2 = _slicedToArray(_split_city_state$spl, 2);

            city = _split_city_state$spl2[0];
            state = _split_city_state$spl2[1];
          }
        }
      }

      return {
        address1: sr.getElementById('address1').value,
        address2: sr.getElementById('address2').value,
        address3: this.showAddress3 === 1 ? sr.getElementById('address3').value : '',
        city: city,
        state: state,
        city_state: city_state,
        postcode: sr.getElementById('postcode').value
      };
    }
  }, {
    key: "requiredOK",
    get: function get() {
      var ca = document.querySelector('co-address');
      var failed = 0;

      if (ca.addressRequired === 1) {
        var sr = ca.shadowRoot;
        var inputs = sr.querySelectorAll('input, select');

        for (var i = 0; i < inputs.length; i++) {
          var inp = inputs[i];

          if (inp.hasAttribute('data-required')) {
            if (inp.value === '') {
              failed++;
            }
          }
        }
      } // We want to return true if it passes!


      return failed === 0;
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var addr1 = this.shadowRoot.querySelector('#address1');
      var addr1inst = this.shadowRoot.querySelector('.address1-instructions');
      addr1.addEventListener('blur', function (evt) {
        addr1inst.classList.add('hidden');
      });
      addr1.addEventListener('focus', function (evt) {
        addr1inst.classList.remove('hidden');
      });
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
      var _this = this;

      //const cb = this.shadowRoot.querySelector('.co-switch').querySelector('.co-switch-checkbox');
      if (typeof this.id === 'undefined' || this.id === '') this.id = this.genID();
      var container = this.shadowRoot.querySelector('.co-address-container');
      var div = document.querySelector('address3');
      var addr_required = this.shadowRoot.querySelector('span.address1.required');
      var addr3 = this.shadowRoot.querySelector('.address3');
      var gn = this.shadowRoot.querySelector('.group-name');
      var state = this.shadowRoot.querySelector('#state');

      if (null !== this.cityStateOptions) {
        this.cityStateBuilder();

        if (this.defaultState !== null && this.defaultState !== '') {
          var options = _toConsumableArray(this.shadowRoot.getElementById('city_state').querySelectorAll("option")).filter(function (el) {
            var text = el.innerText;

            var _text$split = text.split(","),
                _text$split2 = _slicedToArray(_text$split, 2),
                city = _text$split2[0],
                state = _text$split2[1];

            if (state) {
              return state.trim() == _this.defaultState;
            }

            return false;
          });

          if (options.length > 0) {
            options[0].selected = true;
          }
        }
      } else {
        this.stateBuilder();

        if (this.defaultState !== null && this.defaultState !== '') {
          var exists = this.shadowRoot.querySelector('#state > option[value="' + this.defaultState + '"]') !== null;

          if (exists) {
            state.value = this.defaultState;
          }
        }
      }

      if (this.addressRequired) {
        addr_required.classList.remove('hidden');
      }

      if (this.showAddress3 === 1) {
        addr3.classList.remove('hidden');
      }

      if (this.showGroupName === 1) {
        gn.classList.remove('hidden');
      }

      this.bindEvents();
    }
  }, {
    key: "reset",
    value: function reset() {
      var ca = document.querySelector('co-address');
      var sr = ca.shadowRoot;
      var inputs = sr.querySelectorAll('input');
      var selects = sr.querySelectorAll('select');
      inputs.forEach(function (input) {
        input.value = '';
      });
      selects.forEach(function (select) {
        select.value = '';
      });
    }
  }, {
    key: "cityStateBuilder",
    value: function cityStateBuilder() {
      var cityState = this.shadowRoot.querySelector('#city_state');
      var cityState_group = this.shadowRoot.querySelector('.container.city_state');
      cityState.setAttribute('data-required', 'required');
      cityState_group.classList.remove('hidden');
      this.cityStateOptions.forEach(function (cityST) {
        var o = document.createElement('option');
        o.value = cityST.key;
        o.textContent = cityST.value;
        cityState.appendChild(o);
      });
    }
  }, {
    key: "stateBuilder",
    value: function stateBuilder() {
      var state = this.shadowRoot.querySelector('#state');
      var city = this.shadowRoot.querySelector('#city');
      var state_label = this.shadowRoot.querySelector('label[for="state"]');
      var zip_label = this.shadowRoot.querySelector('label[for="postcode"]');
      var state_group = this.shadowRoot.querySelector('.container.state');
      var city_group = this.shadowRoot.querySelector('.container.city');
      state.setAttribute('data-required', 'required');
      state_group.classList.remove('hidden');
      city.setAttribute('data-required', 'required');
      city_group.classList.remove('hidden');
      var ca_states = [{
        'label': 'Alberta',
        'value': 'AB'
      }, {
        'label': 'British Columbia',
        'value': 'BC'
      }, {
        'label': 'Manitoba',
        'value': 'MB'
      }, {
        'label': 'New Brunswick',
        'value': 'NB'
      }, {
        'label': 'Newfoundland/Labrador',
        'value': 'NL'
      }, {
        'label': 'Nova Scotia',
        'value': 'NS'
      }, {
        'label': 'Ontario',
        'value': 'ON'
      }, {
        'label': 'Prince Edward Island',
        'value': 'PE'
      }, {
        'label': 'Quebec',
        'value': 'QC'
      }, {
        'label': 'Saskatchewan',
        'value': 'SK'
      }];
      var us_states = [{
        'label': 'Alabama',
        'value': 'AL'
      }, {
        'label': 'Alaska',
        'value': 'AK'
      }, {
        'label': 'Arizona',
        'value': 'AZ'
      }, {
        'label': 'Arkansas',
        'value': 'AR'
      }, {
        'label': 'California',
        'value': 'CA'
      }, {
        'label': 'Colorado',
        'value': 'CO'
      }, {
        'label': 'Connecticut',
        'value': 'CT'
      }, {
        'label': 'Delaware',
        'value': 'DE'
      }, {
        'label': 'District of Columbia',
        'value': 'DC'
      }, {
        'label': 'Florida',
        'value': 'FL'
      }, {
        'label': 'Georgia',
        'value': 'GA'
      }, {
        'label': 'Hawaii',
        'value': 'HI'
      }, {
        'label': 'Idaho',
        'value': 'ID'
      }, {
        'label': 'Illinois',
        'value': 'IL'
      }, {
        'label': 'Indiana',
        'value': 'IN'
      }, {
        'label': 'Iowa',
        'value': 'IA'
      }, {
        'label': 'Kansas',
        'value': 'KS'
      }, {
        'label': 'Kentucky',
        'value': 'KY'
      }, {
        'label': 'Louisiana',
        'value': 'LA'
      }, {
        'label': 'Maine',
        'value': 'ME'
      }, {
        'label': 'Maryland',
        'value': 'MD'
      }, {
        'label': 'Massachusetts',
        'value': 'MA'
      }, {
        'label': 'Michigan',
        'value': 'MI'
      }, {
        'label': 'Minnesota',
        'value': 'MN'
      }, {
        'label': 'Mississippi',
        'value': 'MS'
      }, {
        'label': 'Missouri',
        'value': 'MO'
      }, {
        'label': 'Montana',
        'value': 'MT'
      }, {
        'label': 'Nebraska',
        'value': 'NE'
      }, {
        'label': 'Nevada',
        'value': 'NV'
      }, {
        'label': 'New Hampshire',
        'value': 'NH'
      }, {
        'label': 'New Jersey',
        'value': 'NJ'
      }, {
        'label': 'New Mexico',
        'value': 'NM'
      }, {
        'label': 'New York',
        'value': 'NY'
      }, {
        'label': 'North Carolina',
        'value': 'NC'
      }, {
        'label': 'North Dakota',
        'value': 'ND'
      }, {
        'label': 'Ohio',
        'value': 'OH'
      }, {
        'label': 'Oklahoma',
        'value': 'OK'
      }, {
        'label': 'Oregon',
        'value': 'OR'
      }, {
        'label': 'Pennslyvania',
        'value': 'PA'
      }, {
        'label': 'Rhode Island',
        'value': 'RI'
      }, {
        'label': 'South Carolina',
        'value': 'SC'
      }, {
        'label': 'South Dakota',
        'value': 'SD'
      }, {
        'label': 'Tennessee',
        'value': 'TN'
      }, {
        'label': 'Texas',
        'value': 'TX'
      }, {
        'label': 'Utah',
        'value': 'UT'
      }, {
        'label': 'Vermont',
        'value': 'VT'
      }, {
        'label': 'Virginia',
        'value': 'VA'
      }, {
        'label': 'Washington',
        'value': 'WA'
      }, {
        'label': 'West Virginia',
        'value': 'WV'
      }, {
        'label': 'Wisconsin',
        'value': 'WI'
      }, {
        'label': 'Wyoming',
        'value': 'WY'
      }];

      switch (this.country) {
        case 'AU':
        case 'UK':
          state.innerHTML = '';
          state.style.display = 'none';
          state.removeAttribute('data-required');
          state_label.textContent = 'Province:';
          zip_label.textContent = 'Postal code:';
          break;

        case 'CA':
        case 'CAN':
        case 'CANADA':
          state.style.display = 'auto';
          ca_states.forEach(function (stateObj) {
            var o = document.createElement('option');
            o.value = stateObj.value;
            o.textContent = stateObj.label;
            state.appendChild(o);
          });

          if (!state.hasAttribute('data-required')) {
            state.setAttribute('data-required');
          }

          state_label.textContent = 'Province:';
          zip_label.textContent = 'Postal code:';
          break;

        case 'US':
        case 'USA':
          state.innerHTML = '';
          state.style.display = 'auto';
          us_states.forEach(function (stateObj) {
            var o = document.createElement('option');
            o.value = stateObj.value;
            o.textContent = stateObj.label;
            state.appendChild(o);
          });

          if (!state.hasAttribute('data-required')) {
            state.setAttribute('data-required');
          }

          break;
      }
    }
  }]);

  return CoAddress;
}( /*#__PURE__*/_wrapNativeSuper(HTMLElement));

var registerCoAddress = function registerCoAddress() {
  return customElements.define('co-address', CoAddress);
};

registerCoAddress();