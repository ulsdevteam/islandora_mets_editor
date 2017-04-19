<?php

function islandora_mets_editor_preprocess_islandora_mets_editor_editor_markup(&$variables) {
  $islandora_object = (isset($variables['islandora_object'])) ? $variables['islandora_object'] : NULL;
  if (is_object($islandora_object)) {
    module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
    module_load_include('inc', 'islandora_mets_editor', 'includes/utilities');
    $path = drupal_get_path('module', 'islandora_mets_editor');
    drupal_add_js($path . '/js/mets_editor.js');
    drupal_add_js($path . '/js/jquery-noconflict.js');
    drupal_add_js('misc/jquery-3.1.1.min.js');
    drupal_add_js('sites/all/libraries/xonomy/xonomy.js');
    drupal_add_css('sites/all/libraries/xonomy/xonomy.css');

    $xml = islandora_mets_editor_generate_METS_xml($islandora_object);
    $docSpec = islandora_mets_editor_docSpec();
    $var = islandora_mets_editor_generate_variables_json($islandora_object);
    $fids2names = $var['fid2names'];
    $pref_ds = $var['pref_ds'];
    drupal_add_js(islandora_mets_editor_xonomy_editor_javascript_call_script($xml, $docSpec, $fids2names, $pref_ds, 'xonomy_editor'), 'inline');
    drupal_add_css($path . '/css/mets_editor.css');

    // If the object model is a paged Content model, and there are pages contained within the object's
    $is_paged_object = (!(array_search('islandora:bookCModel', $islandora_object->models) === FALSE) ||
      !(array_search('islandora:newspaperIssueCModel', $islandora_object->models) === FALSE) ||
      !(array_search('islandora:manuscriptCModel', $islandora_object->models) === FALSE) );

    $pages = ($is_paged_object) ? islandora_paged_content_get_pages($islandora_object) : array();
    //    $pages = ($is_paged_object) ? islandora_paged_content_get_pages_ri($islandora_object) : array();

    //TODO: pad the values for the $pages[]['page'] values with 0 ... but then sort by that key

    if ($is_paged_object && (count($pages) < 1)) {
      drupal_set_message('There are no pages related to this object.  To create a valid METS file, there must be pages added to this object.', 'warning');
    }
    elseif (!$is_paged_object) {
      return;
    }
    $variables['pages'] = $pages;
  }
}

?>
