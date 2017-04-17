/**
 * @file
 * Javascript file for islandora_mets_editor
 * 
 * The PHP code uses the constants for these 0, 1:
 *       ISLANDORA_METS_EDITOR_XMLMODE = 0
 *       ISLANDORA_METS_EDITOR_BASICMODE = 1
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

      var i = $('input[name=editor_layout]:checked', '#islandora-mets-editor-form').val();
      change_layout(i);
  });
  
  function change_layout(i) {
    var mode='laic'
    if (i < 1) {
      mode='nerd';
    }
    Xonomy.setMode(mode);
  };
  
})(jQuery);

function xonomy_click_passthrough(id, param) {
  var node = $("#" + id);
  var img_reference = findPageImageReference(node, "mets:file");

  if (img_reference) {
    $("#page_preview").html('<img id="theImg" src="/islandora/object/' + img_reference + '/datastream/JPG/view" />');
  } else {
    $("#page_preview").html();
  }
  
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
  } else {
    alert(node_div.html());
  }

  return Xonomy.click(id, param);
}

function findXrefValue(html) {
  // <span data-name="xlink:href" data-value="pitt:31735051653552-0006" id="xonomy46" class="attribute">    
  var xlinkHrefRegExp = /<span data-name=\"?xlink:href\" data-value=\"(.*?)\"\s/i;
//   /meta\sproperty\=\"og\:title\"\scontent\=\"([A-Za-z0-9 _]*)\"/
  var matches = [];
  if (xlinkHrefRegExp.exec(html)) {
    matches.push(RegExp.$1);
  }
  console.log(matches);
  
  return matches;
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
  return xhref;  
}
