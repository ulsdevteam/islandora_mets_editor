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
        $seq_padded = sprintf('%04s', $seq);
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

function islandora_mets_editor_get_mets_structMap($mets_filename) {
  if (!file_exists($mets_filename)) {
    return array();
  }

  // There was a problem loading the xml via the simplexml_load_string method
  // simplexml_load_string($xml_str);
  $mets_xml = simplexml_load_file($mets_filename);
  $mets_xml->registerXPathNamespace('mets', 'http://www.loc.gov/METS/');
  $mets_xml->registerXPathNamespace('mods', 'http://www.loc.gov/MODS');
  $mets_xml->registerXPathNamespace('xlink', 'http://www.w3.org/1999/xlink');

  $mets_files = array();
  // this xpath query should return all of the <mets:file /> nodes for example:
  //   <mets:file ID="fid0001" MIMETYPE="image/tiff" SEQ="0000">
  //     <mets:FLocat xlink:href="pitt:00acc3285m-0001" LOCTYPE="URL"/>
  //   </mets:file>
  foreach($mets_xml->xpath('//mets:mets/mets:fileSec/mets:fileGrp') as $fileGrp) {
    $mets_file = $fileGrp->xpath('mets:file');

    foreach ($mets_file as $file_obj) {
      $file_arr = (array)$file_obj;
      $file_obj->registerXPathNamespace('xlink', 'http://www.w3.org/1999/xlink');
      $FLocat_obj = $file_obj->xpath('mets:FLocat');
      foreach ($FLocat_obj as $file_FLocat_obj) {
        $file_FLocat_obj->registerXPathNamespace('xlink', 'http://www.w3.org/1999/xlink');
        $xlink_obj = $file_FLocat_obj->xpath("@xlink:href");
        foreach ($xlink_obj as $xlink_href_obj) {
          $xlink_href_arr = (array)$xlink_href_obj;
        }
        $file_FLocat_arr = (array)$file_FLocat_obj;
      }
      $mets_file_arr = array_merge($file_arr['@attributes'], $xlink_href_arr['@attributes'], $file_FLocat_arr['@attributes']);
      $mets_files[$mets_file_arr['ID']] = $mets_file_arr;
    }
  }

  // This section will populate the section data that will recurse to place the page in a section or
  // sub-sections or pages under a section.  For example:
  //   <mets:div TYPE="volume">
  //     <mets:div TYPE="page" LABEL="unum">
  //       <mets:fptr FILEID="fid0001"/>
  //     </mets:div>
  //   </mets:div>
  $sections_array = array();
  $last_section_div_id = 0;
  $last_div_type = 'volume';
  foreach($mets_xml->xpath('//mets:div') as $mets_div) {
    $div_arr = (array)$mets_div;
    $sections_type = $div_arr['@attributes']['TYPE'];
    if ($sections_type <> 'section') {
  //    $sections_array[$sections_type] = array();
    }
    if ($sections_type == 'page') {
      $div_fptr = $mets_div->xpath('mets:fptr');
      foreach ($div_fptr  as $fptr_obj) {
        $fptr_arr = (array)$fptr_obj;
        $fptr_arr['@attributes']['parent_id'] = $last_section_div_id;
      }
      $sections_array[] = array_merge($fptr_arr['@attributes'], $div_arr['@attributes']);
      $last_div_type = 'page';
    }
    elseif ($sections_type == 'section') {
      $div_arr['@attributes']['parent_id'] = ($last_div_type == 'page') ? 0 : $last_section_div_id;
      $sections_array[] = $div_arr['@attributes'];
      $last_section_div_id = count($sections_array) - 1;
      $last_div_type = 'section';
    }
  }
  return array(
    'fileSec_fileGrp_files' => $mets_files, 
    'structMap' => $sections_array);
}

function islandora_mets_editor_parse_struct_div($xml_str) {
  // is this needed?
}

function islandora_mets_editor_generate_variables_json($islandora_object) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  $pages = islandora_paged_content_get_pages($islandora_object);
  $parent_object_pid = $islandora_object->id;
  ///  $pages = islandora_paged_content_get_pages_ri($islandora_object);
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
