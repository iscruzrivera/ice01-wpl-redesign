"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CoRooms = /*#__PURE__*/function () {
  function CoRooms() {
    _classCallCheck(this, CoRooms);

    this.rooms = [];
    this.locations = [];
    this.settings = [];
  }

  _createClass(CoRooms, [{
    key: "init",
    value: function init() {
      Promise.all([this._getJSON(this.settings.apiServer + '/v2/' + this.settings.client + '/rooms/' + locs, roomOptions), this._getJSON(this.settings.apiServer + '/v1/' + this.settings.client + '/opening-hours/' + this.CurrentDateString + '/1'), this._getJSON(this.settings.apiServer + '/v1/' + this.settings.client + '/locations', locationOptions)]).then(function (result) {
        self.rooms = result[0];
        self.openingHours = result[1];
        self.locations = result[2];
      });
    }
  }]);

  return CoRooms;
}();

var CoRoomList = /*#__PURE__*/function () {
  function CoRoomList() {
    var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'seasons';

    _classCallCheck(this, CoRoomList);

    this.client = client;
    this.clientSettings = {};
    this.element = null;
    this.filterData = {
      area: 0,
      areaSegment: 0,
      assets: [],
      locations: [],
      maxCapacity: 0,
      maxSegment: 20,
      special: [],
      types: [],
      userClasses: []
    };
    this.filterElements = {
      /*
      area: {
        head: '',
        ele: null,
        slider: null
      },
      assets: {
        head: '',
        ele: null
      },
      */
      search: {
        head: '',
        ele: null
      },
      locations: {
        head: '',
        ele: null
      },
      special: {
        head: '',
        ele: null
      },
      types: {
        head: '',
        ele: null
      },
      capacity: {
        head: '',
        ele: null,
        slider: null
      }
    }; // Create a copy of the empty object, this will be for selected data

    this.filters = Object.assign({}, this.filterData);
    this.holder = null;
    this.left = null;
    this.mobileLeft = null;
    this.mobileSortButtons = null;
    this.responsiveKey = null;
    this.right = null;
    this.rooms = [];
    this.roomBoxes = [];
    this.sortType = 'name';
    this.sortButtons = null; // New datafunctions class that allows us to use simple getter / setters for repeat data functions

    this.dataFunctions = new CoDataFunctions(this.client);
  }

  _createClass(CoRoomList, [{
    key: "capitalizeTool",
    value: function capitalizeTool(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  }, {
    key: "buildFrame",
    value: function buildFrame() {
      var self = this;
      self.element = document.querySelector('.roomlist-page');
      self.holder = document.createElement('div'); // $('<div data-view="list" class="events-list-view"></div>').appendTo(self.element);

      self.holder.setAttribute('data-view', 'list'); //self.holder.classList.add('events-list-view', 'row');

      self.holder.setAttribute('class', 'row events-list-view');
      self.element.appendChild(self.holder);
      self.header = '';
      self.left = document.createElement('div'); //$('<div class="roomlist-left"></div>').appendTo(self.holder);

      self.left.setAttribute('class', 'roomlist-left col-md-3 hidden-sm hidden-xs');
      self.mobileLeft = document.createElement('div');
      self.mobileLeft.setAttribute('class', 'roomlist-mobile-left col-xs-12 col-sm-12 hidden-md hidden-lg'); //self.mobileLeft.classList.add('roomlist-mobile-left', 'col-xs-12', 'col-sm-12', 'hidden-md', 'hidden-lg');

      self.right = document.createElement('div'); //$('<div class="roomlist-right"></div>').appendTo(self.holder);
      //self.right.classList.add('roomlist-right', 'col-md-9', 'col-sm-12', 'col-xs-12');

      self.right.setAttribute('class', 'roomlist-right col-md-9 col-sm-12 col-xs-12');
      var roomBoxContainer = document.createElement('div'); //roomBoxContainer.classList.add('roomlist-roominfo-box-container', 'container-fluid');

      roomBoxContainer.setAttribute('class', 'roomlist-roominfo-box-container container-fluid'); // Create buttons for sort

      self.sortButtons = document.createElement('div');
      var sortText = document.createTextNode('SORT BY: ');
      var sortLocButton = document.createElement('button');
      var sortNameButton = document.createElement('button'); //self.sortButtons.classList.add('roomlist-sort-buttons', 'hidden-xs', 'hidden-sm');

      self.sortButtons.setAttribute('class', 'roomlist-sort-buttons hidden-xs hidden-sm'); //sortLocButton.classList.add('btn', 'roomlist-button', 'roomlist-sort-location', 'roomlist-button-sm');

      sortLocButton.setAttribute('class', 'roomlist-button roomlist-sort-location roomlist-button-sm'); //sortNameButton.classList.add('btn', 'roomlist-button', 'roomlist-button-sm', 'roomlist-sort-name', 'active');

      sortNameButton.setAttribute('class', 'roomlist-button roomlist-button-sm roomlist-sort-name');

      if (self.clientSettings.rooms_sort_roomlist_by_location) {
        sortLocButton.setAttribute('class', sortLocButton.className.concat(' active'));
      } else {
        sortNameButton.setAttribute('class', sortNameButton.className.concat(' active'));
      }

      sortLocButton.textContent = 'Location';
      sortNameButton.textContent = 'Room name';
      self.sortButtons.appendChild(sortText);
      self.sortButtons.appendChild(sortLocButton);
      self.sortButtons.appendChild(sortNameButton);
      self.right.appendChild(self.sortButtons);
      self.right.appendChild(roomBoxContainer);
      self.holder.appendChild(self.left);
      self.holder.appendChild(self.mobileLeft);
      self.holder.appendChild(self.right); // Have to use jquery here...
    }
  }, {
    key: "bindButtonEvents",
    value: function bindButtonEvents() {
      var self = this;
      var bookButtons = document.getElementsByClassName('roomlist-book-button');
      var detailsButtons = document.getElementsByClassName('roomlist-details-button');
      var imageBoxes = document.getElementsByClassName('roomlist-roominfo-image-box');
      var defaultDomain = self.clientSettings.client_default_domain;
      var roomId = 0;

      for (var bb = 0; bb < bookButtons.length; bb++) {
        $(bookButtons[bb]).off().on('click', function (event) {
          if ($(event.target)[0].hasAttribute('data-roomid')) {
            roomId = $(event.target).attr('data-roomid');
            window.open("https://".concat(defaultDomain, "/reserve?roomId=").concat(roomId));
          }
        });
      }

      for (var db = 0; db < detailsButtons.length; db++) {
        $(detailsButtons[db]).off().on('click', function (event) {
          if ($(event.target)[0].hasAttribute('data-roomid')) {
            roomId = $(event.target).attr('data-roomid');
            window.open("https://".concat(defaultDomain, "/roomdetail?roomId=").concat(roomId));
          }
        });
      }

      for (var ib = 0; ib < imageBoxes.length; ib++) {
        $(imageBoxes[ib]).off().on('click', function (event) {
          if ($(event.currentTarget)[0].hasAttribute('data-roomid')) {
            roomId = $(event.currentTarget).attr('data-roomid');
            window.open("https://".concat(defaultDomain, "/roomdetail?roomId=").concat(roomId));
          }
        });
      }
    }
  }, {
    key: "bindFilterEvents",
    value: function bindFilterEvents() {
      var self = this;
      var capacityNode = [document.getElementsByClassName('roomlist-capacity-display-min')[0], document.getElementsByClassName('roomlist-capacity-display-max')[0]];
      var locationCheckAll = document.getElementsByClassName('roomlist-checkbox-location-checkall')[0];
      var locationList = document.getElementsByClassName('roomlist-location-check');
      var typeCheckAll = document.getElementsByClassName('roomlist-checkbox-type-checkall')[0];
      var typeList = document.getElementsByClassName('roomlist-type-check');
      var sortName = document.getElementsByClassName('roomlist-sort-name')[0];
      var sortLocation = document.getElementsByClassName('roomlist-sort-location')[0];
      var searchInput = document.getElementById('roomlist-search');
      self.filterElements.capacity.slider.noUiSlider.on('update', function (values, handle, unencoded, isTap, positions) {
        var v = Math.ceil(values[handle]);
        capacityNode[handle].textContent = "".concat(v);
        self.filters.maxCapacity = values[1];
        self.filters.minCapacity = values[0];
        self.filterRooms();
      });
      $(sortName).on('click', function (event) {
        $(event.target).addClass('active');
        $(sortLocation).removeClass('active');
        self.roomBoxes.sort(function (a, b) {
          return a.room.title.toUpperCase() === b.room.title.toUpperCase() ? 0 : a.room.title.toUpperCase() < b.room.title.toUpperCase() ? -1 : 1;
        });
        self.drawRooms(true);
      });
      $(sortLocation).on('click', function (event) {
        $(event.target).addClass('active');
        $(sortName).removeClass('active');
        self.roomBoxes.sort(function (a, b) {
          return a.room.location.toUpperCase() === b.room.location.toUpperCase() ? 0 : a.room.location.toUpperCase() < b.room.location.toUpperCase() ? -1 : 1;
        });
        self.drawRooms(true);
      });
      $(locationCheckAll).on('click', function (event) {
        if (event.target.checked) {
          for (var ll = 0; ll < locationList.length; ll++) {
            locationList[ll].checked = false;
          }

          self.filters.locations = [];
          self.filterRooms();
        }
      });
      $(typeCheckAll).on('click', function (event) {
        if (event.target.checked) {
          for (var tl = 0; tl < typeList.length; tl++) {
            typeList[tl].checked = false;
          }

          self.filters.types = [];
          self.filterRooms();
        }
      });
      $(searchInput).on('keyup', function (event) {
        var me = $(event.target);
        var term = $.trim(me.val()).toUpperCase();

        for (var rb = 0; rb < self.roomBoxes.length; rb++) {
          var room = self.roomBoxes[rb].room;
          if (room.title === null) room.title = '';
          if (room.location === null) room.location = '';
          if (room.room_type === null) room.room_type = '';
          self.roomBoxes[rb].hide = room.title.toUpperCase().indexOf(term) === -1 && room.location.toUpperCase().indexOf(term) === -1 && room.room_type.toUpperCase().indexOf(term) === -1;
        }
      });

      for (var ll = 0; ll < locationList.length; ll++) {
        $(locationList[ll]).on('click', function (event) {
          if (event.target.checked) {
            self.filters.locations.push(event.target.value);
          } else {
            var li = self.filters.locations.findIndex(function (v) {
              return v === event.target.value;
            });
            if (li > -1) self.filters.locations.splice(li, 1);
          }

          self.filterRooms();
          locationCheckAll.checked = self.filters.locations.length === 0;
        });
      }

      for (var tl = 0; tl < typeList.length; tl++) {
        $(typeList[tl]).on('click', function (event) {
          if (event.target.checked) {
            self.filters.types.push(event.target.value);
          } else {
            var ti = self.filters.types.findIndex(function (v) {
              return v === event.target.value;
            });
            if (ti > -1) self.filters.types.splice(ti, 1);
          }

          self.filterRooms();
          typeCheckAll.checked = self.filters.types.length === 0;
        });
      }

      if (self.clientSettings.rooms_sort_roomlist_by_location) {
        $(sortLocation).trigger('click');
      } else {
        $(sortName).trigger('click');
      }
    }
    /* Filters Code - Maybe eventually it's own class? */

  }, {
    key: "clearRoomFilterData",
    value: function clearRoomFilterData() {
      var self = this;
      self.filterData = {
        area: 0,
        areaSegment: 0,
        assets: [],
        locations: [],
        maxCapacity: 0,
        maxSegment: 20,
        minCapacity: 0,
        special: [],
        types: [],
        userClasses: []
      };
    }
  }, {
    key: "createRoomFilterElements",
    value: function createRoomFilterElements() {
      var self = this; // Calculate area & capacity ranges
      // We'll have a slider of some kind, that goes from 0 to X.

      if (self.filterData.area > 0 || self.filterData.maxCapacity > 0) {
        var areaSlider = document.createElement('div');
        areaSlider.setAttribute('id', 'area-slider');
        var areaSlideMin = 0;
        var areaSlideMax = 0;
        var capBox = document.createElement('div');
        var capSlider = document.createElement('div');
        var capDisplay = document.createElement('div');
        var capDisplayMin = document.createElement('span');
        var capDisplayMax = document.createElement('span');
        var capDisplayText = document.createTextNode(' to ');
        capDisplayMin.classList.add('roomlist-capacity-display-min');
        capDisplayMax.classList.add('roomlist-capacity-display-max');
        capDisplay.classList.add('roomlist-capacity-display');
        capDisplay.appendChild(capDisplayMin);
        capDisplay.appendChild(capDisplayText);
        capDisplay.appendChild(capDisplayMax);
        capSlider.setAttribute('id', 'capacity-slider');
        capSlider.classList.add('roomlist-capacity-slider');
        var capSlideMin = 0;
        var capSlideMax = 0;

        if (self.filterData.maxCapacity > 0) {
          // Get the max rounded up to the nearest hundred
          capSlideMax = Math.ceil(self.filterData.maxCapacity / 100, 0) * 100;
          noUiSlider.create(capSlider, {
            range: {
              min: capSlideMin,
              max: capSlideMax
            },
            step: self.filterData.maxSegment,
            start: [capSlideMin, capSlideMax],
            connect: true,
            behavior: 'tap'
          }); // self.filterElements.capacity = capSlider;

          capBox.appendChild(capDisplay);
          capBox.appendChild(capSlider);
          self.filterElements.capacity.head = '<i class="fa fa-users roomlist-filters-head-icon"></i>&nbsp;Capacity';
          self.filterElements.capacity.ele = capBox;
          self.filterElements.capacity.slider = capSlider;
        }

        if (self.filterData.area > 0) {
          areaSlideMax = Math.ceil(self.filterData.area / 100, 0) * 100;
          noUiSlider.create(areaSlider, {
            range: {
              min: areaSlideMin,
              max: areaSlideMax
            },
            start: [areaSlideMin, areaSlideMax],
            connect: true,
            behavior: 'tap'
          }); // TODO: Uncomment and use if available
          // self.filterElements.area.head = '<i class="fa fa-square-o roomlist-filters-head-icon"></i>&nbsp;Area';
          // self.filterElements.area.ele = areaSlider;
          // self.filterElements.area.slider = areaSlider;
        }
      } // Setup the checkboxes for locations, assets, types, etc.


      if (self.filterData.locations.length > 0) {
        self.filterData.assets.sort(function (a, b) {
          return a.name.toUpperCase() === b.name.toUpperCase() ? 0 : a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1;
        });
        var locList = document.createElement('div');
        locList.setAttribute('id', 'rooms-location-selector');
        locList.classList.add('amnp-location-select');
        var locLabel = document.createElement('label');
        var locInput = document.createElement('input');
        var locPseudo = document.createElement('span');
        var locText = document.createTextNode('All locations');
        locInput.setAttribute('type', 'checkbox');
        var checkAll = locInput.cloneNode(true);
        locLabel.classList.add('roomlist-checkbox-label'); //locInput.classList.add('roomlist-location-check', 'roomlist-checkbox-hidden');

        locInput.setAttribute('class', 'roomlist-location-check roomlist-checkbox-hidden');
        locPseudo.classList.add('roomlist-checkbox');
        var checkPsu = locPseudo.cloneNode(true);
        var checkLbl = locLabel.cloneNode(true);
        var checkTxt = locText.cloneNode(true);
        checkAll.setAttribute('checked', true); //checkAll.classList.add('roomlist-checkbox-location-checkall', 'roomlist-checkbox-hidden');

        checkAll.setAttribute('class', 'roomlist-checkbox-location-checkall roomlist-checkbox-hidden');
        checkLbl.appendChild(checkAll);
        checkLbl.appendChild(checkPsu);
        checkLbl.appendChild(checkTxt);
        locList.appendChild(checkLbl); // Create the mobile version

        var mobileLocList = document.createElement('div');

        for (var l = 0; l < self.filterData.locations.length; l++) {
          var loc = self.filterData.locations[l];
          var ll = locLabel.cloneNode(true);
          var li = locInput.cloneNode(true);
          var lp = locPseudo.cloneNode(true);
          var lt = document.createTextNode(self.capitalizeTool(loc.name));
          li.value = loc.id;
          ll.appendChild(li);
          ll.appendChild(lp);
          ll.appendChild(lt);
          locList.appendChild(ll);
        }

        self.filterElements.locations.head = '<i class="fa fa-map-marker roomlist-filters-head-icon"></i>&nbsp;Location';
        self.filterElements.locations.ele = locList; //self.filterElements.locations.mobile = mobileLocList;
      }

      if (self.filterData.assets.length > 0) {
        // Sort filter assets for usability
        self.filterData.assets.sort(function (a, b) {
          return a.name.toUpperCase() === b.name.toUpperCase() ? 0 : a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1;
        });
        var assetList = document.createElement('div');
        assetList.setAttribute('id', 'rooms-asset-selector');
        assetList.classList.add('amnp-location-select');
        var assetLabel = document.createElement('label');
        var assetInput = document.createElement('input');
        var assetText = document.createTextNode('All assets');
        var assetPseudo = document.createElement('span');
        assetInput.setAttribute('type', 'checkbox');
        var checkAll = assetInput.cloneNode(true);
        assetLabel.classList.add('roomlist-checkbox-label'); //assetInput.classList.add('roomlist-asset-check', 'roomlist-checkbox-hidden');

        assetInput.setAttribute('class', 'roomlist-asset-check roomlist-checkbox-hidden');
        assetPseudo.classList.add('roomlist-checkbox');
        var checkPsu = assetPseudo.cloneNode(true);
        var checkLbl = assetLabel.cloneNode(true);
        var checkTxt = assetText.cloneNode(true);
        checkAll.setAttribute('checked', true); //checkAll.classList.add('roomlist-checkbox-asset-checkall roomlist-checkbox-hidden');

        checkAll.setAttribute('class', 'roomlist-checkbox-asset-checkall roomlist-checkbox-hidden');
        checkLbl.appendChild(checkAll);
        checkLbl.appendChild(checkPsu);
        checkLbl.appendChild(checkTxt);
        assetList.appendChild(checkLbl);

        for (var a = 0; a < self.filterData.assets.length; a++) {
          var asset = self.filterData.assets[a];
          var al = assetLabel.cloneNode(true);
          var ai = assetInput.cloneNode(true);
          var ap = assetPseudo.cloneNode(true);
          var at = document.createTextNode(self.capitalizeTool(asset.name));
          ai.value = asset.id;
          al.appendChild(ai);
          al.appendChild(ap);
          al.appendChild(at);
          assetList.appendChild(al);
        } // TODO: Uncomment and use if available
        //self.filterElements.assets.head = 'Assets';
        //self.filterElements.assets.ele = assetList;

      } // If we have types, sort and loop


      if (self.filterData.types.length > 0) {
        self.filterData.types.sort(function (a, b) {
          return a.toUpperCase() === b.toUpperCase() ? 0 : a.toUpperCase() < b.toUpperCase() ? -1 : 1;
        });
        var typeList = document.createElement('div');
        typeList.setAttribute('id', 'rooms-type-selector');
        typeList.classList.add('amnp-location-select');
        var typeInput = document.createElement('input');
        var typeLabel = document.createElement('label');
        var typeText = document.createTextNode('All types');
        var typePseudo = document.createElement('span');
        typeInput.setAttribute('type', 'checkbox');
        var checkAll = typeInput.cloneNode(true);
        typeLabel.classList.add('roomlist-checkbox-label'); //typeInput.classList.add('roomlist-type-check', 'roomlist-checkbox-hidden');

        typeInput.setAttribute('class', 'roomlist-type-check roomlist-checkbox-hidden');
        typePseudo.classList.add('roomlist-checkbox');
        var checkPsu = typePseudo.cloneNode(true);
        var checkLbl = typeLabel.cloneNode(true);
        var checkTxt = typeText.cloneNode(true);
        checkAll.setAttribute('checked', true); //checkAll.classList.add('roomlist-checkbox-type-checkall', 'roomlist-checkbox-hidden');

        checkAll.setAttribute('class', 'roomlist-checkbox-type-checkall roomlist-checkbox-hidden');
        checkLbl.appendChild(checkAll);
        checkLbl.appendChild(checkPsu);
        checkLbl.appendChild(checkTxt);
        typeList.appendChild(checkLbl);

        for (var t = 0; t < self.filterData.types.length; t++) {
          var type = self.filterData.types[t]; //let typeType = type.type;

          var tl = typeLabel.cloneNode(true);
          var ti = typeInput.cloneNode(true);
          var tp = typePseudo.cloneNode(true);
          var tt = document.createTextNode(self.capitalizeTool(type));
          ti.value = type;
          tl.appendChild(ti);
          tl.appendChild(tp);
          tl.appendChild(tt);
          typeList.appendChild(tl);
        }

        self.filterElements.types.head = '<i class="fa fa-th roomlist-filters-head-icon"></i>&nbsp;Type';
        self.filterElements.types.ele = typeList;
      } // Create a generic search box


      var searchContainer = document.createElement('div');
      var searchInput = document.createElement('input');
      var searchInputGroup = document.createElement('div');
      var searchInputAddon = document.createElement('div');
      searchInput.setAttribute('type', 'text');
      searchInput.setAttribute('id', 'roomlist-search');
      searchInput.setAttribute('placeholder', 'Search'); //searchInput.classList.add('form-control', 'roomlist-search-input');

      searchInput.setAttribute('class', 'form-control roomlist-search-input'); //searchContainer.classList.add('form-group', 'roomlist-search-container');

      searchContainer.setAttribute('class', 'form-group roomlist-search-container');
      searchInputGroup.classList.add('input-group'); //searchInputAddon.classList.add('input-group-addon', 'roomlist-search-addon');

      searchInputAddon.setAttribute('class', 'input-group-addon roomlist-search-addon');
      searchInputAddon.innerHTML = "<i class='fa fa-search'></i>";
      searchInputGroup.appendChild(searchInputAddon);
      searchInputGroup.appendChild(searchInput);
      searchContainer.appendChild(searchInputGroup);
      self.filterElements.search.ele = searchContainer;
      return true;
    }
  }, {
    key: "drawFilters",
    value: function drawFilters() {
      var self = this; // rip through all the filter elements and append

      self.left.innerHTML = '';

      for (var filterKey in self.filterElements) {
        if (self.filterElements[filterKey] !== null) {
          var d = document.createElement('hr');
          d.classList.add('roomlist-filters-divider');

          if (self.filterElements[filterKey].head !== '') {
            var h = document.createElement('h4');
            h.classList.add('roomlist-filters-head');
            h.innerHTML = self.filterElements[filterKey].head;
            self.left.appendChild(h);
          }

          if (self.filterElements[filterKey].ele !== null) {
            self.left.appendChild(self.filterElements[filterKey].ele);
            self.left.appendChild(d);
          }
        }
      }
    }
  }, {
    key: "drawRooms",
    value: function drawRooms() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var self = this;
      var container = document.querySelector('.roomlist-roominfo-box-container');
      var row = document.createElement('div'); //let colCount = 1;
      //row.classList.add('row');

      if (redraw) {
        $(container).empty();
      }

      for (var r = 0; r < self.roomBoxes.length; r++) {
        var rb = self.roomBoxes[r]; // then convert back to a useable node for vanilla js

        container.appendChild(rb.element[0]);
      }

      self.bindButtonEvents();
    }
  }, {
    key: "filterRooms",
    value: function filterRooms() {
      var self = this;

      for (var rb = 0; rb < self.roomBoxes.length; rb++) {
        var roomBox = self.roomBoxes[rb];
        var hide = false;

        if (self.filters.locations.length > 0 && !hide) {
          hide = !(self.filters.locations.findIndex(function (v) {
            return v === roomBox.room.location_id;
          }) > -1);
        }

        if (self.filters.types.length > 0 && !hide) {
          hide = !(self.filters.types.findIndex(function (v) {
            return v === roomBox.room.room_type;
          }) > -1);
        }

        if (!hide && (self.filters.maxCapacity > 0 || self.filters.minCapacity > 0)) {
          var cap = parseInt(roomBox.room.capacity_standing);
          var showNoCap = self.filters.minCapacity === 0;
          if (isNaN(cap)) cap = 0;
          hide = cap > 0 && cap > self.filters.maxCapacity || cap < self.filters.minCapacity && self.filters.minCapacity > 0;
        }

        self.roomBoxes[rb].hide = hide;
      }
    }
  }, {
    key: "processRoomsForFilters",
    value: function processRoomsForFilters() {
      var self = this;

      if (self.rooms.length > 0) {
        self.roomBoxes = []; // Loops through all the rooms, we want a for so that we 'block' dom updates, etc.

        for (var r = 0; r < self.rooms.length; r++) {
          var cr = new CoRoomBox(self.client, self.clientSettings.client_default_domain);
          var room = self.rooms[r];

          if (typeof room.restrictions.viewable !== 'undefined' && +room.restrictions.viewable === 1) {
            var ra;
            var rt;

            (function () {
              // Check for room assets, if they exist then we need to build filters for them
              if (room.assets.length > 0) {
                var _loop = function _loop() {
                  var asset = room.assets[ra]; // If the asset id doesn't exist, create a new filterData record, otherwise just skip it

                  if (self.filterData.assets.findIndex(function (ele) {
                    return ele.id === asset.id;
                  }) === -1) {
                    // set the checked prop to false by default
                    asset.checked = false; // push asset and sort array by name

                    self.filterData.assets.push(asset);
                  }
                };

                for (ra = 0; ra < room.assets.length; ra++) {
                  _loop();
                }
              } // Setup unique types based on rooms we have


              rt = typeof room.room_type === 'string' ? room.room_type.trim() : '';

              if (self.filterData.types.findIndex(function (e) {
                return e === rt;
              }) === -1 && rt !== '') {
                self.filterData.types.push(rt);
              }

              ; // Setup capacity initial values for generation later

              var capacity = parseInt(room.capacity_standing);

              if (!isNaN(capacity)) {
                self.filterData.maxCapacity = Math.max(self.filterData.maxCapacity, capacity);
                if (self.filterData.maxCapacity > 499) self.filterData.maxCapacitySegment = 50;
                if (self.filterData.maxCapacity > 999) self.filterData.maxCapacitySegment = 100;
              } // Setup area initial values for generation later


              var area = !isNaN(parseInt(room.area)) ? parseInt(room.area) : 0;
              var length = !isNaN(parseInt(room.length)) ? parseInt(room.length) : 0;
              var width = !isNaN(parseInt(room.width)) ? parseInt(room.width) : 0; // If the area is 0 or NaN then try with l*w, then get the nearest ceiling integer for that function.

              if (!isNaN(area) && area === 0) area = length > 0 && width > 0 ? Math.ceil(length * width) : 0;

              if (area > 0) {
                self.filterData.area = Math.max(self.filterData.area, area);
                if (self.filterData.area > 499) self.filterData.areaSegment = 50;
                if (self.filterData.area > 999) self.filterData.areaSegment = 100;
                if (self.filterData.area > 9999) self.filterData.areaSegment = 1000;
              } // Gotta get a real branch name for these rooms, might as well do it now


              var curLoc = parseInt(room.location_id) > 0 ? parseInt(room.location_id) : -1;

              if (curLoc > 0) {
                var loc = self.filterData.locations.find(function (e) {
                  return parseInt(e.id) === curLoc;
                });

                if (typeof loc !== 'undefined') {
                  room['location'] = loc.name;
                }
              } // Append the room data to the room boxes array after building entry
              // room boxes will allow us to arbitrarily filter items without requesting new data all of the time.


              self.roomBoxes.push(cr.build(room));
            })();
          }
        } // end the rooms loop
        // Create the rest of the elements


        return true;
      } // endif


      return false;
    }
  }, {
    key: "setupFilters",
    value: function setupFilters() {
      var self = this;

      if (self.rooms.length > 0) {
        // Create the rest of the elements
        if (self.processRoomsForFilters()) {
          if (self.createRoomFilterElements()) {
            self.drawFilters();
          }
        }
      } // endif

    }
  }, {
    key: "setupMobileFilters",
    value: function setupMobileFilters() {
      var self = this;
      /*
      self.responsiveLocationSelect = document.createElement('select');
      self.responsiveTypeSelect = document.createElement('select');
      self.responsiveCapacity = document.createElement('div');
       self.responsiveLocationSelect.classList.add('multiselect', 'location-multiselect');
      self.responsiveLocationSelect.setAttribute('multiple', 'multiple');
      self.responsiveTypeSelect.classList.add('multiselect', 'type-multiselect');
      self.responsiveTypeSelect.setAttribute('multiple', 'multiple');   */

      var mobileContainer = $('<div />').addClass('container-fluid').css('margin-top', '16px');
      var mobileRow = $('<div />').addClass('row').css('margin', 0);
      var mobileCol = $('<div />').addClass('col-md-12 roomlist-col-mobile');
      var mobileFilterLocHead = $('<h5 />').text('Filter locations:');
      var mobileFilterTypeHead = $('<h5 />').text('Filter types:').css('margin-top', '5px');
      var mobileSortHead = $('<h5 />').text('Sort:');
      self.responsiveLocationSelect = $('<select />');
      self.responsiveTypeSelect = $('<select />');
      self.responsiveCapacity = $('<div />');
      self.responsiveLocationSelect.addClass('multiselect location-multiselect').prop('multiple', true);
      self.responsiveTypeSelect.addClass('multiselect type-multiselect').prop('multiple', true);

      for (var l = 0; l < self.filterData.locations.length; l++) {
        var loc = self.filterData.locations[l];
        var lo = $('<option />');
        lo.text(self.capitalizeTool(loc.name)).val(loc.id).attr('data-location', loc.id);
        self.responsiveLocationSelect.append(lo);
      }

      for (var t = 0; t < self.filterData.types.length; t++) {
        var type = self.filterData.types[t];
        var to = $('<option />');
        to.text(self.capitalizeTool(type)).val(type).attr('data-type', type);
        self.responsiveTypeSelect.append(to);
      }

      var mobileFilters = mobileCol.clone().append(mobileFilterLocHead).append(self.responsiveLocationSelect).append(mobileFilterTypeHead).append(self.responsiveTypeSelect);
      var mobileSortButtonsCol = mobileCol.clone();
      var mobileSortButtons = mobileSortButtonsCol.append(mobileSortHead);
      mobileSortButtonsCol.append($('<button />').addClass('btn roomlist-button-mobile roomlist-sort-location-mobile roomlist-button-sm').text('Location')).append($('<button />').addClass('btn roomlist-button-mobile roomlist-sort-name-mobile roomlist-button-sm active').text('Room name'));
      $(self.mobileLeft).append(mobileContainer.append(mobileRow.append(mobileSortButtons).append(mobileFilters)));
      $('.roomlist-sort-location-mobile').off().on('click', function (event) {
        $(event.target).addClass('active');
        $('.roomlist-sort-name-mobile').removeClass('active');
        self.roomBoxes.sort(function (a, b) {
          return a.room.location.toUpperCase() === b.room.location.toUpperCase() ? 0 : a.room.location.toUpperCase() < b.room.location.toUpperCase() ? -1 : 1;
        });
        self.drawRooms(true);
      });
      $('.roomlist-sort-name-mobile').off().on('click', function () {
        $(event.target).addClass('active');
        $('.roomlist-sort-location-mobile').removeClass('active');
        self.roomBoxes.sort(function (a, b) {
          return a.room.title.toUpperCase() === b.room.title.toUpperCase() ? 0 : a.room.title.toUpperCase() < b.room.title.toUpperCase() ? -1 : 1;
        });
        self.drawRooms(true);
      });
      self.responsiveTypeSelect.multiselect({
        includeSelectAllOption: true,
        selectAllValue: 'all',
        buttonWidth: '100%',
        onSelectAll: function onSelectAll() {
          self.filters.types = self.filterData.types;
          self.filterRooms();
        },
        onDeselectAll: function onDeselectAll() {
          self.filters.types = [];
          self.filterRooms();
        },
        onChange: function onChange() {
          var types = self.responsiveTypeSelect.val();
          var all = types.indexOf('all') >= 0 && types.length === 1;

          if (!all) {
            self.filters.types = types;
          } else {
            self.filters.types = [];
          }

          self.filterRooms();
        }
      });
      self.responsiveLocationSelect.multiselect({
        includeSelectAllOption: true,
        selectAllValue: 'all',
        buttonWidth: '100%',
        onSelectAll: function onSelectAll() {
          self.filterData.locations.forEach(function (location) {
            self.filters.locations.push(location.id);
          });
          self.filterRooms();
        },
        onDeselectAll: function onDeselectAll() {
          self.filters.locations = [];
          self.filterRooms();
        },
        onChange: function onChange() {
          var locs = self.responsiveLocationSelect.val();
          var all = locs.indexOf('all') >= 0 && locs.length === 1;

          if (!all) {
            self.filters.locations = locs;
          } else {
            self.filters.locations = [];
          }

          self.filterRooms();
        }
      });
    }
    /* End Filters Code */

  }, {
    key: "getData",
    value: function () {
      var _getData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var self, locationIds;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                self = this;
                self.clearRoomFilterData();
                _context.prev = 2;

                if (!(Object.keys(self.clientSettings).length === 0)) {
                  _context.next = 7;
                  break;
                }

                _context.next = 6;
                return self.dataFunctions.clientSettings;

              case 6:
                self.clientSettings = _context.sent;

              case 7:
                // Setup parameters that we need.
                self.dataFunctions.options = {
                  externalRooms: 1,
                  patronRooms: 1
                };
                _context.next = 10;
                return self.dataFunctions.locations;

              case 10:
                self.filterData.locations = _context.sent;
                locationIds = [];

                if (self.filterData.locations.length > 0) {
                  self.filterData.locations.forEach(function (ele) {
                    locationIds.push(ele.id);
                  });
                } // Clear whatever options we have


                self.dataFunctions.options = {};
                _context.next = 16;
                return self.dataFunctions.userClasses;

              case 16:
                self.filterData.userClasses = _context.sent;
                // Get the rooms for all locations - we don't care about filtering yet
                self.dataFunctions.options = {
                  locationIds: locationIds
                };
                _context.next = 20;
                return self.dataFunctions.roomBylocations;

              case 20:
                self.rooms = _context.sent;
                return _context.abrupt("return", true);

              case 24:
                _context.prev = 24;
                _context.t0 = _context["catch"](2);
                alert("Failed to get all data. Please refresh the screen and try again.");

              case 27:
                return _context.abrupt("return", false);

              case 28:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 24]]);
      }));

      function getData() {
        return _getData.apply(this, arguments);
      }

      return getData;
    }()
  }, {
    key: "init",
    value: function init() {
      var self = this;
      self.getData().then(function (ok) {
        self.buildFrame();

        if (ok) {
          self.setupFilters();
          self.setupMobileFilters();
          self.drawRooms();
          self.bindFilterEvents();
          self.bindButtonEvents();
        }
      });
    }
  }, {
    key: "ready",
    get: function get() { },
    set: function set(flag) { }
  }]);

  return CoRoomList;
}();

