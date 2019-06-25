 /**
 * @file
 * Javascript file for islandora_mets_editor
 * 
 */

(function ($) {

    var tmptmp = 43.3;

    var auto_naming_value = '';
    var auto_numbering = false;

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
            jQuery("form#islandora-mets-editor-form").submit(function(e) {
                // before submitting the form to Drupal, the javascript
                // needs to generate the XML.
                update_mets_xml();
            });
            jQuery('#tree').on("keyup", function(evt) {
                if (item_index_for_keyboard < 0) {
                    return;
                }
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
                        if (isNodeAPage(json_arr.core.data[item_index_for_keyboard])) {
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
                        if (isNodeAPage(json_arr.core.data[item_index_for_keyboard])) {
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
                update_mets_xml();
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
                if (new_wide > 890) { new_wide = 890; }
                jQuery('#rs_sidebar').css("width",new_wide - 5);
                jQuery('#rs_main').css("left",new_wide - 1);
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
    var node_is_page = isNodeAPage(json_arr.core.data[item_index_for_keyboard]);
    
    if (node_is_page) {
        item_index_for_keyboard = item_index_for_keyboard + change_delta;
        var target_node_is_page = (isNodeAPage(json_arr.core.data[item_index_for_keyboard]));
        nodeId = json_arr.core.data[item_index_for_keyboard].id;
        jQuery('#tree').jstree(true).get_node(nodeId, true).children('.jstree-anchor').focus();
        if (target_node_is_page) {
            jQuery('#tree').jstree('select_node', nodeId);
            var FILEID = json_arr.core.data[item_index_for_keyboard].FILEID;
            click_page(FILEID);
            var item_seq = get_item_seq(FILEID);

            if (jQuery('#cbx_overwrite').is(":checked")) {
                // Inspect the current auto_value to preserve the positions of alpha characters.
                var numeric_part = '';
                var alpha_part_pre = '';
                var alpha_part_post = '';
                var post_start = 1;
                var all_alpha = true;
                var auto_value_as_string = auto_value.toString();
                var str_length = auto_value_as_string.length;
                for (var i = 0; i < str_length; i++) {
                    character = auto_value.charAt(i);
                    if ((character >= '0' && character <= '9')) {
                        all_alpha = false;
                    }
                }
                if (!all_alpha) {
                    if (!(parseInt(auto_value) == auto_value)) {
                        // value is NOT numeric.
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
                        jQuery('#tree').jstree('rename_node', node, new_auto_value);
                        json_arr.core.data[item_index_for_keyboard].text = new_auto_value;
                    }
                }
            }
        } // target is a PAGE
    }
}

// To check whether or not an object "obj" has a property specified by "prop".
function hasOwnProperty(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
}

// To return whether or not the current node is a "page" type of onde based on
// the presence of the icon field value = "jstree-file".
function isNodeAPage(theNode) {
    return (hasOwnProperty(theNode, 'icon') && (theNode.icon == 'jstree-file')) ? true : false;
}

// To return the string that corresponds to the two primary node types: "Page"
// OR "Section" based on the presence of the icon field value = "jstree-file"
function typeOfNode(theNode) {
    return (hasOwnProperty(theNode, 'icon') && (theNode.icon == 'jstree-file')) ? 'Page' : 'Section';
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
        this_id = use_data.node.id;
    }
    else {
        this_id = by_id;
    }
    if (this_id) {
        for(i = 0; i < json_arr.core.data.length; i++) {
            if (json_arr.core.data[i].id == this_id) {
                item_index_for_keyboard = i;
            }
        }
    }
}

function update_selected_info() {
    if (item_index_for_keyboard > -1) {
        var parent = json_arr.core.data[item_index_for_keyboard].parent;
        var id = json_arr.core.data[item_index_for_keyboard].id;
        var FILEID = json_arr.core.data[item_index_for_keyboard].FILEID;
        var node_text = json_arr.core.data[item_index_for_keyboard].text;
        var type_of_node = typeOfNode(json_arr.core.data[item_index_for_keyboard]);
        var object_PID = jQuery('#object_PID').val();
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
    var btn_rm_set_disabled_property_to = (type_of_node == 'Page') ? true : set_disabled_property_to;
    jQuery('#btn_rm').prop('disabled', btn_rm_set_disabled_property_to);
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
        node_is_page = isNodeAPage(json_arr.core.data[item_index_for_keyboard]);
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
        // When creating the node, must find the index for the placement of this
        // node within the same later of nodes that have the same parent value.
        // Set the parent of the selected nodes to the new_item.
        var index_with_id = 0;
        for (var k = 0; k < nodes.length; k++) {
            index_with_id = index_of_object_with_id(json_arr.core.data, nodes[k]);
            if (index_with_id > -1) {
                json_arr.core.data[index_with_id].parent = item_uid;
            }
        }
        var index_of_item_all_same_parents = get_index_of_item_all_same_parents(parent, first_node_id);
        var added_node = the_tree.create_node('#' + parent, new_item, index_of_item_all_same_parents, false, false);
        // Loop through the selected node ids and move them into the new added_node
        var index_of_node = -1;
        var moved_node = false;
        for (var k = 0; k < nodes.length; k++) {
            index_of_node = index_of_object_with_id(json_arr.core.data, nodes[k]);
            if (index_of_node > -1) {
//                json_arr.core.data.splice(index_of_node, 0, selected_node_of_id);
                moved_node = the_tree.move_node('#' + nodes[k], '#' + item_uid, 'last');
            }
        }
    }
    update_mets_xml();
}

function get_index_of_item_all_same_parents(parent, first_node_id) {
    var index = -1;
    var return_index = -1;
    for (i = 0; i < json_arr.core.data.length; i++) {
        if (json_arr.core.data[i].id == first_node_id) {
            return_index = index;
        }
        else {
            if ((json_arr.core.data[i].parent == parent)) {
                index++;
            }
        }
    }
    return return_index;
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
        jQuery('#tree').jstree('rename_node', node, edit_section_text);
        // Also need to set the value of this array element
        json_arr.core.data[item_index_for_keyboard].text = edit_section_text;
    }
    update_mets_xml();
}

function rm_div() {
    var item = current_item_text();
    var node = jQuery('#tree').jstree('get_selected', null);
    if (node) {
        // @TODO First, move all of the children from this section out to the parent

        jQuery('#tree').jstree(true).delete_node(node);
        // Also must remove the element from the json_arr.core.data array too
        // for item_index_for_keyboard.
        json_arr.core.data.splice(item_index_for_keyboard, 1);
    }
    update_mets_xml();
}

function auto_num() {
    var new_auto_num_value = '';
    var j = 1;
    for (i = 0; i < json_arr.core.data.length; i++) {
        if (isNodeAPage(json_arr.core.data[i])) {
            new_auto_num_value = pad_char(j, 4, "0");
            jQuery('#tree').jstree('rename_node', json_arr.core.data[i], new_auto_num_value);
            json_arr.core.data[i].text = new_auto_num_value;
            j++;
        }
    }
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

function update_mets_xml() {
    var struct_maps_array = jQuery("#tree").jstree(true).get_json('#', { 'flat': true });
    var mets_as_string = JSON.stringify(struct_maps_array);
    var mets_xml_string = make_mets_from_json_object(struct_maps_array);
    jQuery('#xmlfile').val(mets_xml_string);
}

function make_mets_from_json_object(struct_maps_array) {
    var prefix = '<mets:mets xmlns="http://www.loc.gov/METS/" xmlns:xsi="http://' +
    'www.w3.org/2001/XMLSchema-instance" xmlns:mets="http://www.loc.gov/METS/" ' +
    'xmlns:mods="http://www.loc.gov/MODS" xmlns:xlink="http://www.w3.org/1999' +
    '/xlink" xsi:schemaLocation="http://www.loc.gov' +
    '/standards/mets/mets.xsd">\n\
<mets:fileSec><mets:fileGrp USE="master">';
    var mid_point = '</mets:fileGrp></mets:fileSec><mets:structMap TYPE="mixed"><mets:div TYPE="volume">';
    var suffix = '</mets:div></mets:structMap></mets:mets>';
    var struct_maps = [];
    var mets_files = [];
    var seq = 1;
    var node_is_page = false;
    var fids_arr = [];
    for (i = 0; i < mets_fileSec_arr.data.length; i++) {
        var this_FILEID = mets_fileSec_arr.data[i].id;
        var seq_padded = _pad(seq);
        fids_arr.push(this_FILEID);
        var name = seq_padded + '.tif';
        mets_files.push('<mets:file ID="' + this_FILEID + '" MIMETYPE="image/tiff" SEQ="' + seq_padded + '"><mets:FLocat xlink:href="' + name + '" LOCTYPE="URL"/></mets:file>');
        seq++;
    }

    var section_opened = false;
    var last_parent = '';
    var current_section_id = '';
    var section_nodes = ['#'];
    var last_section_parent_index = -1;
    var this_node_section = 0;
    var j = 0;
    for (var k = 0; k < struct_maps_array.length; k++) {
        node_is_page = (isNodeAPage(struct_maps_array[k]));
        // BEFORE adding a new page node or section node, must check to see if
        // this node would have a different parent than the last -- and if so,
        // how many levels deep does this need to unwind?
        this_node_section = section_nodes.indexOf(struct_maps_array[k].parent);
        if (last_parent != '') {
            if (this_node_section != last_section_parent_index) {
                // Remove the closed section from the section_nodes array
                var index = section_nodes.indexOf(current_section_id);
                if (index > -1) {
                    for (var w = (section_nodes.length - index); w > 0; w--) {
                        section_nodes.splice(w, 1);
                        struct_maps.push("</mets:div>");
                    }
                }
                last_section_parent_index = -1;
            }
        }
        
        if (node_is_page) {
            this_FILEID = fids_arr[j];
            j++;
            struct_maps.push('<mets:div parent="' + struct_maps_array[k].parent + '" id="' + struct_maps_array[k].id + '" TYPE="page" LABEL="' + safe_xml_value(struct_maps_array[k].text) +
                '"><mets:fptr FILEID="' + this_FILEID + '"/></mets:div>');
        }
        else {
            current_section_id = struct_maps_array[k].id;
            section_nodes.push(struct_maps_array[k].id);
            struct_maps.push('<mets:div parent="' + struct_maps_array[k].parent + '" id="' + struct_maps_array[k].id + '" TYPE="section" LABEL="' + safe_xml_value(struct_maps_array[k].text) + '">');
            last_section_parent_index = section_nodes.indexOf(current_section_id); // struct_maps_array[k].id);
            section_opened = true;
        }
        last_parent = struct_maps_array[k].parent;
    }
//    if (section_opened) {
//        struct_maps.push("</mets:div>");
//    }
    for (k = 1; k < section_nodes.length; k++) {
        struct_maps.push("</mets:div>");
    }
    
    var mets_xml_string = prefix +
      mets_files.join('') +
      mid_point +
      struct_maps.join('') +
      suffix;

    return mets_xml_string;
}

function safe_xml_value(textIn) {
    textIn = textIn.replace(/"/g, "");
    // This HACK hurts so bad -- why is Javascript a bitch with the quotation
    // marks?  It automatically changes a string if that string's value is 
    // wrapped in various types of quotes.
    textIn = textIn.replace(/'/g, "")
    return textIn;
}

function _pad(n, width, z) {
    if (!width) {width = 4;}
    if (!z) { z = 0;}
    return (String(z).repeat(width) + String(n)).slice(String(n).length)
}

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
    FILEID = FILEID.replace(".tif", "");
    FILEID = FILEID.replace(".tiff", "");
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

function display_image_size_and_load_ocr(img_object_reference) {
    if (!img_object_reference) {
        return;
    }
    jQuery("#page_preview").html("");
    var base = '#islandora-openseadragon';
    // Copied from the "detach".
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
    } catch(e) {
        try{
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch(E) {
            xmlhttp = false;
        }
    }
    if(!xmlhttp && typeof XMLHttpRequest!='undefined'){
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}
