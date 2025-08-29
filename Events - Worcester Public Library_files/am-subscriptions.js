String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

// CH13149
function patronSubscriptions(settings) {
  this.brochuredata = {
    ages: [],
    types: [],
    format: '',
    location: [],
    end_date: '',
    start_date: '',
    subscription: {
      frequency: '',
      run_date: '',
      email: '',
      filters: {}
    },
    type: 1,
    filters: []
  };

  this.element = null;
  this.endDate = '';
  this.eventCount = 0;
  this.filters = {};
  this.options = {};
  this.filterText = '';
  this.locations = [];
  this.popup = null;
  this.startDate = '';
  this.allowSubs = false;
  this.customEventsLabel = '';
  this.customEventLabel = '';

  if(settings) {
    if(Object.keys(settings).length > 0) {
      for(var key in settings) {
        this[key] = settings[key];
      }
    }
  }
}

patronSubscriptions.prototype.bindEvents = function() {
  var self = this;

  $('#download').off().on('click', function() {
    self.downloadBrochure();
  });

  $('#sendEmail').off().on('click', function() {
    if($.trim($('#email').val()).length > 0) {
      self.element = $(this);
      self.emailBrochure();
    } else {
      self.showAlert('Enter an email address to continue', false, true);
    }
  });

  if(self.allowSubs) {
    $('#subscribe').off().on('click', function() {
      if($.trim($('#sub-email').val()).length > 0) {
        self.element = $(this);
        self.subscribe();
      } else {
        self.showAlert('Enter an email address to continue', false, true);
      }
    });

    $('#brochure-subscription').on('click', function(){
      if($(this).is(":checked")){ 
        $('#subscribe').removeProp('disabled');
      } else {
        $('#subscribe').prop('disabled', true);
      }
    });

    $('#brochure-tabs a[href="#subTab"]').off().on('click', function() {
      $('#brochure-daterange').toggle();
    });
  }

  $('#brochure-tabs a[href!="#subTab"]').off().on('click', function() {
    $('#brochure-daterange').show();
  });

  $('input[name="subscription-frequency"]').off().on('click', function(e) {

    if ($(this).attr('id') === 'subscription-frequency-daily') {
      $('#subscription-weekly-dow-selector').toggleClass("hidden", $(this).is(":checked"));
      $('#sub-message').empty().text("After this brochure you will receive one daily for events for the following day.").prepend($('<i/>').addClass('am-events'));
    }

    if ($(this).attr('id') === 'subscription-frequency-monthly') {
      $('#subscription-weekly-dow-selector').toggleClass("hidden", $(this).is(":checked"));
      $('#sub-message').empty().text("After this brochure you will receive one for the coming month on the 1st of each month.").prepend($('<i/>').addClass('am-events'));
    }

    if ($(this).attr('id') === 'subscription-frequency-weekly') {
      // Then we need to show the day of the week selector? 
      $('#subscription-weekly-dow-selector').toggleClass("hidden", !$(this).is(":checked"));

      var day = moment().day($('input[name="subscription-frequency-weekly"]:checked').attr('data-dow')).format('dddd');
      $('#sub-message').empty().text("After this brochure you will receive one for the coming week on every " + day).prepend($('<i/>').addClass('am-events'));
      //$('#sub-message').empty().text("After this brochure you will receive one for the coming week on every Monday").prepend($('<i/>').addClass('am-events'));
    }
  });

  $('input[name="subscription-frequency-weekly"]').off().on('click', function(e) {
    var day = moment().day($('input[name="subscription-frequency-weekly"]:checked').attr('data-dow')).format('dddd');
    $('#sub-message').empty().text("After this brochure you will receive one for the coming week on every " + day).prepend($('<i/>').addClass('am-events'));
  });
};

