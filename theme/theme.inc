<?php

function islandora_mets_editor_preprocess_islandora_mets_editor_editor_markup(&$variables) {
  $islandora_object = (isset($variables['islandora_object'])) ? $variables['islandora_object'] : NULL;
  if (is_object($islandora_object)) {
    module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
    module_load_include('module', 'islandora_mets_editor', 'islandora_mets_editor');
    module_load_include('inc', 'islandora_mets_editor', 'includes/utilities');
    $path = drupal_get_path('module', 'islandora_mets_editor');
    drupal_add_js($path . '/js/jstree.min.js');
    $is_paged_object = islandora_mets_editor_is_paged_object($islandora_object);
    $pages = ($is_paged_object) ? islandora_paged_content_get_pages($islandora_object) : array();

    if (isset($islandora_object['METS']) && $islandora_object['METS']) {
      $fn_pid = str_replace(":", "_", $islandora_object->id);
      $tmp_METS_filename = tempnam('/tmp', 'METS_' . $fn_pid);
      $islandora_object['METS']->getContent($tmp_METS_filename);
      $form_state['input']['xmlfile'] = ''; // feature currently not supported
    }
    else {
      $tmp_METS_filename = islandora_mets_editor_generate_METS_xml($islandora_object, $pages);
    }
    module_load_include('inc', 'islandora_mets_editor', 'includes/utilities');
    $struct_json = (file_exists($tmp_METS_filename)) ? islandora_mets_editor_get_mets_struct_json($tmp_METS_filename) : '';
    $mets_fileSec_json = (file_exists($tmp_METS_filename)) ? islandora_mets_editor_get_mets_fileSec_json($tmp_METS_filename, $pages) : '';
    $json_markup = theme('islandora_mets_editor_struct_json_markup', array(
        'json_array' => $struct_json,
        'file_array' => $mets_fileSec_json,
    ));

    // We are all done using this temporary file that points to the saved METS xml.
    if (file_exists($tmp_METS_filename)) {
      @unlink($tmp_METS_filename);
    }

    drupal_add_js($json_markup, 'inline');
    drupal_add_js($path . '/js/mets_editor.js');
    drupal_add_library('system', 'ui.tabs');
    // This is needed to initiate the jQuery tabs.
    drupal_add_js('jQuery( function() {
    jQuery( "#page_elements_tabs" ).tabs();
} );', 'inline');

    // Set some javascript values based on the datastreams for the pages of the
    // given islandora_object.
    $var = islandora_mets_editor_generate_variables_json($islandora_object);
    $inline_js = 'var fid2names = ' . $var['fid2names'] . ';
    var pref_ds = ' . $var['pref_ds'] . ';';
    drupal_add_js($inline_js, 'inline');

    drupal_add_css($path . '/css/mets_editor.css');
    // This is weird, but apparently required since drupal_add_css expects that
    // the stylesheet name is unique between libraries and modules.
    drupal_add_css($path . '/css/style.css', array('basename' => 'jstree.style.css'));


    /* ------------------------------------------------------ */

    module_load_include('inc', 'islandora_openseadragon', 'includes/utilities');
    $library_path = libraries_get_path('openseadragon');
    if (isset($variables['fedora_object']) && $variables['fedora_object'] !== NULL) {
      $message = t("The parameter 'fedora_object' in theme('islandora_openseadragon_viewer') has been deprecated. As of 7.x-1.10, please update your code before the next release.");
      trigger_error(check_plain($message), E_USER_DEPRECATED);
      // Attempt to convert 'fedora_object', to 'pid'.
      $variables['pid'] = $variables['fedora_object']->id;
    }
    elseif (is_object($islandora_object)) {
      $variables['pid'] = $islandora_object->id;
    }
    if (isset($variables['uri']) && $variables['uri'] !== '') {
      $message = t("The parameter 'uri' in theme('islandora_openseadragon_viewer') has been deprecated. As of 7.x-1.10, please update your code before the next release.");
      trigger_error(check_plain($message), E_USER_DEPRECATED);
      $variables['tile_sources'] = array(islandora_openseadragon_identifier_tile_source($variables['uri']));
    }
    $variables['id'] = $variables['viewer_id'] = 'islandora-openseadragon';
    $variables['settings'] = array(
      'pid' => $variables['pid'],
      'imageServer' => variable_get('islandora_openseadragon_tilesource', 'djatoka'),
      'djatokaServerBaseURL' => url(variable_get('islandora_openseadragon_djatoka_url', 'adore-djatoka/resolver'),
        array('absolute' => TRUE)
      ),
      'iiifServerBaseURL' => url(variable_get('islandora_openseadragon_iiif_url', 'iiif')),
      'fitToAspectRatio' => variable_get('islandora_openseadragon_fit_to_aspect_ratio', FALSE),
      'options' => array(
        'id' => $variables['id'],
        'prefixUrl' => file_create_url("{$library_path}/images/"),
        'tileSources' => $variables['tile_sources'],
        'overlays' => islandora_openseadragon_viewer_query_solr_for_overlays($variables['pid']),
      ) + islandora_openseadragon_get_settings(),
    );

    module_load_include('module', 'islandora_openseadragon', 'islandora_openseadragon');
    module_load_include('inc', 'islandora_openseadragon', 'includes/utilities');
    $library_path = libraries_get_path('openseadragon');
    $module_path = drupal_get_path('module', 'islandora_openseadragon');

    drupal_add_js(array(
      'islandoraOpenSeadragon' => $variables['settings'],
    ), 'setting');

    drupal_add_js("$library_path/openseadragon.js", array('weight' => -4));
    if (islandora_openseadragon_use_djatoka_server()) {
      drupal_add_js("$module_path/js/djtilesource.js", array('weight' => -3));
    }
    drupal_add_js("$module_path/js/islandora_openseadragon.js", array('weight' => -2));
    drupal_add_css("$module_path/css/islandora_openseadragon.theme.css");

    /* ------------------------------------------------------ */


    module_load_include('module', 'islandora_mets_editor', 'islandora_mets_editor');
    $is_paged_object = islandora_mets_editor_is_paged_object($islandora_object);

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