var CoRoomBox = /*#__PURE__*/function () {
  function CoRoomBox() {
    var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var defaultDomain = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _classCallCheck(this, CoRoomBox);

    this.hidden = false;
    this.room = {
      capacity_standing: 0,
      image: '',
      location: '',
      name: '',
      room_type: ''
    };
    this.element = null;
    this.client = client;
    this.defaultDomain = defaultDomain;
    this.template = '';
  }

  _createClass(CoRoomBox, [{
    key: "capitalizeTool",
    value: function capitalizeTool(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  }, {
    key: "build",
    value: function build(room) {
      this.room = room;
      this.room.image = this.room.image === '' ? 'Meeting Room.jpg' : this.room.image;

      if (this.room.images && Array.isArray(this.room.images) && this.room.images.length > 0) {
        this.room.image = this.room.images[0];
      }

      var roomId = this.room.id;
      var roomType = this.room.room_type === '' || this.room.room_type === null ? 'General Use' : this.capitalizeTool(this.room.room_type);
      var roomLocation = this.room.location === '' || this.room.location === null ? 'Unknown Branch' : this.capitalizeTool(this.room.location); // DEBUG:: CHange URL

      var bookButton = '';

      if (typeof room.restrictions.bookable !== 'undefined' && room.restrictions.bookable) {
        bookButton = "<button class=\"btn btn-default roomlist-button roomlist-book-button col-md-6 col-sm-6 col-xs-6 col-lg-6\" data-roomid=\"".concat(roomId, "\">Book room</button>");
      } else {
        bookButton = "<button class=\"btn btn-default roomlist-button roomlist-book-button col-md-6 col-sm-6 col-xs-6 col-lg-6\">&nbsp;</button>";
      }

      var imageurl = "https://".concat(this.defaultDomain, "/images/roombooking/").concat(this.client, "/").concat(this.room.image);
      var imageFrame = document.createElement('div');
      var iconFrame = '';
      var iconHTML = '';
      var icon = document.createElement('i');
      var image = document.createElement('span');
      var capEle = null;
      var capacity = parseInt(this.room.capacity_standing);
      capacity = isNaN(capacity) ? '' : capacity === 0 ? '' : capacity.toString();

      if (capacity !== '') {
        iconFrame = document.createElement('div');
        capEle = document.createTextNode(capacity + ' '); //icon.classList.add('fa', 'fa-users', 'roomlist-roominfo-icon');

        icon.setAttribute('class', 'fa fa-users roomlist-roominfo-icon'); //iconFrame.classList.add('roomlist-roominfo-icon-box', 'col-md-4');

        iconFrame.setAttribute('class', 'roomlist-roominfo-icon-box col-md-4');
        iconFrame.appendChild(icon);
        iconFrame.appendChild(capEle);
        iconHTML = iconFrame.outerHTML;
      }

      image.setAttribute('role', 'img');
      image.setAttribute('aria-label', room.title);
      image.classList.add('roomlist-image');
      image.style.background = "no-repeat center/cover url('".concat(imageurl, "') ");
      imageFrame.classList.add('roomlist-clear-image');
      imageFrame.appendChild(image); // fa fa-map-marker removed from location

      this.template = "\n      <div class=\"col-xs-12 col-sm-12 col-md-4 roomlist-col\">\n        <div class=\"roomlist-room-frame\">\n          <div class=\"roomlist-roominfo-image-box row\" data-roomid=\"".concat(roomId, "\">\n          ").concat(imageFrame.outerHTML, "\n          </div>\n          <div class=\"roomlist-roominfo-head row\">\n            <div class=\"roomlist-roominfo-head-text col-md-8\">\n              <div class=\"roomlist-roominfo-name\">\n              ").concat(roomType, "\n              </div>\n\n            </div>\n            ").concat(iconHTML, "\n            <div class=\"col-md-12 roomlist-roominfo-location-container\">\n              <div class=\"roomlist-roominfo-location\">\n                ").concat(roomLocation, " Branch\n              </div>\n              <div class=\"roomlist-roominfo-room-name\">\n                ").concat(room.title, "\n              </div>\n            </div>\n          </div>\n\n          <div class=\"roomlist-roominfo-foot row\">\n            <button class=\"btn btn-default roomlist-button roomlist-details-button col-md-6  col-sm-6 col-xs-6 col-lg-6\" data-roomid=\"").concat(roomId, "\">Details</button>\n            ").concat(bookButton, "\n          </div>\n        </div>\n      </div>\n    ");
      this.element = $(this.template);
      return this;
    }
  }, {
    key: "hide",
    set: function set(hide) {
      this.hidden = hide;

      if (this.element !== null) {
        if (hide) this.element.hide();
        if (!hide) this.element.show();
      }
    }
  }]);

  return CoRoomBox;
}();

var CoRoomDetail = /*#__PURE__*/function () {
  function CoRoomDetail() {
    var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'seasons';
    var roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var room = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, CoRoomDetail);

    // this.branchInfo = branchInfo;
    this.client = client;
    this.dataFunctions = new CoDataFunctions(this.client);
    this.clientSettings = {};
    this.room = room;
    this.roomId = roomId;
    this.roomTemplateParams = {
      roomArea: '',
      roomCapacity: '',
      roomCost: '',
      roomDeposit: '',
      roomDescription: '',
      roomFixedAssets: '',
      roomFloatingAssets: '',
      roomImage: '',
      roomLayouts: '',
      roomLocation: '',
      roomTitle: '',
      roomType: ''
    };
  }

  _createClass(CoRoomDetail, [{
    key: "bindEvents",
    value: function bindEvents() { }
  }, {
    key: "buildRoomDetail",
    value: function buildRoomDetail() {
      var self = this;
      var page = document.getElementById('roomdetail-page');
      page.setAttribute('data-room-id', self.roomId);
      var dtemplate = page.outerHTML; // Consume the HTML and fill in template slots.

      for (var key in self.roomTemplateParams) {
        var rxp = new RegExp('{{' + key + '}}', 'gi');

        if (key !== 'roomDescription') {
          dtemplate = dtemplate.replace(rxp, self.roomTemplateParams[key]);
        }
      }

      page.outerHTML = dtemplate;
    }
  }, {
    key: "buildRoomImages",
    value: function buildRoomImages() {
      var self = this;
      var image = ''; //DEBUG UPDATE IMG

      var defaultDomain = self.clientSettings.client_default_domain;
      var path = "https://".concat(defaultDomain, "/images/roombooking/").concat(this.client, "/");
      var imageBox = document.getElementById('roomdetail_image_container');
      var imageBoxSm = document.getElementById('roomdetail_image_container_sm');
      var imageBoxPrint = document.getElementById('roomdetail_image_print_container');
      var imageSS = document.createElement('div');
      imageSS.classList.add('cycle-slideshow', 'hidden-print');
      imageSS.setAttribute('data-cycle-fx', 'scrollHorz');
      imageSS.setAttribute('data-cycle-log', false);
      imageSS.setAttribute('data-cycle-next', '.ambl-events-slideshow-right');
      imageSS.setAttribute('data-cycle-pause-on-hover', true);
      imageSS.setAttribute('data-cycle-prev', '.ambl-events-slideshow-left');
      imageSS.setAttribute('data-cycle-slides', '> div');
      imageSS.setAttribute('data-cycle-timeout', 15000);
      imageSS.setAttribute('data-cycle-pager', '.image-pager'); // data-cycle-fx="scrollHorz" data-cycle-log="false" data-cycle-next=".'+self.attr('id')+'.ambl-events-slideshow-right" data-cycle-pause-on-hover="true" data-cycle-prev=".'+self.attr('id')+'.ambl-events-slideshow-left" data-cycle-slides=">div" data-cycle-timeout="15000">

      imageBox.innerHTML = '';
      imageBox.setAttribute('class', 'carousel slide');
      imageBox.setAttribute('data-ride', 'carousel');

      if (typeof self.room.room_images !== 'undefined' && self.room.room_images.length > 0) {
        // Build and append nav;
        var next = document.createElement('div');
        var prev = document.createElement('div');
        var pager = document.createElement('div');
        var ePager = document.createElement('div');
        var nextIcon = document.createElement('span');
        var prevIcon = document.createElement('span'); //nextIcon.classList.add('fa-stack', 'fa-lg');

        nextIcon.setAttribute('class', 'fa-stack fa-lg'); //prevIcon.classList.add('fa-stack', 'fa-lg');

        prevIcon.setAttribute('class', 'fa-stack fa-lg');
        nextIcon.innerHTML = "<i class='fa fa-chevron-right fa-3x fa-stack-1x fa-inverse'></i>";
        prevIcon.innerHTML = "<i class='fa fa-chevron-left fa-3x fa-stack-1x fa-inverse'></i>";
        pager.setAttribute('class', 'image-pager');
        ePager.setAttribute('class', 'cycle-pager'); //next.classList.add('roomdetail-image-nav', 'roomdetail-image-nav-next', 'ambl-events-slideshow-right');

        next.setAttribute('class', 'roomdetail-image-nav roomdetail-image-nav-next ambl-events-slideshow-right hidden-print'); //prev.classList.add('roomdetail-image-nav', 'roomdetail-image-nav-prev', 'ambl-events-slideshow-left');

        prev.setAttribute('class', 'roomdetail-image-nav roomdetail-image-nav-prev ambl-events-slideshow-left hidden-print');
        next.appendChild(nextIcon);
        prev.appendChild(prevIcon); //imageSS.appendChild(next)
        //imageSS.appendChild(prev);

        imageSS.setAttribute('data-cycle-autostop', self.room.room_images.length); //imageSS.appendChild(ePager);

        var printMax = 4;

        for (var ri = 0; ri < self.room.room_images.length; ri++) {
          var i = self.room.room_images[ri];
          image = document.createElement('div');
          image.style.background = "no-repeat center center / cover url(\"".concat(path).concat(i, "\")");
          image.style.width = '100%';
          image.style.padding = '15px';
          image.style.height = '500px';

          if (printMax > 0) {
            var imagePrint = document.createElement('div');
            var imp = document.createElement('img');
            imagePrint.setAttribute('class', 'roomdetail-image-print visible-print-block col-md-3 col-sm-3 col-xs-3');
            imp.src = "".concat(path).concat(i);
            imp.height = '172';
            imp.width = '172';
            image.style.padding = '5px'; //imp.setAttribute('class', 'img-responsive');

            imagePrint.appendChild(imp);
            imageBoxPrint.appendChild(imagePrint);
            printMax--;
          }

          imageSS.appendChild(image); //
        } //imageSS.appendChild(pager);
        //imageSS.classList.add('');
        //imageSS.setAttribute('data-cycle-pause-on-hover', true);
        //imageSS.setAttribute('data-cycle-speed', 200);
        //$(imageBox).cycle();


        imageBox.appendChild(imageSS); //$(imageSS).cycle();

        imageBox.appendChild(pager);
        imageBox.appendChild(next);
        imageBox.appendChild(prev);
        imageBoxSm.appendChild(imageSS.cloneNode(true));
        imageBoxSm.appendChild(next.cloneNode(true));
        imageBoxSm.appendChild(prev.cloneNode(true));
      } else {
        var _i = path + self.room.image;

        image = document.createElement('div');
        image.style.background = "no-repeat center center / cover url(\"".concat(_i, "\")");
        image.style.width = '100%';
        image.style.padding = '15px';
        image.style.height = '500px';
        imageSS.appendChild(image);
      }
    }
  }, {
    key: "buildRoomImagesBS",
    value: function buildRoomImagesBS() {
      var self = this;
      var carousel = document.createElement('div');
      var indicators = document.createElement('ol');
      var indicatorItem = document.createElement('li');
      var slideWrapper = document.createElement('div');
      var carouselControlLeft = document.createElement('a');
      var carouselControlRight = document.createElement('a');
      var glyph = document.createElement('span');
      var glyphText = document.createElement('span'); // Get containers

      var carouselContainer = document.getElementById('roomdetail_image_container');
      var imageBoxSm = document.getElementById('roomdetail_image_container_sm');
      var imageBoxPrint = document.getElementById('roomdetail_image_print_container');
      var image = ''; //DEBUG UPDATE IMG

      var defaultDomain = self.clientSettings.client_default_domain;
      var path = "https://".concat(defaultDomain, "/images/roombooking/").concat(this.client, "/"); // Setup some vars

      var currentSlide = 0; // Setup classes/styles/etc

      carousel.setAttribute('id', 'roomdetail-carousel');
      carousel.setAttribute('class', 'carousel slide');
      carousel.setAttribute('data-wrap', 'false');
      carousel.setAttribute('data-pause', 'hover');
      carousel.setAttribute('data-interval', 5000);
      slideWrapper.setAttribute('class', 'carousel-inner');
      slideWrapper.setAttribute('role', 'listbox');
      indicators.setAttribute('class', 'carousel-indicators');

      if (typeof self.room.room_images !== 'undefined' && self.room.room_images.length > 0) {
        var printMax = 4;
        var first = true;

        for (var ri = 0; ri < self.room.room_images.length; ri++) {
          var i = self.room.room_images[ri];
          var currentSlideItem = document.createElement('div');
          var caption = document.createElement('div');

          var _image = document.createElement('img'); // Update the indicators


          var currentII = indicatorItem.cloneNode(true);
          currentII.setAttribute('data-slide-to', ri);
          currentII.setAttribute('data-target', '#roomdetail-carousel');

          if (first) {
            currentSlideItem.setAttribute('class', 'item active roomdetail-slide-item');
            currentII.setAttribute('class', 'active');
            first = false;
          } else {
            currentSlideItem.setAttribute('class', 'item roomdetail-slide-item');
          }

          _image.setAttribute('src', "".concat(path).concat(i));

          _image.setAttribute('class', 'img-responsive'); //caption.appendChild(document.createTextNode('&nbsp;'));


          currentSlideItem.appendChild(_image); //currentSlideItem.appendChild(caption);

          slideWrapper.appendChild(currentSlideItem);
          indicators.appendChild(currentII); // Setup printable images

          if (printMax > 0) {
            var imagePrint = document.createElement('div');
            var imp = document.createElement('img');
            imagePrint.setAttribute('class', 'roomdetail-image-print visible-print-block col-md-3 col-sm-3 col-xs-3');
            imp.src = "".concat(path).concat(i);
            imp.height = '172';
            imp.width = '172';
            _image.style.padding = '5px'; //imp.setAttribute('class', 'img-responsive');

            imagePrint.appendChild(imp);
            imageBoxPrint.appendChild(imagePrint);
            printMax--;
          }
        } // setup controls


        var left = glyph.cloneNode();
        var right = glyph.cloneNode();
        var leftText = glyphText.cloneNode();
        var rightText = glyphText.cloneNode();
        left.setAttribute('class', 'glyphicon glyphicon-chevron-left');
        left.setAttribute('aria-hidden', 'true');
        right.setAttribute('class', 'glyphicon glyphicon-chevron-right');
        right.setAttribute('aria-hidden', 'true');
        leftText.setAttribute('class', 'sr-only');
        leftText.innerHTML = 'Previous';
        rightText.setAttribute('class', 'sr-only');
        rightText.innerHTML = 'Next';
        carouselControlLeft.setAttribute('href', '#roomdetail-carousel');
        carouselControlLeft.setAttribute('class', 'left carousel-control');
        carouselControlLeft.setAttribute('role', 'button');
        carouselControlLeft.setAttribute('data-slide', 'prev');
        carouselControlLeft.appendChild(left);
        carouselControlLeft.appendChild(leftText);
        carouselControlRight.setAttribute('href', '#roomdetail-carousel');
        carouselControlRight.setAttribute('class', 'right carousel-control');
        carouselControlRight.setAttribute('role', 'button');
        carouselControlRight.setAttribute('data-slide', 'next');
        carouselControlRight.appendChild(right);
        carouselControlRight.appendChild(rightText);
        carousel.appendChild(indicators);
        carousel.appendChild(slideWrapper);
        carousel.appendChild(carouselControlLeft);
        carousel.appendChild(carouselControlRight);
        carouselContainer.appendChild(carousel);
        imageBoxSm.appendChild(carousel.cloneNode(true));
      } else {
        var _i2 = path + self.room.image;

        image = document.createElement('div');
        image.style.background = "no-repeat center center / cover url(\"".concat(_i2, "\")");
        image.style.width = '100%';
        image.style.padding = '15px';
        image.style.height = '500px';
        carousel.appendChild(image);
        carouselContainer.appendChild(carousel);
        imageBoxSm.appendChild(carousel.cloneNode(true));
      }
    }
  }, {
    key: "buildRoomInfo",
    value: function buildRoomInfo() {
      var self = this;
      var roomArea = 0;
      var roomCapacity = 0;
      var roomCharge = 0.00;
      var roomCost = 0.00;
      var roomCostHTML = '';
      var roomDeposit = 0.00;
      var roomChargePeriod = -1;
      var segmentSize = 0;
      var bookable = 0;

      if (Object.keys(self.room.restrictions).length > 0) {
        if (typeof self.room.restrictions.deposit !== 'undefined') {
          var deposit = parseFloat(self.room.restrictions.deposit);
          roomDeposit = isNaN(deposit) ? 0.00 : deposit;
        }

        if (typeof self.room.restrictions.charge_period !== 'undefined') {
          var period = parseInt(self.room.restrictions.charge_period);
          roomChargePeriod = isNaN(period) ? -1 : period;
        }

        if (typeof self.room.restrictions.charge_amount !== 'undefined') {
          var charge = parseFloat(self.room.restrictions.charge_amount);
          roomCharge = isNaN(charge) ? 0.00 : charge;
        }

        if (typeof self.room.restrictions.segment_size !== 'undefined') {
          var segment = parseInt(self.room.restrictions.segment_size);
          segmentSize = isNaN(segment) ? 0 : segment;
        }

        if (typeof self.room.restrictions.bookable !== 'undefined') {
          bookable = self.room.restrictions.bookable == 1;
        }

        if (roomChargePeriod >= 0 && roomCharge > 0.00) {
          switch (roomChargePeriod) {
            case 0:
              //per block charge
              if (segmentSize > 0) {
                // get cost per minute, simplest way
                // Segment is always a whole number, even if an hour (60)
                var cpm = parseFloat(roomCharge / segmentSize);

                if (!isNaN(cpm)) {
                  var hourCost = Math.floor(cpm * 60).toFixed(2);

                  if (!isNaN(hourCost)) {
                    roomCost = hourCost;
                  }
                }
              }

              roomCostHTML = '<input class="form-control roomdetail-cost" value="Cost per hour: &dollar;' + roomCost + '" type="text" disabled=""></input>';
              break;

            case 1:
              // per booking charge - no calc needed
              roomCost = roomCharge.toFixed(2);
              roomCostHTML = '<input class="form-control roomdetail-cost" value="Cost per booking: &dollar;' + roomCost + '" type="text" disabled=""></input>';
              break;
          }
        } else {
          roomCostHTML = '<input class="form-control roomdetail-cost" value="No costs to book." type="text" disabled=""></input>';
        }

        if (!isNaN(parseInt(self.room.area))) roomArea = parseInt(self.room.area);
        if (!isNaN(parseInt(self.room.capacity_standing))) roomCapacity = parseInt(self.room.capacity_standing);
        var desc = 'No description available.';
        if (typeof self.room.description === 'string' && self.room.description.length > 0) desc = self.room.description;
        self.roomTemplateParams.roomArea = roomArea > 0 ? roomArea.toString() + ' sq ft' : 'N/A';
        self.roomTemplateParams.roomCost = roomCostHTML;
        self.roomTemplateParams.roomCapacity = roomCapacity > 0 ? roomCapacity : 'N/A';
        self.roomTemplateParams.roomDescription = desc;
        self.roomTemplateParams.roomLocation = self.room.locationName;
        self.roomTemplateParams.roomTitle = self.room.title;
        self.roomTemplateParams.roomType = self.room.room_type.length > 0 ? self.room.room_type : 'General Use Room';
        self.roomTemplateParams.roomBookHidden = bookable ? '' : 'hidden';
      }
    }
  }, {
    key: "buildRoomLayouts",
    value: function buildRoomLayouts() {
      var self = this;
      var colCount = 1;
      var layoutGroups = [];
      var layoutGroup = document.createElement('div');
      var layoutGroupRow = document.createElement('div');
      var layoutTitleRow = layoutGroupRow.cloneNode(); //layoutGroupRow.classList.add('row', 'roomdetail-layout-group-row');

      layoutGroupRow.setAttribute('class', 'row roomdetail-layout-group-row'); //layoutTitleRow.classList.add('row', 'roomdetail-layout-title-row');

      layoutTitleRow.setAttribute('class', 'row roomdetail-layout-title-row');
      layoutGroup.setAttribute('id', 'roomdetail-layout-group');
      layoutGroup.classList.add('container-fluid');

      if (typeof self.room.layouts !== 'undefined' && Array.isArray(self.room.layouts)) {
        if (self.room.layouts.length > 0) {
          for (var l = 0; l < self.room.layouts.length; l++) {
            var layout = self.room.layouts[l];
            var lImage = layout.image; // Image setup

            if (lImage.length > 0) {
              lImage = "https://".concat(self.clientSettings.client_default_domain, "/images/roomlayouts/").concat(lImage); //lImage = `https://seasons.libnet.info/images/roomlayouts/${lImage}`;
            } else {
              // no image, show the 'open style' by default
              lImage = "https://".concat(self.clientSettings.client_default_domain, "/images/roomlayouts/open-style.png"); //lImage = `https://seasons.libnet.info/images/roomlayouts/open-style.png`;
            }

            var lFrame = document.createElement('div');
            lFrame.classList.add('col-md-4');
            var lFrameG = lFrame.cloneNode();
            var lFrameT = lFrame.cloneNode();
            var lTitle = document.createElement('h4');
            var lImg = document.createElement('img');
            var lCap = document.createElement('div');
            lImg.classList.add('img-responsive');
            lImg.setAttribute('src', lImage);
            lCap.textContent = "Capacity: ".concat(layout.capacity);
            lTitle.textContent = layout.name;
            lTitle.classList.add('roomdetail-layout-title'); // Append title to it's own column

            lFrameT.appendChild(lTitle); // append image and capacity to it's own column

            lFrameG.appendChild(lImg);
            lFrameG.appendChild(lCap); // Append both to their appropriate rows

            layoutTitleRow.appendChild(lFrameT);
            layoutGroupRow.appendChild(lFrameG);

            if (colCount === 3) {
              layoutGroup.appendChild(layoutTitleRow);
              layoutGroup.appendChild(layoutGroupRow);
              layoutGroupRow = document.createElement('div');
              layoutTitleRow = layoutGroupRow.cloneNode(); //layoutGroupRow.classList.add('row', 'roomdetail-layout-group-row');

              layoutGroupRow.setAttribute('class', 'row roomdetail-layout-group-row'); //layoutTitleRow.classList.add('row', 'roomdetail-layout-title-row');

              layoutTitleRow.setAttribute('class', 'row roomdetail-layout-title-row');
              colCount = 0;
            }

            colCount++;
          }

          if (colCount > 0) {
            layoutGroup.appendChild(layoutTitleRow);
            layoutGroup.appendChild(layoutGroupRow);
            layoutGroupRow = document.createElement('div');
            layoutTitleRow = layoutGroupRow.cloneNode(); //layoutGroupRow.classList.add('row', 'roomdetail-layout-group-row');

            layoutGroupRow.setAttribute('class', 'row roomdetail-layout-group-row'); //layoutTitleRow.classList.add('row', 'roomdetail-layout-title-row');

            layoutTitleRow.setAttribute('class', 'row roomdetail-layout-title-row');
            colCount = 0;
          }
        } else {
          layoutGroupRow = document.createElement('div'); //layoutGroupRow.classList.add('row', 'roomdetail-layout-group-row');

          layoutGroupRow.setAttribute('class', 'row roomdetail-layout-group-row');

          var _lFrame = document.createElement('div');

          _lFrame.classList.add('col-md-12');

          _lFrame.textContent = 'No Layouts Available';
          layoutGroupRow.appendChild(_lFrame);
          layoutGroup.appendChild(layoutGroupRow);
        }
      }

      self.roomTemplateParams.roomLayouts = layoutGroup.outerHTML;
    }
  }, {
    key: "buildRoomMap",
    value: function buildRoomMap() {
      //<iframe style="height:300px;width:100%;border:0;" frameborder="0" src="https://www.google.com/maps/embed/v1/place?q={{location.name}},{{location.line1}},{{location.line2}},{{location.stateprovincecounty}},{{location.ziporpostcode}}&key=AIzaSyBIswHRc1E1cJ0rOY7JpZIo-KPCh9OMgJY"></iframe>
      var self = this;

      if (self.room.locationName) {
        var ifr = document.createElement('iframe');
        ifr.style.height = '300px';
        ifr.style.width = '100%';
        ifr.style.border = '0';
        ifr.frameBorder = 0;
        ifr.src = "https://www.google.com/maps/embed/v1/place?q=".concat(self.room.locationName, ",").concat(self.room.locationLine1, ",").concat(self.room.locationLine2, ",").concat(self.room.stateprovincecounty, ",").concat(self.room.ziporpostcode, "&key=AIzaSyBIswHRc1E1cJ0rOY7JpZIo-KPCh9OMgJY").split(' ').join('+');
        var iframeBox = document.getElementById('map-block');
        iframeBox.appendChild(ifr);
        var markers = "color:red|".concat(self.room.locationLine1, ",").concat(self.room.locationLine2, ",").concat(self.room.stateprovincecounty, ",").concat(self.room.ziporpostcode, "|label:").concat(self.room.locationName);
        var mapImage = document.createElement('img');
        mapImage.style.height = '260px';
        mapImage.style.width = '100%';
        mapImage.style["float"] = 'left';
        mapImage.src = "https://maps.googleapis.com/maps/api/staticmap?center=".concat(self.room.locationLine1, ",").concat(self.room.locationLine2, ",").concat(self.room.stateprovincecounty, ",").concat(self.room.ziporpostcode, "&markers=").concat(markers, "&zoom=13&size=1080x260&maptype=roadmap&key=AIzaSyBIswHRc1E1cJ0rOY7JpZIo-KPCh9OMgJY").split(' ').join('+');
        var mapImageBox = document.getElementById('map-block-image');
        mapImageBox.appendChild(mapImage);
      }
    }
  }, {
    key: "buildRoomResources",
    value: function buildRoomResources() {
      var self = this;
      var fixed = typeof self.room.fixed_assets === 'undefined' ? [] : self.room.fixed_assets;
      var fixedUL = document.getElementById('roomdetail_fixed_resources');
      var fixedULSM = document.getElementById('roomdetail_fixed_resources_sm');
      var floating = typeof self.room.floating_assets === 'undefined' ? [] : self.room.floating_assets;
      var floatingUL = document.getElementById('roomdetail_floating_resources');
      var floatingULSM = document.getElementById('roomdetail_floating_resources_sm');
      var gLI = document.createElement('li');
      gLI.classList.add('list-group-item');
      gLI.innerHTML = 'None Available';

      if (Array.isArray(fixed) && fixed.length > 0) {
        for (var f = 0; f < fixed.length; f++) {
          var fa = fixed[f];
          var fixedLI = document.createElement('li');
          fixedLI.classList.add('list-group-item');
          fixedLI.innerHTML = "<span>" + fa.name + "</span>";

          if (fa.description !== null && fa.description.length > 0) {
            //fixedLI.setAttribute('title', fa.description);
            fixedLI.innerHTML = "<span>" + fa.name + "</span>&nbsp;&nbsp;<i class='fa fa-file-text list-group-item-desc' title='" + fa.description + "'></i>";
          }

          fixedUL.appendChild(fixedLI);
          fixedULSM.appendChild(fixedLI.cloneNode(true));
        }
      } else {
        fixedUL.appendChild(gLI);
        fixedULSM.appendChild(gLI.cloneNode(true));
      }

      if (Array.isArray(floating) && floating.length > 0) {
        for (var _f = 0; _f < floating.length; _f++) {
          var fla = floating[_f];
          var floatingLI = document.createElement('li');
          floatingLI.classList.add('list-group-item');
          floatingLI.innerHTML = "<span>" + fla.name + "</span>";

          if (fla.description !== null && fla.description.length > 0) {
            floatingLI.innerHTML = "<span>" + fla.name + "</span>&nbsp;&nbsp;<i class='fa fa-file-text list-group-item-desc' title='" + fla.description + "'></i>"; //floatingLI.setAttribute('title', fla.description);
          }

          floatingUL.appendChild(floatingLI);
          floatingULSM.appendChild(floatingLI.cloneNode(true));
        }
      } else {
        floatingUL.appendChild(gLI);
        floatingULSM.appendChild(gLI.cloneNode(true));
      }

      $('.list-group-item-desc').qtip({
        style: {
          classes: 'qtip-bootstrap events-popup',
          def: false,
          width: 500
        },
        hide: {
          fixed: true,
          delay: 300
        },
        position: {
          target: 'mouse'
        }
      });
    }
  }, {
    key: "getData",
    value: function () {
      var _getData2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var self;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                self = this; //self.clearRoomFilterData();

                _context2.prev = 1;

                if (!(Object.keys(self.clientSettings).length === 0)) {
                  _context2.next = 6;
                  break;
                }

                _context2.next = 5;
                return self.dataFunctions.clientSettings;

              case 5:
                self.clientSettings = _context2.sent;

              case 6:
                if (!(self.roomId > 0)) {
                  _context2.next = 11;
                  break;
                }

                self.dataFunctions.options = {
                  roomId: self.roomId
                };
                _context2.next = 10;
                return self.dataFunctions.roomById;

              case 10:
                self.room = _context2.sent;

              case 11:
                return _context2.abrupt("return", true);

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](1);
                alert("Failed to get all data. Please refresh the screen and try again.");

              case 17:
                return _context2.abrupt("return", false);

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 14]]);
      }));

      function getData() {
        return _getData2.apply(this, arguments);
      }

      return getData;
    }()
  }, {
    key: "init",
    value: function init() {
      var _this = this;

      if (this.roomId > 0) {
        // Then we don't care if room or branch info exist, we are going to be getting all that info by room ID
        // Not going to use for now - but perhaps eventually with a different init method
        this.getData().then(function (v) {
          if (v) {
            _this.buildRoomInfo();

            _this.buildRoomImagesBS();

            _this.buildRoomLayouts();

            _this.buildRoomDetail();

            _this.buildRoomResources();

            _this.buildRoomMap();

            $('.roomdetail-description').html(_this.roomTemplateParams.roomDescription);
            $('#roomdetail_image_container').carousel({
              interval: 5000,
              pause: 'hover',
              wrap: false
            });
            $('#roomdetail-loader').fadeOut('fast', function () {
              $('#roomdetail-page').fadeIn('fast');
              $('.cycle-slideshow').cycle();
            });
          }
        });
      } else {
        if (this.room !== null && this.branchInfo !== null) {
          // Then we have what we need anyway and don't need to bother with data
          this.buildRoomDetail();
          $('#roomdetail-loader').fadeOut('fast', function () {
            $('#roomdetail-page').fadeIn('fast');
          });
        }
      }
    }
  }]);

  return CoRoomDetail;
}();