patronSubscriptions.prototype.buildPopup = function(noheader) {
  var self  = this;
  var panel = '';
  var root  = $('<div />').attr('id', 'brochure-popup');
  var header = $('<div class="row">' +
                 '		<div class="col-md-12">' +
                 '			<div style="float:right;"><a class="close-brochure-popup" style="cursor: pointer;">close</a></div>' +
                 '			<h3 style="padding-left:25px;"><i class="fa fa-file-pdf-o" style="color:#ED0202;"></i>&nbsp;&nbsp;' + self.customEventsLabel.capitalize() + '  Brochure</h3>' +
                 '		</div>' +
                 '	</div>');

  self.getFilters();

  if(self.startDate === '' || self.endDate === ''){
    panel = '';
  } else {
    panel = $('<div class="row popup-row popup-filters">' +
                '		<div class="col-md-12" style="padding:4px;">' +
                '			<strong>Brochure will contain:</strong>' +
                '		</div>' +
                '		<div class="col-md-12" style="padding:4px;">'
                + self.filters.display +
                '		</div>' +
                '		<div class="col-md-12" style="padding:4px;" id="brochure-daterange">' +
                '			Date Range: ' + self.startDate + ' - ' + self.endDate + '<br>' +
                '		</div>' +
                '		<div class="col-md-12" style="padding:4px;" id="numberofevents">' +
                '		</div>' +
                '	</div>');
  }

  var clink = $('<div class="row popup-row">' +
                '		<div class="col-md-12" style="text-align: right;padding-top:6px;">' +
                '			<a class="close-brochure-popup" style="cursor: pointer;" href="/brochure">Create a different brochure</a>' +
                '		</div>' +
                '	</div>');

  if(!noheader) {
    root.append(header);
  }

  root.append(panel).append(clink).append(self.buildTabs());
  return root;
};

