/*jslint browser: true */ /*global jQuery: true */

/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

// TODO JsDoc

/**
 * Create a cookie with the given key and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String key The key of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given key.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String key The key of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function (key, value, options) {

    // key and value given, set cookie...
    if (arguments.length > 1 && (value === null || typeof value !== "object")) {
        options = jQuery.extend({}, options);

        if (value === null) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? String(value) : encodeURIComponent(String(value)),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};
;
/*
 * Match Heights Plugin
 * Match the heights of targeted elements
 * 
 * Version 1.3
 * Updated 4/7/2010
 * Copyright (c) 2010 Mike Avello
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
(function(a){a.fn.matchHeights=function(b){b=jQuery.extend(this,{minHeight:null,maxHeight:null},b);tallest=b.minHeight?b.minHeight:0;this.each(function(){if(a(this).innerHeight()>tallest)tallest=a(this).outerHeight()});if(b.maxHeight&&tallest>b.maxHeight)tallest=b.maxHeight;return this.each(function(){extra=a(this).innerHeight()-a(this).height();extra+=a(this).outerHeight()-a(this).innerHeight();a.browser.msie&&a.browser.version==6||b.maxHeight?a(this).css({height:tallest-extra}):a(this).css({"min-height":tallest-extra})})}})(jQuery);;
(function ($) {
Drupal.behaviors.actionTBSimply = {
  attach: function (context) {
    window.setTimeout(function() {
      //$('#main-content .grid-inner, .region-sidebar-first').matchHeights();
    }, 100);
  }
};
})(jQuery);
;
(function ($) {
  Drupal.TBResponsive = Drupal.TBResponsive || {};
  Drupal.TBResponsive.supportedScreens = [0.5, 479.5, 719.5, 959.5, 1049.5];
  Drupal.TBResponsive.oldWindowWidth = 0;
  Drupal.TBResponsive.IE8 = $.browser.msie && parseInt($.browser.version, 10) === 8;
  Drupal.TBResponsive.toolbar = false;
  Drupal.TBResponsive.slideshowSize = false;
  
  Drupal.TBResponsive.updateResponsiveMenu = function(){
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    if(windowWidth < Drupal.TBResponsive.supportedScreens[3]){
      $('#menu-bar-wrapper .container').eq(0).hide();
      $('#menu-bar-wrapper .responsive-menu-button').show();
    }
    else{
      $('#menu-bar-wrapper .responsive-menu-button').hide();
      $('#menu-bar-wrapper .container').eq(0).show();
    }
  }
  
  Drupal.TBResponsive.initResponsiveMenu = function(){
    Drupal.TBResponsive.updateResponsiveMenu();
    $('#menu-bar-wrapper .tb-main-menu-button').bind('click',function(e){
      var target = $('#menu-bar-wrapper .container').eq(0);
      if(target.css('display') == 'none') {
        target.css({display: 'block'});          
      }
      else {
        target.css({display: 'none'});
      }
    });
  }
  
  Drupal.TBResponsive.getImageSize = function(img) {
    if(img.height == 0) {
      setTimeout(function() {
          Drupal.TBResponsive.getImageSize(img);
      }, 200);
      return;
    }
    if(!Drupal.TBResponsive.slideshowSize) {
      Drupal.TBResponsive.slideshowSize = {height: img.height, width: img.width};
    }
  }
  
  Drupal.TBResponsive.updateSlideshowSize = function(){
    var slideshow = $('#slideshow-wrapper .views-slideshow-cycle-main-frame');
    if(slideshow.length == 0) return;
    var imgs = slideshow.find('img');
    if(imgs.length && !Drupal.TBResponsive.slideshowSize) {
      var img = new Image();
      img.src = $(imgs[0]).attr('src');
      Drupal.TBResponsive.getImageSize(img);
      setTimeout(Drupal.TBResponsive.updateSlideshowSize, 200);
      return; // do nothing at the first time
    }  
    
    slideshow.cycle('destroy');
    var width = $('#slideshow-wrapper .container').eq(0).width();
    var height = width * Drupal.TBResponsive.slideshowSize.height / Drupal.TBResponsive.slideshowSize.width;
    $('#slideshow-wrapper .views-slideshow-cycle-main-frame-row, #slideshow-wrapper .views-slideshow-cycle-main-frame-row img, #slideshow-wrapper .views-slideshow-cycle-main-frame').height(height).width(width);
    slideshow.cycle();
    
  }
  
  Drupal.behaviors.actionTBResponsive = {
    attach: function (context) {
      $(window).load(function(){
        Drupal.TBResponsive.initResponsiveMenu();
        Drupal.TBResponsive.updateSlideshowSize();
        
      	Drupal.TBResponsive.toolbar = $('#toolbar').length ? $("#toolbar") : false;
        $(window).resize(function(){     
          // when administration toolbar is displayed
          $('body').css({'padding-top': Drupal.TBResponsive.toolbar ? (Drupal.TBResponsive.toolbar.height() - (Drupal.TBResponsive.IE8 ? 10 : 0)) : 0});
          
          var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
          if(windowWidth != Drupal.TBResponsive.oldWindowWidth){
            Drupal.TBResponsive.oldWindowWidth = windowWidth;
            Drupal.TBResponsive.updateResponsiveMenu();   
            Drupal.TBResponsive.updateSlideshowSize();
          }
        });
      });      
    }
  };
})(jQuery);
;
(function($) {
  $.fn.placeholder = function(params) { 
    var $this = $(this);
    if($this.val() == "") {
      $this.val(params['value']);
    }
    $this.focus(function(){
      if(this.value == Drupal.t(params['value'])) {
        this.value='';
      }
    }).blur(function(){
      if(this.value == '') {
        this.value = Drupal.t(params['value']);
      }
    });
  };
  $.fn.clearMinHeight = function() {
    $(this).css('min-height', '0px');
  }
  
  $.fn.passwordPlaceHolder = function(params) {
    var id = $(this).attr('id');
    var class_name = $(this).attr('class');
    var ele_name = $(this).attr('name');
    var tmp_id = id + "-tmp";
    var tmp_name = ele_name + "-tmp";
    var tmp_class = class_name;
    $(this).after('<input type="text" class="' + tmp_class + '" maxlength="60" size="15" name="' + tmp_name + '" id="' + tmp_id + '" value="' + Drupal.t('Password') + '"/>');
    $(this).hide();
    $('#' + tmp_id).focus(function(){
        $(this).hide();
        $('#' + id).show().focus();
    });
    $('#' + id).blur(function(){
      if($(this).val() == '') {
        $(this).hide();
        $('#' + tmp_id).show();
      }
    });
  };
})(jQuery);
;
/*! iFrame Resizer (iframeSizer.min.js ) - v2.8.6 - 2015-04-06
 *  Desc: Force cross domain iframes to size to content.
 *  Requires: iframeResizer.contentWindow.min.js to be loaded into the target frame.
 *  Copyright: (c) 2015 David J. Bradshaw - dave@bradshaw.net
 *  License: MIT
 */

