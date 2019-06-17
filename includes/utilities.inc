<?php

/**
 * @file
 * Utility functions for the Islandora METS Editor module.
 */

function islandora_mets_editor_generate_METS_xml($islandora_object, $pages) {
  // Assign an empty value to the temporary mets filename variable.
  $tmp_METS_filename = file_directory_temp() . '/METS_content_' . date('His_hms');
  // IF the object already has an item file record that has a METS file, then use this... else generate a METS from the other MASTER tif files related to the object
  if (isset($islandora_object['METS']) && !empty($islandora_object['METS'])) {
    $mets_datastream = $islandora_object['METS'];

    $mets_content = $mets_datastream->getContent($tmp_METS_filename);

    /*
    $xml_string = file_get_contents($tmp_METS_filename);
    $xml_string = preg_replace( "/\r|\n/", "", str_replace('"', "'", str_replace("'", "&apos;", $xml_string)));
    $xml_string = preg_replace('~>\s+<~', '><', $xml_string);
    */

    return $tmp_METS_filename;
  }

  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');

  $prefix = "<mets xmlns='http://www.loc.gov/METS/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:mets='http://www.loc.gov/METS/' xmlns:mods='http://www.loc.gov/MODS' xmlns:xlink='http://www.w3.org/1999/xlink' xsi:schemaLocation='http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd'><mets:fileSec><mets:fileGrp USE='master'>";
  $mid_point = "</mets:fileGrp></mets:fileSec><mets:structMap TYPE='mixed'><mets:div TYPE='volume'>";
  $suffix = "</mets:div></mets:structMap></mets>";
  $mets_files = $struct_maps = array();

  $seq = 1;

  foreach ($pages as $page) {
    if (isset($page['pid'])) {
      $page_obj = islandora_object_load($page['pid']);
      $fid = isset($page['page']) ? $page['page'] : 0;

      $obj_mimetype = isset($page_obj['OBJ']) ? $page_obj['OBJ']->mimetype : '';
      $jpg_mimetype = isset($page_obj['JPG']) ? $page_obj['JPG']->mimetype : '';

      if ($obj_mimetype || $jpg_mimetype) {
        $seq_padded = 'unum'; // sprintf('%04s', $seq);
        $name = (is_object($page_obj) && (get_class($page_obj) == 'IslandoraFedoraObject')) ? 
            $page['pid'] : $page['label'];
        // Old href was using this pattern: $seq_padded . '.tif'

        $mets_files[] = "<mets:file ID='fid" . $fid . "' MIMETYPE='image/tiff' SEQ='" .
            $seq_padded . "'><mets:FLocat xlink:href='" . $name . "' LOCTYPE='URL'/></mets:file>";
        $struct_maps[] = "<mets:div TYPE='page' LABEL='" . $seq_padded .
            "'><mets:fptr FILEID='fid" . $fid . "'/></mets:div>";

        $seq++;
      }
    }
  }

  $xml_string = $prefix .
                implode('', $mets_files) .
                $mid_point .
                implode('', $struct_maps) .
                $suffix;

  if ($tmp_METS_filename) {
    file_put_contents($tmp_METS_filename, $xml_string);
  }
  return $tmp_METS_filename;
}

function islandora_mets_editor_get_mets_fileSec_json($mets_filename, $pages) {
  $xsl = str_replace("/includes", "", dirname(__FILE__).'/transforms/mets_fileSec_json.xsl');

  $fileSec_html = (file_exists($mets_filename)) ? islandora_mets_editor_runXslTransform(
            array(
              'xsl' => $xsl,
              'input_filename' => $mets_filename,
            )
          ) : '';

  return substr($fileSec_html, 0, -2);
}

function islandora_mets_editor_get_mets_struct_json($mets_filename) {
  $xsl = str_replace("/includes", "", dirname(__FILE__).'/transforms/mets_to_json.xsl');

  $struct_html = (file_exists($mets_filename)) ? islandora_mets_editor_runXslTransform(
            array(
              'xsl' => $xsl,
              'input_filename' => $mets_filename,
            )
          ) : '';

  return substr($struct_html, 0, -2);
}

function islandora_mets_editor_runXslTransform($info) {
  $xsl = new DOMDocument();
  $xsl->load($info['xsl']);
  $input = new DOMDocument();
  if (array_key_exists('input_filename', $info)) {
    $input->load($info['input_filename']);
  }
  else {
    $input->loadXML($info['input']);
  }

  $processor = new XSLTProcessor();
  $processor->importStylesheet($xsl);
  return $processor->transformToXML($input);
}

function islandora_mets_editor_parse_struct_div($xml_str) {
  // is this needed?
}

function islandora_mets_editor_generate_variables_json($islandora_object) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  $pages = islandora_paged_content_get_pages($islandora_object);
  $parent_object_pid = $islandora_object->id;
  $fids2names = array();
  foreach ($pages as $page) {
    if (isset($page['pid'])) {
      $page_obj = islandora_object_load($page['pid']);
      $fid = sprintf('%04d', (isset($page['page']) ? $page['page'] : 0));
      if (isset($page_obj['JPG'])) {
        $pref_ds[$fid] = 'JPG';
      } elseif (isset($page_obj['MEDIUM'])) {
        $pref_ds[$fid] = 'MEDIUM';
      } elseif (isset($page_obj['TN'])) {
        $pref_ds[$fid] = 'TN';
      } else {
        $pref_ds[$fid] = 'JP2';
      }
      $name = (is_object($page_obj) && (get_class($page_obj) == 'IslandoraFedoraObject')) ? $page_obj->label : $page['label'];
      $obj_mimetype = isset($page_obj['OBJ']) ? $page_obj['OBJ']->mimetype : '';
      $jpg_mimetype = isset($page_obj['JPG']) ? $page_obj['JPG']->mimetype : '';
      if ($obj_mimetype || $jpg_mimetype) {
        $fids2names[$fid] = str_replace($parent_object_pid . '-', "", $page['pid']);
      }
    }
  }
  return array('fid2names' => json_encode($fids2names), 'pref_ds' => json_encode($pref_ds));
}