patronSubscriptions.prototype.buildTabs = function() {
  var self = this;

  // Build tab navigation.
  var tabList = $('<ul/>').attr('role', 'tablist').addClass('nav nav-tabs').attr('id', 'brochure-tabs');
  var link    = $('<a/>').attr('aria-controls', 'dlTab').attr('role', 'tab').attr('data-toggle', 'tab');
  var dlLink  = $('<li/>').attr('role', 'presentation').addClass('active').append(link.clone().attr('href', '#downloadTab').addClass('active').text('Download'));
  var emLink  = $('<li/>').attr('role', 'presentation').append(link.clone().attr('href', '#emailTab').text('Send via email'));
  var suLink  = $('<li/>').attr('role', 'presentation').append(link.clone().attr('href', '#subTab').text('Subscribe'));

  if(self.allowSubs) {
    tabList.append(dlLink).append(emLink).append(suLink);
  } else {
    tabList.append(dlLink).append(emLink);
  }

  // Build tab content area
  var tabContent = $('<div/>').addClass('tab-content popup-tab-content');
  var dlPanel = $('<div/>').addClass('tab-pane popup-pane active').attr('role', 'tabpanel').attr('id', 'downloadTab').attr('data-type', 'download');
  var emPanel = $('<div/>').addClass('tab-pane popup-pane').attr('role', 'tabpanel').attr('id', 'emailTab').attr('data-type', 'email');
  var suPanel = $('<div/>').addClass('tab-pane popup-pane').attr('role', 'tabpanel').attr('id', 'subTab').attr('data-type', 'subscription');

  var container = $('<div/>').addClass('container');
  var row = $('<div/>').addClass('row popup-row');
  var xlcol = $('<div/>').addClass('col-md-12');
  var lgcol = $('<div/>').addClass('col-md-8 col-md-offset-2');
  var smcol = $('<div/>').addClass('col-md-4');
  var btn = $('<button/>').addClass('btn btn-block button');
  var igrp = $('<div/>').addClass('input-group');
  var igrpi = $('<input/>').attr('type', 'text').addClass('form-control');
  var igrps = $('<span/>').addClass('input-group-btn');
  var igrpb = $('<button/>').addClass('btn popup-btn').attr('type', 'button');
  var lbl = $('<label/>').addClass('popup-label');
  var fp = $('<div/>').addClass('form-pair');
  // Build buttons
  var dlbtn = btn.clone().attr('id', 'download').text('Download Brochure');

  // Build Input Groups
  var embtn = igrps.clone().append(
                // Append the button to the span, set some stuff
                igrpb.clone().text('Send').attr('id', 'sendEmail')
              );

  // Assemble the email group
  var emgroup = igrp.clone().append(igrpi.clone().attr('id', 'email')).append(embtn);
  // Assemble the subscription group
  var subtn = igrps.clone().append(
    // Append the button to the span, set some stuff
    igrpb.clone().text('Send').attr('id', 'subscribe').prop('disabled', true)
  );

  // Build subscription frequency stuff...
  var dailyRadio =  $('<div/>')
  .addClass('radio')
  .append(
    lbl.clone()      
      .text('Daily')
      .prepend(
        $('<input/>').attr('type', 'radio').attr('name', 'subscription-frequency').attr('id', 'subscription-frequency-daily').prop('checked', true).val('daily')
      )
  );
  
  var weeklyRadio =  $('<div/>')
  .addClass('radio')
  .append(
    lbl.clone()
      .text('Weekly')
      .prepend(
        $('<input/>').attr('type', 'radio').attr('name', 'subscription-frequency').attr('id', 'subscription-frequency-weekly').prop('checked', false).val('weekly')
      )
  )

  var weeklyDaysOfWeek = function() {
    var dowRow = row.clone();
    var dowCol = lgcol.clone();
    var dowForm = $('<div/>');
    var checked = true;

    dowRow.addClass('hidden').attr('id', 'subscription-weekly-dow-selector');
    dowText = $('<p><strong>Select which day of the week to receive the brochure for the following week of events.</strong></p>');
    dowForm.addClass('form-horizontal');
        
    for (var d=0;d<7;d++) {
      var dowName = moment().day(d).format('ddd');
      var radio =  $('<label/>')
      .addClass('radio-inline')
      .text(dowName)
      .prepend(
        $('<input/>').attr('type', 'radio').attr('name', 'subscription-frequency-weekly').attr('id', 'subscription-frequency-weekly-dow-' + d).prop('checked', checked).addClass('subscription-dow-day').attr('data-dow', d)
      )

      dowForm.append(radio);
      checked = false;
    }

    dowRow.append(lgcol.clone().append(dowText)).append(dowCol.append(dowForm));    
    return dowRow;
  };

  var monthlyRadio =  $('<div/>')
  .addClass('radio')
  .append(
    lbl.clone()
      .text('Monthly')
      .prepend(
        $('<input/>').attr('type', 'radio').attr('name', 'subscription-frequency').attr('id', 'subscription-frequency-monthly').prop('checked', false).val('monthly')
      )
  );

  var frequencyText = $('<p><strong>Please select the frequency that you would like to receive a brochure with the above filters applied.</strong></p>');
  var frequencyGroup = row.clone().append(
    lgcol.clone()
      .append(frequencyText)
      .append(dailyRadio)
      .append(weeklyRadio)
      .append(monthlyRadio)      
  );

  // Build sub group 
  var igroup = igrp.clone().append(igrpi.clone().attr('id', 'sub-email')).append(subtn);
  var sumessage = row.clone().append(lgcol.clone().append($('<div/>').addClass('subscription-message-box popup-filters brochure-message-box')));
  var sugroup1 = row.clone().append(lgcol.clone().append(igroup));
  var cb = $('<input/>').attr('type', 'checkbox').attr('name', 'brochure-subscription').attr('id', 'brochure-subscription').prop('checked', false);
  var bscb = $('<div/>').addClass('checkbox').append(lbl.clone().text('I agree to be sent regular emails relating to library ' + self.customEventsLabel + '.').prepend(cb));
  var sugroup2 = row.clone().append(xlcol.clone().addClass('popup-text-center').append(fp.clone().append(bscb)));
  var infoRow = $('<p/>').attr('id', 'sub-message').addClass('sub-message');
  var sugroup3 = row.clone().append(xlcol.clone().addClass('popup-text-center').append(infoRow));
  // Assemble the panels
  // DL Panel
  var dlR = row.clone();
  var dlCol = lgcol.clone();
  dlPanel.append(row.clone().append(lgcol.clone().append($('<div/>').addClass('download-message-box popup-filters brochure-message-box'))))
  dlPanel.append(dlR.append(dlCol.append(dlbtn)));

  // Email Panel
  var emR = row.clone();
  var emCol = lgcol.clone();
  emPanel.append(row.clone().append(lgcol.clone().append($('<div/>').addClass('email-message-box popup-filters brochure-message-box'))))
  emPanel.append(emR.append(emCol.append(emgroup)));

  // Subscribe Panel
  suPanel.append(sumessage);
  suPanel.append(frequencyGroup);
  suPanel.append(weeklyDaysOfWeek);
  suPanel.append(sugroup1);
  suPanel.append(sugroup2);
  suPanel.append(sugroup3);

  // Build the tab body
  if(self.allowSubs) {
    tabContent.append(dlPanel).append(emPanel).append(suPanel);
  } else {
    tabContent.append(dlPanel).append(emPanel);
  }

  // Build the whole tabs and return
  var tabs = $('<div/>').addClass('row popup-row').append(tabList).append(tabContent);
  return tabs;
};

