<?php
/**
        * @file
        * struct-json-markup display template.
        *
        * - $json_array --
        * - $file_array
        */
?>
/**
 * @file
 * Javascript file for islandora_mets_editor
 *
 */
// Global variable
var json_arr = '';
var mets_fileSec_arr = '';
var item_index_for_keyboard = -1;
var keypress_text = '';

window.onload = setup_tree;

function setup_tree() {
  mets_fileSec_arr = {"data" : [<?php print $file_array; ?>]};
  json_arr = {"core" : {
    "check_callback": true,
    "data" : [<?php print $json_array; ?>]},
    "crrm" : {
      "move" : {
        "check_move" : function (m) {
          if ((m.p == "before") || (m.p == "after")) {
            return false;
          }
          return (m.o.attr('movable'));
        }
      }
    },

    "dnd" : {
      "drop_finish" : function (data) {
        alert('drop finish');
      },

      "drag_check" : function (data) {
        if (data.r.attr("id") == "phtml_1") {
          return false;
        }
        return {
          after : false,
          before : false,
          inside : false
        };
      },


      "drag_finish" : function (data) {
        alert("DRAG OK");
      }
    },
    "plugins" : [ "themes", "dnd", "crrm" ]
  };
  jQuery('#tree').jstree(json_arr);
  //  jQuery('#tree').bind('move_node.jstree',function(event,data){console.log(event);console.log(data);});
}