!function(){"use strict";function a(a,b,c){"addEventListener"in window?a.addEventListener(b,c,!1):"attachEvent"in window&&a.attachEvent("on"+b,c)}function b(){var a,b=["moz","webkit","o","ms"];for(a=0;a<b.length&&!A;a+=1)A=window[b[a]+"RequestAnimationFrame"];A||e(" RequestAnimationFrame not supported")}function c(){var a="Host page";return window.top!==window.self&&(a=window.parentIFrame?window.parentIFrame.getId():"Nested host page"),a}function d(a){return x+"["+c()+"]"+a}function e(a){u&&"object"==typeof window.console&&console.log(d(a))}function f(a){"object"==typeof window.console&&console.warn(d(a))}function g(a){function b(){function a(){k(F),i(),C[G].resizedCallback(F)}g("Height"),g("Width"),l(a,F,"resetPage")}function c(a){var b=a.id;e(" Removing iFrame: "+b),a.parentNode.removeChild(a),C[b].closedCallback(b),delete C[b],e(" --")}function d(){var a=E.substr(y).split(":");return{iframe:document.getElementById(a[0]),id:a[0],height:a[1],width:a[2],type:a[3]}}function g(a){var b=Number(C[G]["max"+a]),c=Number(C[G]["min"+a]),d=a.toLowerCase(),f=Number(F[d]);if(c>b)throw new Error("Value for min"+a+" can not be greater than max"+a);e(" Checking "+d+" is in range "+c+"-"+b),c>f&&(f=c,e(" Set "+d+" to min value")),f>b&&(f=b,e(" Set "+d+" to max value")),F[d]=""+f}function m(){var b=a.origin,c=F.iframe.src.split("/").slice(0,3).join("/");if(C[G].checkOrigin&&(e(" Checking connection is from: "+c),""+b!="null"&&b!==c))throw new Error("Unexpected message received from: "+b+" for "+F.iframe.id+". Message was: "+a.data+". This error can be disabled by adding the checkOrigin: false option.");return!0}function n(){return x===(""+E).substr(0,y)}function o(){var a=F.type in{"true":1,"false":1};return a&&e(" Ignoring init message from meta parent page"),a}function p(a){return E.substr(E.indexOf(":")+w+a)}function q(a){e(" MessageCallback passed: {iframe: "+F.iframe.id+", message: "+a+"}"),C[G].messageCallback({iframe:F.iframe,message:JSON.parse(a)}),e(" --")}function r(){return null===F.iframe?(f(" IFrame ("+F.id+") not found"),!1):!0}function s(a){var b=a.getBoundingClientRect();return h(),{x:parseInt(b.left,10)+parseInt(z.x,10),y:parseInt(b.top,10)+parseInt(z.y,10)}}function v(a){function b(){z=g,A(),e(" --")}function c(){return{x:Number(F.width)+d.x,y:Number(F.height)+d.y}}var d=a?s(F.iframe):{x:0,y:0},g=c();e(" Reposition requested from iFrame (offset x:"+d.x+" y:"+d.y+")"),window.top!==window.self?window.parentIFrame?a?parentIFrame.scrollToOffset(g.x,g.y):parentIFrame.scrollTo(F.width,F.height):f(" Unable to scroll to requested position, window.parentIFrame not found"):b()}function A(){!1!==C[G].scrollCallback(z)&&i()}function B(a){function b(a){var b=s(a);e(" Moving to in page link (#"+c+") at x: "+b.x+" y: "+b.y),z={x:b.x,y:b.y},A(),e(" --")}var c=a.split("#")[1]||"",d=decodeURIComponent(c),f=document.getElementById(d)||document.getElementsByName(d)[0];window.top!==window.self?window.parentIFrame?parentIFrame.moveToAnchor(c):e(" In page link #"+c+" not found and window.parentIFrame not found"):f?b(f):e(" In page link #"+c+" not found")}function D(){switch(F.type){case"close":c(F.iframe);break;case"message":q(p(6));break;case"scrollTo":v(!1);break;case"scrollToOffset":v(!0);break;case"inPageLink":B(p(9));break;case"reset":j(F);break;case"init":b(),C[G].initCallback(F.iframe);break;default:b()}}var E=a.data,F={},G=null;n()&&(F=d(),G=F.id,u=C[G].log,e(" Received: "+E),!o()&&r()&&m()&&(D(),t=!1))}function h(){null===z&&(z={x:void 0!==window.pageXOffset?window.pageXOffset:document.documentElement.scrollLeft,y:void 0!==window.pageYOffset?window.pageYOffset:document.documentElement.scrollTop},e(" Get page position: "+z.x+","+z.y))}function i(){null!==z&&(window.scrollTo(z.x,z.y),e(" Set page position: "+z.x+","+z.y),z=null)}function j(a){function b(){k(a),m("reset","reset",a.iframe,a.id)}e(" Size reset requested by "+("init"===a.type?"host page":"iFrame")),h(),l(b,a,"init")}function k(a){function b(b){a.iframe.style[b]=a[b]+"px",e(" IFrame ("+c+") "+b+" set to "+a[b]+"px")}var c=a.iframe.id;C[c].sizeHeight&&b("height"),C[c].sizeWidth&&b("width")}function l(a,b,c){c!==b.type&&A?(e(" Requesting animation frame"),A(a)):a()}function m(a,b,c,d){c&&c.contentWindow?(e("["+a+"] Sending msg to iframe ("+b+")"),c.contentWindow.postMessage(x+b,"*")):(f("["+a+"] IFrame not found"),C[d]&&delete C[d])}function n(b){function c(){function a(a){1/0!==C[o][a]&&0!==C[o][a]&&(n.style[a]=C[o][a]+"px",e(" Set "+a+" = "+C[o][a]+"px"))}a("maxHeight"),a("minHeight"),a("maxWidth"),a("minWidth")}function d(a){return""===a&&(n.id=a="iFrameResizer"+s++,u=(b||{}).log,e(" Added missing iframe ID: "+a+" ("+n.src+")")),a}function f(){e(" IFrame scrolling "+(C[o].scrolling?"enabled":"disabled")+" for "+o),n.style.overflow=!1===C[o].scrolling?"hidden":"auto",n.scrolling=!1===C[o].scrolling?"no":"yes"}function g(){("number"==typeof C[o].bodyMargin||"0"===C[o].bodyMargin)&&(C[o].bodyMarginV1=C[o].bodyMargin,C[o].bodyMargin=""+C[o].bodyMargin+"px")}function h(){return o+":"+C[o].bodyMarginV1+":"+C[o].sizeWidth+":"+C[o].log+":"+C[o].interval+":"+C[o].enablePublicMethods+":"+C[o].autoResize+":"+C[o].bodyMargin+":"+C[o].heightCalculationMethod+":"+C[o].bodyBackground+":"+C[o].bodyPadding+":"+C[o].tolerance+":"+C[o].enableInPageLinks+":"+C[o].resizeFrom}function i(b){a(n,"load",function(){var a=t;m("iFrame.onload",b,n),!a&&C[o].heightCalculationMethod in B&&j({iframe:n,height:0,width:0,type:"init"})}),m("init",b,n)}function k(a){if("object"!=typeof a)throw new TypeError("Options is not an object.")}function l(a){a=a||{},C[o]={},k(a);for(var b in E)E.hasOwnProperty(b)&&(C[o][b]=a.hasOwnProperty(b)?a[b]:E[b]);u=C[o].log}var n=this,o=d(n.id);l(b),f(),c(),g(),i(h())}function o(a,b){null===D&&(D=setTimeout(function(){D=null,a()},b))}function p(){o(function(){for(var a in C)"parent"===C[a].resizeFrom&&m("Window resize","resize",document.getElementById(a),a)},66)}function q(){function a(a,b){if(!a.tagName)throw new TypeError("Object is not a valid DOM element");if("IFRAME"!==a.tagName.toUpperCase())throw new TypeError("Expected <IFRAME> tag, found <"+a.tagName+">.");n.call(a,b)}return function(b,c){switch(typeof c){case"undefined":case"string":Array.prototype.forEach.call(document.querySelectorAll(c||"iframe"),function(c){a(c,b)});break;case"object":a(c,b);break;default:throw new TypeError("Unexpected data type ("+typeof c+").")}}}function r(a){a.fn.iFrameResize=function(a){return this.filter("iframe").each(function(b,c){n.call(c,a)}).end()}}var s=0,t=!0,u=!1,v="message",w=v.length,x="[iFrameSizer]",y=x.length,z=null,A=window.requestAnimationFrame,B={max:1,scroll:1,bodyScroll:1,documentElementScroll:1},C={},D=null,E={autoResize:!0,bodyBackground:null,bodyMargin:null,bodyMarginV1:8,bodyPadding:null,checkOrigin:!0,enableInPageLinks:!1,enablePublicMethods:!1,heightCalculationMethod:"offset",interval:32,log:!1,maxHeight:1/0,maxWidth:1/0,minHeight:0,minWidth:0,resizeFrom:"parent",scrolling:!1,sizeHeight:!0,sizeWidth:!1,tolerance:0,closedCallback:function(){},initCallback:function(){},messageCallback:function(){},resizedCallback:function(){},scrollCallback:function(){return!0}};b(),a(window,"message",g),a(window,"resize",p),window.jQuery&&r(jQuery),"function"==typeof define&&define.amd?define([],q):"object"==typeof module&&"object"==typeof module.exports?module.exports=q():window.iFrameResize=q()}();;
