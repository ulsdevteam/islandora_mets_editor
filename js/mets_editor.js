/**
 * @file
 * Javascript file for islandora_mets_editor
 * 
 */

(function ($) {

  // Add the event to start off the xonomy editor init routine.
  Drupal.behaviors.yourBehaviorName = {
    attach: function (context, settings) {
      start_xonomy_editor();
    }
  };
  
})(jQuery);

function xonomy_click_passthrough(id, param) {
  var node = $("#" + id);
  var img_object_reference = findPageImageReference(node, "mets:file");
  console.log(img_object_reference);

  display_image(img_object_reference);
  display_image_size(img_object_reference);
  
  var node_div = node.children(' .children');
  if (isNaN(node_div)) {
    // Check parent element for the children children node...
    node_div = node.closest('div')
    if (isNaN(node_div)) {
      // parent has no children
    } else {
      // no children, but parent had children
      // node_div.html()
    }
  }
}

function findXrefValue(html) {
  var xlinkHrefRegExp = /<span data-name=\"?xlink:href\" data-value=\"(.*?)\"\s/i;

  var match;
  if (xlinkHrefRegExp.exec(html)) {
    match = RegExp.$1;
  }
  
  return match;
}

function findPageImageReference(start, finish){
  start = start.parent();
  var xhref = '';
  if (start.attr('data-name') === finish){
    xhref = findXrefValue(start.html());
  }
  start = start.parent();
  if (start.attr('data-name') === finish){
    xhref = findXrefValue(start.html());
  }
  start = start.parent();
  if (start.attr('data-name') === finish){
    xhref = findXrefValue(start.html());
  }
  start = start.parent();
  if (start.attr('data-name') === finish){
    xhref = findXrefValue(start.html());
  }
  start = start.parent();
  if (start.attr('data-name') === finish){
    xhref = findXrefValue(start.html());
  }
  console.log('xhref = ' + xhref);
  var tempXhref = xhref;
  xhref = xhref.replace(".tif", "");
  xhref = xhref.replace(".tiff", "");
  if (tempXhref != xhref) {
    var path = window.location.pathname;
    path = path.replace("/islandora/object/", "");
    path = path.replace("/manage/mets_editor", "");
    console.log('removed ".tif" or ".tiff" from object reference: At : ' + window.location.pathname);
    // Adjusted object reference is the combination of the values with "-" between them.
    xhref = path + "-" + xhref;
  }
  
  return xhref;  
}

function display_image(img_object_reference) {
  if (img_object_reference) {
    $("#page_preview").html('<img id="theImg" src="/islandora/object/' + img_object_reference + '/datastream/JPG/view" />');
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
