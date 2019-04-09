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
//      start_xonomy_editor();
      $('#jstree_div').jstree();
      $('#jstree_div').on("changed.jstree", function (e, data) {
          console.log(data.selected);
      });
        
      $('#rs_dragbar').mousedown(function(e){
        e.preventDefault();
        $(document).mousemove(function(e){
          var wide = $('#mets_editor_wrapper').width();
          var page_wide = $(window).width();
          var left_x = (page_wide  - wide) / 2;
          console.log(left_x);
          var new_wide = e.pageX - left_x;
          if (new_wide < 188) { new_wide = 188; }
          $('#rs_sidebar').css("width",new_wide);
          $('#treeview_editor').css("width",new_wide - 30);
          $('#rs_main').css("left",new_wide);
        })
      });
      $(document).mouseup(function(e){
        $(document).unbind('mousemove');
      });     
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
  click_page(img_object_reference);
}

function click_page(pid) {
  if (pid) {
    var pref = preferred_datastream(pid);
    console.log(pref);
    var img_path = xhrefToPath(pid);
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
  console.log("preferred_datastream(" + ref + ")");
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
    var isnum = /^\d+$/.test(xhref);
    if (isnum) {
      var path = window.location.pathname;
      path = path.replace("/islandora/object/", "");
      path = path.replace("/manage/mets_editor", "");
      // Adjusted object reference is the combination of the values with "-" between them.
      img_path = path + "-" + xhref;
    } else {
      img_path = xhref;
    }
  } 
  return img_path;
}
   
function display_image(img_object_reference, preferred_ds) {
  console.log(img_object_reference);
  if (img_object_reference) {
    // Until Djtaka can handle https requests
    var url_prefix = "http://" + window.location.host;
    //  var url_prefix = window.location.protocol + "//" + window.location.host;
    var djatoka_url = url_prefix;
    var pid = decodeURI(img_object_reference);
    pid = pid.replace("%3A", ":");
    // in local VM dev, this next line needs to be uncommented
    //    djatoka_url = djatoka_url.replace(":8000", "") + ":8080";

    // if the TN is the only avail datastream, try the djatoka viewer of the JPG datastream
    var djatoka_src = djatoka_url + "/adore-djatoka/resolver?url_ver=Z39.88-2004&rft_id=" + 
            url_prefix + "/islandora/object/" + pid + 
            "/datastream/JPG/view&svc_id=info:lanl-repo/svc/getRegion&svc_val_fmt=info:ofi/fmt:kev:mtx:jpeg2000&svc.format=image/jpeg&svc.level=2&svc.rotate=0&svc.region=0,0,1100,1100";

    $("#page_preview").html('<img id="theImg" src="' + djatoka_src + '" />');

    //  $("#page_preview").html('<img id="theImg" src="/islandora/object/' + img_object_reference + '/datastream/' + preferred_ds + '/view" />');
    console.log('djatoka_src: ' + djatoka_src);
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