patronSubscriptions.prototype.downloadBrochure = function(){
  var self = this;
  var ele = $('#download');
  self.brochuredata.format = 'pdf';
  self.brochuredata.direct = true;
  ele.prop('disabled', 'disabled');
  ele.append('&nbsp;&nbsp;<i class="fa fa-spinner fa-spin download-spinner"></i>');

  // Have to do this this way for download.
  var req = new XMLHttpRequest();
  var data = new FormData();
  data.append("brochuredata", JSON.stringify(self.brochuredata));
  var website = (window.websiteUrl || "");
  req.open("POST", website + "/brochure_generator", true);
  req.responseType = 'arraybuffer';
  req.onload = function(evt){
    $(".download-spinner").remove();
          ele.removeProp('disabled');
    if(this.status === 200){
      try {
        // Sometimes we might be getting json back from the server. Since we are forcing arraybuffer above,
        // we have to convert the buffer back into the string we need to Parse. If either step fail then it could still be a blob.
        var resp = String.fromCharCode.apply(null, new Uint8Array(req.response));
        var data = JSON.parse(resp);
        if(data.message){
          self.showAlert(data.message, true, false);
        }
      } catch(err) {
        var dl = "EventBrochure-" + moment().format("YYYYMMDD-HHmm") + ".pdf";
        if(navigator.msSaveOrOpenBlob){
          navigator.msSaveOrOpenBlob(new Blob([req.response], { type: 'application/pdf' }), dl);
        } else {
          try{
            var pdfBlob = new Blob([req.response], { type: 'application/pdf' });
            var link=document.createElement('a');
            link.href= window.URL.createObjectURL(pdfBlob);
            link.download=dl;
            // Firefox requires this stupid little line.
            document.body.appendChild(link);
            link.click();
            link.remove();
          } catch(errBlob){
            //lert(errBlob.message);
            self.showAlert("Failed to download PDF. Please contact Communico Support.", false, true);
            console.log('error:', errBlob);
          }
        }
      }
    }
  };
  req.send(data);
};

patronSubscriptions.prototype.emailBrochure = function(isSub){
  var self = this;
  if(self.element !== null) {
    self.element.prop('disabled', 'disabled');
    self.element.append('&nbsp;&nbsp;<i class="fa fa-spinner fa-spin email-spinner"></i>');

    

    if(isSub) {    
      self.brochuredata.format = 'subscription';
      self.brochuredata.email = $.trim($('#sub-email').val());
      var dow = -1;
      var freq = $('input[name="subscription-frequency"]:checked').val();
      if (freq === 'weekly') {
        dow = $('input[name="subscription-frequency-weekly"]:checked').attr('data-dow');
      }
      
      self.brochuredata.subscription = {
        "frequency": freq,
        "run_date": moment().format('YYYY-MM-DD'),      
        "email": self.brochuredata.email, 
        "daysofweek": dow,
        "filters": {
          "ages": self.brochuredata.ages,
          "types": self.brochuredata.types,
          "location": self.brochuredata.location
        }
      }
    } else {
      self.brochuredata.format = 'email';
      self.brochuredata.email = $.trim($("#email").val());
    }



    if(self.brochuredata.email.length > 0) {
      self.brochuredata.direct = true;
      $.post("/brochure_generator", {brochuredata: JSON.stringify(self.brochuredata)}, function(){
        $(".email-spinner").remove();
        self.element.removeProp('disabled');
        self.showAlert("Successfully e-mailed brochure.", true, false);
      });
    } else {
      self.showAlert("An email address is required.", false, true);
    }
  }
};

