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

  Drupal.behaviors.yourBehaviorName = {
    attach: function (context, settings) {
      jQuery('#tree').on("keyup", function(evt) {
          evt = evt || window.event;
          var charCode = evt.keyCode || evt.which;
          var charStr = String.fromCharCode(charCode);
          keypress_text = '';
          if (charCode == 38) {
            keypress_text = 'Up';
            if (item_index_for_keyboard > 0) {
              item_index_for_keyboard--;
            }
          }
          if (charCode == 40) {
            keypress_text = 'Down';
            if (item_index_for_keyboard < json_arr.core.data.length) {
              item_index_for_keyboard++;
            }
          }
          do_recalc_item_index_for_keyboard(false);
          if (keypress_text) {
            update_selected_info(keypress_text);
          }
      });

      jQuery('#tree').on("changed.jstree", function (event, selected) {
          do_recalc_item_index_for_keyboard(selected, '');
          update_selected_info("");
      });

      jQuery('#rs_dragbar').mousedown(function(e){
        e.preventDefault();
        jQuery('#rs_dragbar').addClass("dragging");
        jQuery(document).mousemove(function(e){
          var wide = jQuery('#mets_editor_wrapper').width();
          var page_wide = jQuery(window).width();
          var left_x = (page_wide  - wide) / 2;
          var new_wide = e.pageX - left_x;
          if (new_wide < 200) { new_wide = 200; }
          if (new_wide > 650) { new_wide = 650; }
          jQuery('#rs_sidebar').css("width",new_wide - 5);
          jQuery('#rs_main').css("left",new_wide - 2);
        })
      });
      jQuery(document).mouseup(function(e){
        jQuery('#rs_dragbar').removeClass("dragging");
        jQuery(document).unbind('mousemove');
      });
    }
  };
})(jQuery);

function do_recalc_item_index_for_keyboard(use_data, by_id) {
    var i, j, r = [];
    var this_id = '';
    if (use_data) {
        for(i = 0, j = use_data.selected.length; i < j; i++) {
          r.push(use_data.instance.get_node(use_data.selected[i]).text);
          this_id = use_data.selected[i];
        }
    }
    else {
        this_id = by_id;
    }
    for(i = 0; i < json_arr.core.data.length; i++) {
      if (json_arr.core.data[i].id == this_id) {
        item_index_for_keyboard = i;
      }
    }
    jQuery('#event_result').html('Selected: ' + r.join(', '));
}

function update_selected_info(keypress_text) {
  if (item_index_for_keyboard > -1) {
    var parent = json_arr.core.data[item_index_for_keyboard].parent;
    var id = json_arr.core.data[item_index_for_keyboard].id;
    var FILEID = json_arr.core.data[item_index_for_keyboard].FILEID;
    var node_text = json_arr.core.data[item_index_for_keyboard].text;
    var object_PID = jQuery('#object_PID').val();
    var test = json_arr.core.data[item_index_for_keyboard];
    // Get this item's corresponding SEQ from the mets_fileSec_arr.
    var item_seq = get_item_seq(FILEID);
    if (FILEID) {
        click_page(FILEID); //object_PID + "-" + item_seq);
        var FLocatHref = get_file_href(FILEID);
        var markup_with_FILEID = '<b>' + keypress_text + '</b><br />id = ' + id +
          ', parent = ' + parent + '<br /><b>Label: </b><i>' + node_text + '</i><hr />' +
          '<span class="fileid">FILEID: ' + FILEID + '</span> (' +
          FLocatHref + ')';
        jQuery('#keypress_result').html(markup_with_FILEID);
    }
    else {
        var markup_no_FILEID = '<b>' + keypress_text + '</b><br />id = ' + id +
          ', parent = ' + parent + '<br /><b>Label: </b><i>' + node_text + '</i><hr />' +
          '<span class="fileid">FILEID: </span> n/a';
        jQuery('#keypress_result').html(markup_no_FILEID);
    }
  }
  // Check the enabled state of the "DIV" buttons - and possibly enable them.
  var set_disabled_property_to = (item_index_for_keyboard > -1) ? false: true;
  jQuery('#btn_add').prop('disabled', set_disabled_property_to);
  jQuery('#btn_edit').prop('disabled', set_disabled_property_to);
  jQuery('#btn_rm').prop('disabled', set_disabled_property_to);
}

function get_item_seq(FILEID) {
  var retval = '';
  for (i = 0; i < mets_fileSec_arr.data.length; i++) {
    if (retval == '') {
      if (mets_fileSec_arr.data[i].id == FILEID) {
        retval = mets_fileSec_arr.data[i].SEQ;
      }
    }
  }
  return retval;
}

function get_file_href(FILEID) {
  var retval = '';
  for (i = 0; i < mets_fileSec_arr.data.length; i++) {
    if (retval == '') {
      if (mets_fileSec_arr.data[i].id == FILEID) {
        retval = mets_fileSec_arr.data[i].FLocatHref;
      }
    }
  }
  return retval;
}

