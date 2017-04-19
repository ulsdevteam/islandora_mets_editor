/**
 * @file
 * Javascript file for islandora_mets_editor
 * 
 */

(function ($) {

  jQuery.browser = {};
  (function () {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
  })();

  // Add the event to start off the xonomy editor init routine.
  Drupal.behaviors.yourBehaviorName = {
    attach: function (context, settings) {
      start_xonomy_editor();
    }
  };
  
})(jQuery);

function xonomy_click_passthrough(id, param) {
  var node = $("#" + id);
  var img_object_reference = findPageImageReference(node, "mets:file", "xlink:href");
  if (img_object_reference == "") {
      var fileid_reference = findPageImageReference(node, "mets:div", "FILEID");
      img_object_reference = findFileIdImageReference(fileid_reference);
  }

  if (img_object_reference) {
    var pref = preferred_datastream(img_object_reference);
    var img_path = xhrefToPath(img_object_reference);
    display_image(img_path, pref);
    display_image_size(img_path);
  }
}



function findValue(html, node2find) {
  var regExp = /badvalue\s/i;
  switch (node2find) {
    case 'xlink:href':
      regExp = /<span data-name=\"?xlink:href\" data-value=\"(.*?)\"\s/i;        
      break;
    case 'FILEID':
      regExp = /<span data-name=\"?FILEID\" data-value=\"(.*?)\"\s/i;          
      break;
  }

  var match;
  if (regExp.exec(html)) {
    match = RegExp.$1;
  }
  return match;
}

function findPageImageReference(start, finish, node2find){
  //  start = start.parent();
  var xhref = '';
  if (start.attr('data-name') === finish){
    xhref = findValue(start.html(), node2find);
  }
  start = start.parent();
  if (!xhref && start.attr('data-name') === finish){
    xhref = findValue(start.html(), node2find);
  }
  start = start.parent();
  if (!xhref && start.attr('data-name') === finish){
    xhref = findValue(start.html(), node2find);
  }
  start = start.parent();
  if (!xhref && start.attr('data-name') === finish){
    xhref = findValue(start.html(), node2find);
  }
  start = start.parent();
  if (!xhref && start.attr('data-name') === finish){
    xhref = findValue(start.html(), node2find);
  }
  start = start.parent();
  if (!xhref && start.attr('data-name') === finish){
    xhref = findValue(start.html(), node2find);
  }  
  return xhref;
}

function findFileIdImageReference(fileid_value) {
  var xhref = '';
  if (fileid_value != '') {
    var index = fileid_value.replace("fid", "");
    // Look for the adjusted element in the fid2names array
    console.log('looked up index: ' + index);
    xhref = fid2names[index];
  }
  // var path = xhrefToPath(xhref);
  return xhref;
}

function preferred_datastream(ref) {
  var pref = 'JPG';
  if (ref) {
    ref = ref.replace(".tif", "");
    ref = ref.replace(".tiff", "");
    pref = pref_ds[ref];
  }
  return pref;
}

function xhrefToPath(xhref) {
  var img_path = '';
  if (xhref) {
    var tempXhref = xhref;
    xhref = xhref.replace(".tif", "");
    xhref = xhref.replace(".tiff", "");
    if (tempXhref != xhref) {
      // console.log('NOT EQUAL: ' + tempXhref + ', ' + xhref);
      // console.log('removed ".tif" or ".tiff" from object reference: At : ' + window.location.pathname);
    }
    var path = window.location.pathname;
    path = path.replace("/islandora/object/", "");
    path = path.replace("/manage/mets_editor", "");
    // Adjusted object reference is the combination of the values with "-" between them.
    img_path = path + "-" + xhref;
  } 
  return img_path;
}
   
function display_image(img_object_reference, preferred_ds) {
    console.log(img_object_reference);
  if (img_object_reference) {
    $("#page_preview").html('<img id="theImg" src="/islandora/object/' + img_object_reference + '/datastream/' + preferred_ds + '/view" />');
  } else {
    $("#page_preview").html("");
  }
}
  
function display_image_size(img_object_reference) {
  if (!img_object_reference) {
    $("#img_size_fields").html("No page is currently selected.");
    return;
  }    

  // request the RELS-INT via an AJAX call to PHP. 
  var ref_url = window.location.protocol + "//" + window.location.host + "/islandora/object/" + img_object_reference + "/manage/mets_editor/return_imagesize";
  callPageSizeReq(ref_url);
}

function callPageSizeReq(url){
    ajax=AjaxCaller(); 
    ajax.open("GET", url, true); 
    ajax.onreadystatechange=function(){
        if(ajax.readyState==4){
            if(ajax.status==200){
                $("#img_size_fields").html(ajax.responseText);
            }
        }
    }
    ajax.send(null);
}

function AjaxCaller(){
  var xmlhttp=false;
  try{
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  }catch(e){
    try{
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }catch(E){
      xmlhttp = false;
    }
  }

  if(!xmlhttp && typeof XMLHttpRequest!='undefined'){
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}