patronSubscriptions.prototype.getFilters = function(){
  var self = this;
  var locDisplay = [];
  var ageDisplay = [];
  var typeDisplay = [];
  var filterString ='';

  if(self.filters){
    self.brochuredata.ages = self.filters.ages.length > 0 ? self.filters.ages : ['all'];
    self.brochuredata.types = self.filters.types.length > 0 ? self.filters.types : ['all'];
    self.brochuredata.location = self.options.locations.length > 0 ? self.options.locations : ['all'];
    self.brochuredata.start_date = moment(self.options.date).format('YYYY-MM-DD');
    self.brochuredata.end_date = '';

    var term = $('.events-search-field', self.element).val();
    if(term && term.length>2){
      self.brochuredata.search_term = term;
    }

    var term = $('.events-search-field', self.element).val();
    if(term && term.length>2){
      self.brochuredata.search_term = term;
    }

    if(self.options.days > 1){
      self.brochuredata.end_date = moment(self.options.date).add(self.options.days - 1, 'days').format('YYYY-MM-DD');
    } else {
      self.brochuredata.end_date = moment(self.brochuredata.start_date).add(self.options.days, 'days').format('YYYY-MM-DD');
    }
  }

  if(self.filters.locations.length>0||self.filters.ages.length>0||self.filters.types.length>0||(self.brochuredata.start_date!=='' && self.brochuredata.end_date !=='')){
    filterString='Generating brochure with: ';
    if(self.filters.types.length>0){
      filterString+=self.filters.types.join(', ') + ' ' + self.customEventsLabel;
    }else{
      filterString+='all ' + self.customEventLabel + ' types';
    }
    filterString+=' at ';
    if(self.filters.locations.length>0){
        filterString+=self.filters.locations.join(', ');
    }else{
        filterString+='all locations';
    }
    filterString+=' for ';
    if(self.filters.ages.length>0){
        if(self.filters.ages.length>1){
            filterString+='the age groups '+self.filters.ages.join(', ');
        }else{
            filterString+='the age group '+self.filters.ages[0];
        }
    }else{
        filterString+='all ages';
    }
  }

  self.filters.display = filterString;
  self.startDate = moment(self.filters.date).format('dddd MMMM DD YYYY');
  if(self.options.days > 1){
    self.endDate = moment(self.startDate).add(self.options.days - 1, 'days').format('dddd MMMM DD YYYY');
  } else {
    self.endDate = moment(self.startDate).add(self.options.days, 'days').format('dddd MMMM DD YYYY');
  }
};

patronSubscriptions.prototype.showAlert = function(message, closePopup, errorState) {
  var self = this;
  var tabSelected = $('.popup-pane.active').attr('data-type');
  if(typeof tabSelected !== 'undefined') tabSelected = "." + tabSelected + "-message-box";
  if(errorState) $(tabSelected).addClass('alert');
  $(tabSelected).text(message).show(0, function() {
    $(tabSelected).fadeOut(3000, function() {
      if(closePopup) {
        self.popup.data('plugin_amPopup').close();
      }
    });
  });
};

// CH13149
// Pass along a custon label for "events" and "event"
patronSubscriptions.prototype.showPopup = function(){
  var self=this;
  self.getFilters();
  var html = self.buildPopup();

  self.popup = $('<div class="events2-brochure"></div>').amPopup({title:'', popUpClass:'', showTitle: false});
  self.popup.append(html);

  self.popup.on('click', '.close-brochure-popup', function(){
    self.popup.data('plugin_amPopup').close();
  })

  self.popup.data('plugin_amPopup').open();
  $('.brochure-message-box').hide();
  self.bindEvents();
  self.updateEventCount();
};

patronSubscriptions.prototype.showStatic = function() {
  var self=this;
  self.getFilters();
  var html = self.buildPopup(true);
  $('#brochure-filter-display').empty().append(html);
  $('.brochure-message-box').hide();
  self.bindEvents();
  self.updateEventCount();
};

patronSubscriptions.prototype.subscribe = function(){
  var self = this;
  self.emailBrochure(true);
};

patronSubscriptions.prototype.updateEventCount = function(){
  var self = this;
	var website = (window.websiteUrl || "");
  $.ajax({
    type: "POST",
    url: website + "/brochure_generator",
    data: { countdata: JSON.stringify(self.brochuredata) },
  }).done(function(data, status, xhr){
    self.eventCount = data.count;
    $('#numberofevents').text("# of " + self.customEventsLabel.capitalize() + " in Brochure: " + data.count.toString() + ((parseInt(data.count) > 1000) ? "*Warning* Over 1000 " + self.customEventsLabel + " have been selected, this may cause unexpected performance problems. Try and narrow your search." : ""));

    if(data.count == 0){
      $('.download-button, .send-button').prop("disabled", "disabled").addClass("disabled");
      $('#numberofevents').html("<span style='color:#ED0202;'>No " + self.customEventsLabel + " will be returned.</span>")

    } else {
      $('.download-button, .send-button').removeProp("disabled").removeClass("disabled");
    }
  }).fail(function(data, status, error){
    console.log('e', error);
  });
};