function current_item_text() {
  return {"item_text" : json_arr.core.data[item_index_for_keyboard].text,
    "parent" : json_arr.core.data[item_index_for_keyboard].parent,
    "id" : json_arr.core.data[item_index_for_keyboard].id};
}

function add_div() {
  var item = current_item_text();

  var x = jQuery('#tree').jstree(true);
  var new_section_text = prompt("Enter new value for section ", "New Section");
  if (new_section_text != null) {
    var node = jQuery('#tree').jstree('get_selected', null);
    var parent_node = jQuery('#tree').jstree(true).get_parent(node);
    var parent = (parent_node) ? parent_node : "#";
    var item_uid = unique_DOM_id('idp166224784');
    var new_item = {"id": item_uid, "parent": parent, "text": new_section_text };
    json_arr.core.data.push(new_item);
    var added_node = x.create_node(parent, new_item, 'last', false, false);
  }
}

function edit_div() {
  var item = current_item_text();
  var node = jQuery('#tree').jstree('get_selected', null);

  var edit_section_text = prompt("Enter new value for section at position " + item_index_for_keyboard, item.item_text);
  if (edit_section_text != null) {
    jQuery('#tree').jstree('rename_node', node , edit_section_text);
    // Also need to set the value of this array element
    json_arr.core.data[item_index_for_keyboard].text = edit_section_text;
  }
}

function rm_div() {
  var item = current_item_text();
  var node = jQuery('#tree').jstree('get_selected', null);
  if (node) {
      jQuery('#tree').jstree(true).delete_node(node);
      // Also must remove the element from the json_arr.core.data array too
      // for item_index_for_keyboard.
      json_arr.core.data.splice(item_index_for_keyboard, 1);
  }
}

function auto_num() {
  alert("In auto_num()");
}

function unique_DOM_id (
    p // an optional prefix for the id
) {
  var c = 0, // c is the counter to add as a unique suffix to the end of the optional prefix string
  i; // i is the unique id string
  p = (typeof p==="string")?p:""; // if p is a string it can be used as the prefix, otherwise p is set to the empty string
  do {
      i = p + c++; // the id is set to the prefix joined with the incremented counter
  } while (document.getElementById(i)!==null); // if an element has been found with this ID we must loop again, incrementing the counter until a unique ID is created
  return i; // return the id string
}

function harvest() {
  var mets_json_object = jQuery("#tree").jstree(true).get_json('#', { 'flat': true });
  var mets_as_string = JSON.stringify(mets_json_object);
  var mets_xml_string = make_mets_from_json_object();
  jQuery('#json_mets').val(mets_as_string);
}

function make_mets_from_json_object(mets_json_object) {
  var prefix = "<mets xmlns='http://www.loc.gov/METS/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' " + 
      "xmlns:mets='http://www.loc.gov/METS/' xmlns:mods='http://www.loc.gov/MODS' " + 
      "xmlns:xlink='http://www.w3.org/1999/xlink' xsi:schemaLocation='http://www.loc.gov/METS/ " +
      "http://www.loc.gov/standards/mets/mets.xsd'>\n\
<mets:fileSec><mets:fileGrp USE='master'>";
  var mid_point = "</mets:fileGrp></mets:fileSec><mets:structMap TYPE='mixed'><mets:div TYPE='volume'>";
  var suffix = "</mets:div></mets:structMap></mets>";  
  
  var struct_maps = [];
  var mets_files = [];
  var seq = 1;
  for (i = 0; i < mets_fileSec_arr.data.length; i++) {
    var this_FILEID = mets_fileSec_arr.data[i].id;
    var seq_padded = pad(seq);
//      $name = (is_object($page_obj) && (get_class($page_obj) == 'IslandoraFedoraObject')) ? $page_obj->label : $page['label'];
    var name = seq_padded + '.tif';
    mets_files.push("<mets:file ID='" + this_FILEID + "' MIMETYPE='image/tiff' SEQ='" + seq_padded + "'><mets:FLocat xlink:href='" + name + "' LOCTYPE='URL'/></mets:file>");
    struct_maps.push("<mets:div TYPE='page' LABEL='" + seq_padded +
        "'><mets:fptr FILEID='fid" + this_FILEID + "'/></mets:div>");
    seq++;
  }

  var mets_xml_string = prefix +
    mets_files.join('') + 
    mid_point +
    struct_maps.join('') + 
    suffix;
        
  return mets_xml_string;
}

function pad(n, width, z) {if (!width) {width = 4;} if (!z) { z = 0;} return (String(z).repeat(width) + String(n)).slice(String(n).length)} 

/*
 * ========================================================================================
 *
 */
function click_page(FILEID) {
  if (FILEID) {
    var fr = get_file_href(FILEID);
    var pref = preferred_datastream(fr);
    var img_path = xhrefToPath(fr);
    // display_image(img_path, pref);
    display_image_size_and_load_ocr(img_path);
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
    xhref = fid2names[index];
  }
  // var path = xhrefToPath(xhref);
  return xhref;
}

function preferred_datastream(FILEID) {
  var pref = 'JPG';
  if (FILEID) {
    FILEID = FILEID.replace(".tif", "");
    FILEID = FILEID.replace(".tiff", "");
    pref = pref_ds[FILEID];
  }
  return pref;
}

