/**
 * @file
 * Javascript file for islandora_mets_editor
 * 
 * The PHP code uses the constants for these 0, 1, 2:
 *       ISLANDORA_METS_EDITOR_SIMPLE = 0
 *       ISLANDORA_METS_EDITOR_BIG = 1
 *       ISLANDORA_METS_EDITOR_SMALL = 2
 * 
 */

(function ($) {

    // Add the event to start off the xonomy editor init routine.
    Drupal.behaviors.yourBehaviorName = {
      attach: function (context, settings) {
        start_xonomy_editor();
      }
    };

    $(document).ready(function() {
        $('#edit-editor-layout-0').change(function() {
            change_layout(0);
        });
        $('#edit-editor-layout-1').change(function() {
            change_layout(1);
        });
        $('#edit-editor-layout-2').change(function() {
            change_layout(2);
        });

        var i = $('input[name=editor_layout]:checked', '#islandora-mets-editor-form').val();
        change_layout(i);
    });
  
    function change_layout(i) {
        alert('layout ' + i);
        if (i < 1) {
            $('.form-item-solr-query').show();
            $('.form-item-list-of-pids').hide();
            $('.form-item-collection').hide();
            $('.form-item-model').hide();
        }
        if (i == 1) {
            $('.form-item-solr-query').hide();
            $('.form-item-list-of-pids').show();
            $('.form-item-collection').hide();
            $('.form-item-model').hide();
        }
        if (i == 2) {
            $('.form-item-solr-query').hide();
            $('.form-item-list-of-pids').hide();
            $('.form-item-collection').show();
            $('.form-item-model').hide();
        }
        if (i == 3) {
            $('.form-item-solr-query').hide();
            $('.form-item-list-of-pids').hide();
            $('.form-item-collection').hide();
            $('.form-item-model').show();
        }
    };
  
})(jQuery);

function xonomy_click_passthrough(id, param) {
    alert(id);
    return Xonomy.click(id, param);
}