function subscriptions() {
  this.age_colors = [];
  this.type_colors = [];
  this.daysofweek = '';
  this.durationType = '';
  this.duration = 0;
  this.frequency = 'custom';
  this.id = 0;
  this.mode = '';
  this.recipients = [];
  this.subData = {
    days: 0, weeks: 0, months: 0
  };
  this.table = null;
}

subscriptions.prototype.deleteSchedule = function() {
  var self = this;
  $.post('/ajax/fetch/delete_schedule', {
    id: self.id
  }, function(data, textStatus){
    var json = JSON.parse(data);
    showAlert(json);
    self.setupTable();
    closeDialog(json.type === 'success');
  });
};

subscriptions.prototype.editSchedule = function(){
  var self = this;
  var edit  = self.id > 0;
  var title = 'Create Brochure Subscription';
  if(edit > 0){
    title = 'Edit Brochure Subscription';
  }

  openDialogWithData($('.scheduler').html(), title, function(dlg) {
    self.dlg = dlg;
    if(!edit) {
      var emailPack = $('#name', self.dlg).parent().clone();
      var i = emailPack.find('input');
      var l = emailPack.find('label');
      i.attr('id', 'email').empty().off();
      l.text('To');
      $('#name', self.dlg).parent().after(emailPack);
    }

    $('#location_id', self.dlg).multiselect({
	  enableHTML: true,
	  nonSelectedText:'All locations',
      numberDisplayed: 1,
      onChange: self.selectionChanged
    }).on('change', function(){ });

    $('#ages', self.dlg)
    .multiselect({
      enableHTML: true,
	  nonSelectedText:'All ages',
      numberDisplayed: 1,
      onChange: self.selectionChanged,
      optionLabel: function(element) {
        if(typeof self.age_colors[element.value] !== 'undefined') {
          var icon = '<i class="fa fa-circle" style="color:' + self.age_colors[element.value] + '"></i>&nbsp;' + element.text;
          return icon;
        }

        return element.text;
      }
    })
    .on('change', function(){ });

    $('#types', self.dlg)
    .multiselect({
      enableHTML: true,
	  nonSelectedText:'All types',
      numberDisplayed: 1,
      onChange: self.selectionChanged,
      optionLabel: function(element) {
        if(typeof self.type_colors[element.value] !== 'undefined') {
          var icon = '<i class="fa fa-circle" style="color:' + self.type_colors[element.value] + '"></i>&nbsp;' + element.text;
          return icon;
        }

        return element.text;
      }
    })
    .on('change', function(){ });

    addButton('.gldbuttons', '<i class="fa fa-check"></i>', 'btn-save', function(){
      self.saveSubscription();
    });

    addButton('.gldbuttons', '<i class="fa fa-times"></i>', 'btn-edit', function(){;
      closeDialog(false);
    });

    if(edit) {
      self.getSchedule();
    }
  });
};

subscriptions.prototype.getSchedule = function() {
  var self = this;
  $.getJSON('/ajax/fetch/get_schedule', { id: self.id }).done(function(json){
    self.filters = [];
    self.subData = [];
    self.duration = 0;
    self.durationType = '';

    try {
      self.filters = JSON.parse(json.filters);
      self.processFilters();
    } catch(err) { self.filters = null; }

    try {
      self.subData = JSON.parse(json.subData);
    } catch(err) { self.subData = null; }

    try {
      self.recipients = json.recipients;
      $('#recipients', self.dlg).val(self.recipients);
    } catch(err) { self.recipients = []; }

    $('#name', self.dlg).val(json.name);

    if(self.subData !== null) {
      if(self.subData.days && parseInt(self.subData.days) > 0) {
        self.duration = self.subData.days;
        self.durationType = 'Days';
      }
      if(self.subData.weeks && parseInt(self.subData.weeks) > 0) {
        self.duration = self.subData.weeks;
        self.durationType = 'Weeks';
      }
      if(self.subData.months && parseInt(self.subData.months) > 0) {
        self.duration = self.subData.months;
        self.durationType = 'Months';
      }
      $('#every_x_btn', self.dlg).text(self.durationType);
      $('#every_x', self.dlg).val(self.duration);
    }
  });
};