function xhrefToPath(FILEID) {
  var img_path = '';
  if (FILEID) {
    var tempXhref = FILEID;
    FILEID = FILEID.replace(".tif", "");
    FILEID = FILEID.replace(".tiff", "");
    if (tempXhref != FILEID) {
      // console.log('NOT EQUAL: ' + tempXhref + ', ' + xhref);
    }
    var isnum = /^\d+$/.test(FILEID);
    if (isnum) {
      var path = window.location.pathname;
      path = path.replace("/islandora/object/", "");
      path = path.replace("/manage/mets_editor", "");
      // Adjusted object reference is the combination of the values with "-" between them.
      img_path = path + "-" + FILEID;
    } else {
      img_path = FILEID;
    }
  }
  return img_path;
}

//function display_image(img_object_reference, preferred_ds) {
//  console.log("display_image (" + img_object_reference + ")");
//  if (img_object_reference) {
//    // Until Djtaka can handle https requests
//    var url_prefix = "http://" + window.location.host;
//    //  var url_prefix = window.location.protocol + "//" + window.location.host;
//    var djatoka_url = url_prefix;
//    var pid = decodeURI(img_object_reference);
//    pid = pid.replace("%3A", ":");
//    // in local VM dev, this next line needs to be uncommented
//    //    djatoka_url = djatoka_url.replace(":8000", "") + ":8080";
//
//    // if the TN is the only avail datastream, try the djatoka viewer of the JPG datastream
//    var djatoka_src = djatoka_url + "/adore-djatoka/resolver?url_ver=Z39.88-2004&rft_id=" +
//            url_prefix + "/islandora/object/" + pid +
//            "/datastream/JPG/view&svc_id=info:lanl-repo/svc/getRegion&svc_val_fmt=info:ofi/fmt:kev:mtx:jpeg2000&svc.format=image/jpeg&svc.level=4&svc.rotate=0&svc.region=0,0,1100,1100";
//
//    jQuery("#page_preview").html('<img id="theImg" src="' + djatoka_src + '" />');
//
//    //  jQuery("#page_preview").html('<img id="theImg" src="/islandora/object/' + img_object_reference + '/datastream/' + preferred_ds + '/view" />');
//    console.log('djatoka_src: ' + djatoka_src);
//  } else {
//    jQuery("#page_preview").html("");
//  }
//}

function display_image_size_and_load_ocr(img_object_reference) {
  if (!img_object_reference) {
    jQuery("#img_size_fields").html("No page is currently selected.");
    return;
  }
  jQuery("#page_preview").html("");
  var base = '#islandora-openseadragon';
  // Copied from the "detach" 
  jQuery(base).removeClass('islandoraOpenSeadragonViewer-processed');
  jQuery(base).removeData();
  jQuery(base).off();
  delete Drupal.IslandoraOpenSeadragonViewer[base];

  jQuery("#page_ocr").html("");

  // request the RELS-INT and OCR via an AJAX call to PHP.
  var ref_url = window.location.protocol + "//" + window.location.host + "/islandora/object/" + img_object_reference + "/mets_editor_get_imagesize_ocr";
  callAJAXreq(ref_url, false);
  
}

function do_openseadragon_attach(settings) {
  // Use custom element #id if set.
  var base = '#islandora-openseadragon';
  if (Drupal.IslandoraOpenSeadragonViewer[base] === undefined) {
    jQuery(base, document).once('islandoraOpenSeadragonViewer', function () {
      Drupal.IslandoraOpenSeadragonViewer[base] = new Drupal.IslandoraOpenSeadragonViewer(base, settings);
    });
  }                
}

function callAJAXreq(url){
    ajax=AjaxCaller();
    ajax.open("GET", url, true);
    ajax.onreadystatechange=function(){
        if(ajax.readyState==4){
            if(ajax.status==200){
                var json_results = ajax.responseText;
                var json_obj = JSON.parse(json_results);
                var img_size_fields_html = ("size_info" in json_obj && "width_str" in json_obj["size_info"]) ? 
                  "Width: " + json_obj['size_info']['width_str'] + " px, Height: " + json_obj['size_info']['height_str'] + " px" : "";
                var settings = ("settings" in json_obj) ? json_obj['settings'] : "";
                var page_preview_html = ("page_preview" in json_obj) ? json_obj['page_preview'] : "";
                jQuery("#page_preview").html(page_preview_html);

                var page_ocr_html = ("page_ocr" in json_obj) ? json_obj['page_ocr'] : "";
                // set the img_size_fields
                jQuery("#img_size_fields").html(img_size_fields_html);
                // set the page_ocr
                jQuery("#page_ocr").html(page_ocr_html);
                do_openseadragon_attach(settings);
            }
            else {
                jQuery("#page_preview").html('for "' + url + '", ajax.status = ' + ajax.status + ', ajax.readyState = "' + ajax.readyState + '"');
                jQuery("#page_ocr").html('for "' + url + '", ajax.status = ' + ajax.status + ', ajax.readyState = "' + ajax.readyState + '"');
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
