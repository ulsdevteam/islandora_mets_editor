 /**
 * @file
 * Javascript file for islandora_mets_editor
 * 
 */

(function ($) {

  var auto_naming_value = '';

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
          var nodeId = json_arr.core.data[item_index_for_keyboard].id;
          auto_naming_value= json_arr.core.data[item_index_for_keyboard].text;
          // Up
          if (charCode == 38) {
              keypress_text = 'Up';
              if (item_index_for_keyboard > 0) {
                  // Unselect the current node.
                  jQuery('#tree').jstree('deselect_node', nodeId);
                  if (hasOwnProperty(json_arr.core.data[item_index_for_keyboard], 'icon')) {
                      change_auto_naming_value(-1, auto_naming_value);
                  }
              }
          }
          // Down
          if (charCode == 40) {
              keypress_text = 'Down';
              if (item_index_for_keyboard < json_arr.core.data.length) {
                  // Unselect the current node.
                  jQuery('#tree').jstree('deselect_node', nodeId);
                  if (hasOwnProperty(json_arr.core.data[item_index_for_keyboard], 'icon')) {
                      change_auto_naming_value(1, auto_naming_value);
                  }
              }
          }
          // Insert
          if (charCode == 45) {
              add_div();
          }

          // Rename
          if (charCode == 113) {
              edit_div();
          }
          do_recalc_item_index_for_keyboard(false);
      });

      jQuery('#tree').on("changed.jstree", function (event, selected) {
          do_recalc_item_index_for_keyboard(selected, '');
          update_selected_info();
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

function change_auto_naming_value(change_delta, auto_value) {
    item_index_for_keyboard = item_index_for_keyboard + change_delta;
    var FILEID = json_arr.core.data[item_index_for_keyboard].FILEID;
    var item_seq = get_item_seq(FILEID);
    nodeId = json_arr.core.data[item_index_for_keyboard].id;
    jQuery('#tree').jstree('select_node', nodeId);

    if (jQuery('#cbx_overwrite').is(":checked")) {
        // Inspect the current auto_value to preserve the positions of alpha characters.
        var numeric_part = '';
        var alpha_part_pre = '';
        var alpha_part_post = '';
        var post_start = 1;
        if (!(parseInt(auto_value) == auto_value)) {
            // value is NOT numeric.
            var auto_value_as_string = auto_value.toString();
            var str_length = auto_value_as_string.length;
            var character = '';
            for (var i = 0; i < str_length; i++) {
                character = auto_value.charAt(i);
                if ((character >= '0' && character <= '9')) {
                    numeric_part += character;
                    // jump out of the prefix loop.
                    post_start = i;
                }
                else {
                    if (numeric_part !== '') {
                        i = str_length + 1;
                    }
                    else {
                        alpha_part_pre += character;
                    }
                }
            }

            for (var j = (post_start + 1); j < str_length; j++) {
                character = auto_value.charAt(j);
                if ((character >= '0' && character <= '9')) {
                    numeric_part += character;
                }
                else {
                    alpha_part_post += character;
                }
            }
        }
        else {
            // value IS numeric.
            numeric_part = auto_value;
        }
        // Add an empty string to the end of numeric_part so that it is treated as a string for the length calculation.
        if (isNaN(numeric_part)) {
            numeric_part = 0;
        }
        var numeric_character_count = numeric_part.length;
        numeric_part = pad_char(parseInt(numeric_part) + change_delta, numeric_character_count, "0");

        var new_auto_value = alpha_part_pre + numeric_part + alpha_part_post;
        if (new_auto_value !== item_seq) {
            var node = jQuery('#tree').jstree('get_selected', null);
            jQuery('#tree').jstree('rename_node', node , new_auto_value);
            json_arr.core.data[item_index_for_keyboard].text = new_auto_value;
        }
    }
}

// To check whether or not an object "obj" has a property specified by "prop".
function hasOwnProperty(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
}

// Simple helper function to left-pad "num" a numeric string with the character
// "char" up until a total string length of "size".
function pad_char(num, size, char) {
    var s = num + "";
    while (s.length < size) s = char + s;
    return s;
}

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
}

function update_selected_info() {
  if (item_index_for_keyboard > -1) {
    var parent = json_arr.core.data[item_index_for_keyboard].parent;
    var id = json_arr.core.data[item_index_for_keyboard].id;
    var FILEID = json_arr.core.data[item_index_for_keyboard].FILEID;
    var node_text = json_arr.core.data[item_index_for_keyboard].text;
    var type_of_node = (hasOwnProperty(json_arr.core.data[item_index_for_keyboard], 'icon')) ? 'Page' : 'Section';
    var object_PID = jQuery('#object_PID').val();
    var test = json_arr.core.data[item_index_for_keyboard];
    // Get this item's corresponding SEQ from the mets_fileSec_arr.
    var item_seq = get_item_seq(FILEID);
    if (FILEID) {
        click_page(FILEID);
    }
    jQuery('#btn_edit').html('Edit ' + type_of_node);
    jQuery('#keypress_result').html('<b><i>' + type_of_node + ' </i> "' +
      node_text + '"</b><br />' +
      'Id =  ' + id + '<br />' +
      'Parent = ' + parent);
  }
  // Check the enabled state of the "DIV" buttons - and possibly enable them.
  var set_disabled_property_to = (item_index_for_keyboard > -1) ? false: true;
  var different_parents = do_selected_items_have_different_parents();
  jQuery('#btn_add').prop('disabled', (different_parents || set_disabled_property_to));
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

function do_selected_items_have_different_parents() {
    var selectedNodes = jQuery('#tree').jstree(true).get_selected(true);
    var ids = [],
      parents = [];
    var node_is_page = '';
    for(var i = 0, j = selectedNodes.length; i < j; i++) {
      node_is_page = (hasOwnProperty(json_arr.core.data[item_index_for_keyboard], 'icon')) ? true : false;
      ids.push(selectedNodes[i].id);
      if (node_is_page) {

      }
      if (!(parents.includes(selectedNodes[i].parent))) {
          parents.push(selectedNodes[i].parent);
      }
    }
    return (parents.length != 1);
}

function add_div() {
    var new_section_text = prompt("Enter new value for section ", "New Section");
    if (new_section_text != null) {
        var selectedNodes = jQuery('#tree').jstree(true).get_selected(true);
        var ids = [];
        for(var i = 0, j = selectedNodes.length; i < j; i++) {
            ids.push(selectedNodes[i].id);
        }
        // Get the selected items -- and add the section right above the first
        // selected item -- and put all of the selected items into the new section.
        var the_tree = jQuery('#tree').jstree(true);
        var nodes = jQuery('#tree').jstree('get_selected', null);
        var first_node_id = get_first_id(nodes);
        var parent_node = jQuery('#tree').jstree(true).get_parent(first_node_id);
        var parent = (parent_node) ? parent_node : "#";
        var item_uid = unique_DOM_id('idp166224784');
        var new_item = {"id" : item_uid, "parent": parent, "state": {"opened":true}, "text" : new_section_text}; 
        // Pick the previous item index so that the new node appears ABOVE
        // the first selected element.
        var index_of_selected_node = index_of_object_with_id(json_arr.core.data, first_node_id);
        // Place the new data into the data array at the correct location.
        json_arr.core.data.splice(index_of_selected_node, 0, new_item);
        var added_node = the_tree.create_node('#' + parent, new_item, 'first', false, false);

        // Loop through the selected node ids and move them into the new added_node
        var selected_node_of_id = '';
        var index_of_node = -1;
        var moved_node = false;
        for (i = 0; i < ids.length; i++) {
            id_of_node = ids[i];
            index_of_node = index_of_object_with_id(json_arr.core.data, ids[i]);
            if (index_of_node > -1) {
//                json_arr.core.data.splice(index_of_node, 0, selected_node_of_id);
                moved_node = the_tree.move_node('#' + id_of_node, '#' + added_node, 'last');
            }
        }
    }
}

function index_of_object_with_id(object_array, find_id) {
    var index = -1;
    for (i = 0; i < object_array.length; i++) {
        if (object_array[i].id == find_id) {
            index = i;
        }
    }
    return index;
}

function get_object_with_id(object_array, find_id) {
    var the_object = '';
    for (i = 0; i < object_array.length; i++) {
        if (object_array[i].id == find_id) {
            the_object = object_array[i];
        }
    }
    return the_object;
}

function get_first_id(node_id_raw) {
    var id = node_id_raw;
    if (Array.isArray(node_id_raw)) {
        id = node_id_raw[0];
    }
    return id;
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
      // First, move all of the children from this section out to the parent

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
  p = (typeof p === "string") ? p : ""; // if p is a string it can be used as the prefix, otherwise p is set to the empty string
  do {
      i = p + c++; // the id is set to the prefix joined with the incremented counter
  } while (document.getElementById(i) !== null); // if an element has been found with this ID we must loop again, incrementing the counter until a unique ID is created
  return i; // return the id string
}

function harvest() {
  var struct_maps_array = jQuery("#tree").jstree(true).get_json('#', { 'flat': true });
  var mets_as_string = JSON.stringify(struct_maps_array);
  var mets_xml_string = make_mets_from_json_object(struct_maps_array);
  jQuery('#xmlfile').val(mets_xml_string);
  jQuery('#xmlfile').css("display",'block');
}

function make_mets_from_json_object(struct_maps_array) {
    var prefix = "<mets xmlns='http://www.loc.gov/METS/' xmlns:xsi='http://" +
    "www.w3.org/2001/XMLSchema-instance' xmlns:mets='http://www.loc.gov/METS/'" +
    "xmlns:mods='http://www.loc.gov/MODS' xmlns:xlink='http://www.w3.org/1999" +
    "/xlink' xsi:schemaLocation='http://www.loc.gov/METS/ http://www.loc.gov" +
    "/standards/mets/mets.xsd'>\n\
<mets:fileSec><mets:fileGrp USE='master'>";
    var mid_point = "</mets:fileGrp></mets:fileSec><mets:structMap TYPE='mixed'><mets:div TYPE='volume'>";
    var suffix = "</mets:div></mets:structMap></mets>";
    var struct_maps = [];
    var mets_files = [];
    var seq = 1;
    var node_is_page = false;
    var fids_arr = [];
    for (i = 0; i < mets_fileSec_arr.data.length; i++) {
        var this_FILEID = mets_fileSec_arr.data[i].id;
        var seq_padded = pad(seq);
        fids_arr.push(this_FILEID);
        var name = seq_padded + '.tif';
        mets_files.push("<mets:file ID='" + this_FILEID + "' MIMETYPE='image/tiff' SEQ='" + seq_padded + "'><mets:FLocat xlink:href='" + name + "' LOCTYPE='URL'/></mets:file>");
        seq++;
    }
    var section_opened = false;
    var last_parent = '';
    var node_type = '';
    for (i = 0; i < struct_maps_array.length; i++) {
        node_is_page = (hasOwnProperty(struct_maps_array[i], 'icon') && (struct_maps_array[i].icon == 'jstree-file')) ? true : false;
        node_type = (hasOwnProperty(struct_maps_array[i], 'icon') && (struct_maps_array[i].icon == 'jstree-file')) ? "page" : "section";
        if (node_is_page) {
            this_FILEID = fids_arr[i];
            struct_maps.push("<mets:div parent='" + struct_maps_array[i].parent + "' id='" + struct_maps_array[i].id + "' TYPE='page' LABEL='" + struct_maps_array[i].text +
                "'><mets:fptr FILEID='" + this_FILEID + "'/></mets:div>");
            if ((last_parent != struct_maps_array[i].parent) && (last_parent != '')) {
                struct_maps.push("</mets:div>");
                section_opened = false;
            }
            last_parent = struct_maps_array[i].parent;
        }
        else {
            if ((last_parent != struct_maps_array[i].parent) && (last_parent != '')) {
                struct_maps.push("</mets:div>");
                section_opened = false;
            }
            struct_maps.push("<mets:div parent='" + struct_maps_array[i].parent + "' id='" + struct_maps_array[i].id + "' TYPE='section' LABEL='" + struct_maps_array[i].text + "'>");
            last_parent = struct_maps_array[i].id;
            section_opened = true;
        }
    }
    if (section_opened) {
        struct_maps.push("</mets:div>");
    }

    var mets_xml_string = prefix +
      mets_files.join('\n\
') +
      mid_point +
      struct_maps.join('\n\
') +
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
    return;
  }
  jQuery("#page_preview").html("");
  var base = '#islandora-openseadragon';
  // Copied from the "detach" 
  jQuery(base).removeClass('islandoraOpenSeadragonViewer-processed');
  jQuery(base).removeData();
  jQuery(base).off();
  delete Drupal.IslandoraOpenSeadragonViewer[base];

  jQuery("#page_ocr_ro").val("");

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
        if(ajax.readyState == 4){
            if(ajax.status == 200){
                var json_results = ajax.responseText;
                var json_obj = JSON.parse(json_results);
                var settings = ("settings" in json_obj) ? json_obj['settings'] : "";
                var page_preview_html = ("page_preview" in json_obj) ? json_obj['page_preview'] : "";
                jQuery("#page_preview").html(page_preview_html);

                var page_ocr_html = ("page_ocr" in json_obj) ? json_obj['page_ocr'] : "";
                // set the page_ocr
                jQuery("#page_ocr_ro").val(page_ocr_html);
                do_openseadragon_attach(settings);
            }
            else {
                jQuery("#page_preview").html('for "' + url + '", ajax.status = ' + ajax.status + ', ajax.readyState = "' + ajax.readyState + '"');
                jQuery("#page_ocr_ro").val('for "' + url + '", ajax.status = ' + ajax.status + ', ajax.readyState = "' + ajax.readyState + '"');
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