subscriptions.prototype.isAll = function(el) {
  return $(el).val()=='all'?'events2-all-option':'';
}

subscriptions.prototype.processFilters = function() {
  var self = this;
  var f = self.filters;
  //console.log('filters: ', self.filters);

  if(f) {
    if($.isArray(f.ages)) {
      if(f.ages[0] !== "all" && f.ages.length > 0) {
        $('#ages', self.dlg).multiselect('select', f.ages).multiselect('refresh');
      }
    }

    if($.isArray(f.locations)) {
      if(f.locations[0] !== "all" && f.locations.length > 0) {
        $('#location_id', self.dlg).multiselect('select', f.locations).multiselect('refresh');
      }
    }

    if($.isArray(f.types)) {
      if(f.types[0] !== "all" && f.types.length > 0) {
        $('#types', self.dlg).multiselect('select', f.types).multiselect('refresh');
      }
    }
  }
};

subscriptions.prototype.refreshTable = function() {
  var self = this;
  self.table = $('.scheduletable').dataTable({
    "bJQueryUI": false,
    "bAutoWidth": false,
    "sPaginationType": "full_numbers",
    "sDom": '<"header"fl>rt<"footer"ip><"clearfix">'
  });

  $('.add-schedule-button').on('click', function () {
    self.mode = 'add';
    self.id = 0;

    self.editSchedule();
  });

  $('.scheduletable tbody').on('click', '.btn-edit-sched', function () {
    self.id = parseInt($(this).attr('data-schedule-id'));
    self.editSchedule();
  });

  $('.scheduletable tbody').on('click', '.btn-delete-sched', function () {
    self.id = parseInt($(this).attr('data-schedule-id'));
    self.deleteSchedule();
  });
};

subscriptions.prototype.getValues = function () {
  // Function to get date/frequency info
	var self = this;

	self.filters = {
		ages: $('#ages', self.dlg).val(),
		types: $('#types', self.dlg).val(),
		locations: $('#location_id', self.dlg).val()
	};

	var everyX = $.trim($('#every_x', self.dlg).val());
	if (everyX.length > 0) {
		self.subData[self.durationType] = parseInt(everyX);
	}

	self.frequency = self.durationType;
	self.name = $('#name', self.dlg).val();
	self.reportId = 0;
  self.recipients = $.trim($('#recipients', self.dlg).val());
  self.daysofweek = self.frequency === 'weekly' ? $('input[name="subscription-frequency-weekly"]:checked').val() : -1;
};

subscriptions.prototype.saveSubscription = function () {
	var self = this;
	self.getValues();

	$.post('/ajax/fetch/edit_schedule', {
		id: self.id,
		name: self.name,
		frequency: self.frequency,
		mode: self.mode,
		report_id: self.reportId,
		subData: JSON.stringify(self.subData),
		filters: JSON.stringify(self.filters),
		recipients: self.recipients,
		daysofweek: self.daysofweek,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
		emailSettings: JSON.stringify({
			subject: 'Brochure Subscription',
			text: 'Brochure subscription, automated email.'
    }),
    format: 'pdf',
    type: 'brochure'
	}, function (data, textStatus) {
		var json = JSON.parse(data);
		showAlert(json);
		self.setupTable();
		closeDialog(json.type === 'success');
	});
};

subscriptions.prototype.selectionChanged = function(element, checked) {
  var select = null;
  var v = null;

  if(element.length > 1) {
    select = $(element)[0].closest('select');
    v = $(element)[0].val();
  } else {
    select = $(element).closest('select');
    v = $(element).val();
  }

  if(v !== 'all') {
    // Then it's not the all switch, therefore, no matter what, we uncheck it.
    select.find("option[value=all]").removeProp("selected");
  } else {
    select.find("option:not([value=all])").removeProp("selected");
  }

  select.multiselect('refresh');
};

subscriptions.prototype.setupTable = function() {
  var self = this;

  if($('.scheduletable').length > 0) {
    $('.scheduletable').remove();
  }

  $('.schedule-table-container')
  .empty()
  .load('/ajax/fetch/get_schedule_table', {
    mode: 'brochure'
  }, function(resp, status, xhr) {
    if(status === 'error') {
      alert('unable to load table for schedules.');
    } else {
      self.refreshTable();
    }
  });
};