<?php

/**
 * @file
 * Utility functions for the Islandora METS Editor module.
 */

function islandora_mets_editor_xonomy_editor_javascript_call_script($xml, $docSpec, $fid2names, $pref_ds, $editor_id = 'xonomy_editor') {
  return 'var fid2names = ' . $fid2names . ';
    var pref_ds = ' . $pref_ds . ';
function start_xonomy_editor() {
    var docSpec=' . $docSpec . '
    var xml="' . $xml . '";
    var editor=document.getElementById("' . $editor_id . '");
    Xonomy.render(xml, editor, docSpec);
  }
  function harvest() {
    var xml=Xonomy.harvest();
    //do something with xml...
    $(\'#xmlfile\').text(xml);
    return false;
  }';
}

function islandora_mets_editor_docSpec() {
  return '{
	onchange: function(){

	},
	validate: function(jsElement){
		if(typeof(jsElement)=="string") jsElement=Xonomy.xml2js(jsElement);
		var valid=true;
		var elementSpec=this.elements[jsElement.name];
		if(elementSpec.validate) {
			elementSpec.validate(jsElement); //validate the element
		}
		for(var iAttribute=0; iAttribute<jsElement.attributes.length; iAttribute++) {
			var jsAttribute=jsElement.attributes[iAttribute];
			var attributeSpec=elementSpec.attributes[jsAttribute.name];
			if(attributeSpec.validate) {
				if(!attributeSpec.validate(jsAttribute)) valid=false; //validate the attribute
			}
		}
		for(var iChild=0; iChild<jsElement.children.length; iChild++) {
			if(jsElement.children[iChild].type=="element") {
				var jsChild=jsElement.children[iChild];
				if(!this.validate(jsChild)) valid=false; //recurse to the child element
			}
		}
		return valid;
	},
	elements: {
		"mets": {
			menu: [],
			collapsed: function(jsElement){return false}
		},
                "mets:fileSec": {
                        backgroundColour: "#d6fad6",
                        menu: [],
                        collapsed: function(jsElement){return false},
                },
		"mets:fileGrp": {
			backgroundColour: "#e9e9e9",
			menu: [{
				caption: "New <mets:file>",
				action: Xonomy.newElementChild,
				actionParameter: "<mets:file ID=\'\' MIMETYPE=\'\' SEQ=\'\'/>",
				hideIf: function(jsElement){return false}
			}],
			collapsed: function(jsElement){return false},
		},
		"mets:file": {
			menu: [
				{	caption: "Delete",
					action: Xonomy.deleteElement,
					actionParameter: null,
					hideIf: function(jsElement){return false}
				}
			],
			attributes: {
				"name": {
					asker: Xonomy.askString,
					askerParameter: {},
					menu: [],
					validate: function(jsAttribute) {
						if($.trim(jsAttribute.value)=="") {
							Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @name attribute should not be empty."});
							return false;
						}
						return true;
					},
				},
			},
			collapsed: function(jsElement){return false}
		},
                "mets:structMap": {
                        backgroundColour: "#ffd6d6",
                        collapsed: function(jsElement){return false},
                },
                "mets:div": {
                        isReadOnly: false,
                        canDropTo: ["mets:div"],
			mustBeAfter: [],
			mustBeBefore: [],
                        menu: [
                                {       caption: "New Section <div> before this",
                                        action: Xonomy.newElementBefore,
                                        actionParameter: "<mets:div xmlns:mets=\'http://www.loc.gov/METS/\' TYPE=\'section\' LABEL=\'unum\'/>",
                                        hideIf: function(jsElement){return false}
                                },
                                {       caption: "New Section <div> after this",
                                        action: Xonomy.newElementAfter,
                                        actionParameter: "<mets:div xmlns:mets=\'http://www.loc.gov/METS/\' TYPE=\'section\' LABEL=\'unum\'/>",
                                        hideIf: function(jsElement){return false}
                                },
                                {       caption: "Delete",
                                        action: Xonomy.deleteElement,
                                        actionParameter: null,
                                        hideIf: function(jsElement){return false}
                                }
                        ],
                        attributes: {
                                "TYPE": {
                                        asker: Xonomy.askPicklist,
                                        askerParameter: [
                                                {value: "cover", caption: "Cover"},
                                                {value: "page", caption: "Page"},
                                                {value: "section", caption: "Section"}
                                        ],
                                        menu: [],
                                        validate: function(jsAttribute) {
                                                if($.trim(jsAttribute.value)=="") {
                                                        Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @TYPE attribute should not be empty."});
                                                        return false;
                                                }
                                                return true;
                                        },
                                },
                                "LABEL": {
                                        asker: Xonomy.askString,
                                        askerParameter: {},
                                        menu: [],
                                        validate: function(jsAttribute) {
                                                if($.trim(jsAttribute.value)=="") {
                                                        Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @LABEL attribute should not be empty."});
                                                        return false;
                                                }
                                                return true;
                                        },
                                },
			},
                },
                "mets:fptr": {
                        attributes: {
                                "FILEID": {
                                        asker: Xonomy.askString,
                                        askerParameter: {},
                                        menu: [],
                                        validate: function(jsAttribute) {
                                                if($.trim(jsAttribute.value)=="") {
                                                        Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @FILEID attribute should not be empty."});
                                                        return false;
                                                }
                                                return true;
                                        },
                                },
			},
		}

	}
}';
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
function islandora_mets_editor_generate_METS_xml($islandora_object) {
  // IF the object already has an item file record that has a METS file, then use this... else generate a METS from the other MASTER tif files related to the object
  if (isset($islandora_object['METS']) && !empty($islandora_object['METS'])) {
    $mets_datastream = $islandora_object['METS'];
    $tmp_METS = file_directory_temp() . '/METS_content_' . date('His_hms');
    $mets_content = $mets_datastream->getContent($tmp_METS);

    $xml_string = file_get_contents($tmp_METS);
    unset($tmp_METS);
    $xml_string = preg_replace( "/\r|\n/", "", str_replace('"', "'", str_replace("'", "&apos;", $xml_string)));
    $xml_string = preg_replace('~>\s+<~', '><', $xml_string);

    return $xml_string;
  }

  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');

  $prefix = "<mets xmlns='http://www.loc.gov/METS/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:mets='http://www.loc.gov/METS/' xmlns:mods='http://www.loc.gov/MODS' xmlns:xlink='http://www.w3.org/1999/xlink' xsi:schemaLocation='http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd'><mets:fileSec><mets:fileGrp USE='master'>";
  $mid_point = "</mets:fileGrp></mets:fileSec><mets:structMap TYPE='mixed'><mets:div TYPE='volume'>";
  $suffix = "</mets:div></mets:structMap></mets>";

  $pages = islandora_paged_content_get_pages($islandora_object);
  ///  $pages = islandora_paged_content_get_pages_ri($islandora_object);
  $mets_files = $struct_maps = array();

  $seq = 0;
  foreach ($pages as $page) {
    if (isset($page['pid'])) {
      $page_obj = islandora_object_load($page['pid']);
      $name = (is_object($page_obj) && (get_class($page_obj) == 'IslandoraFedoraObject')) ? $page_obj->label : $page['label'];
      $fid = isset($page['page']) ? $page['page'] : 0;

      $obj_mimetype = isset($page_obj['OBJ']) ? $page_obj['OBJ']->mimetype : '';
      $jpg_mimetype = isset($page_obj['JPG']) ? $page_obj['JPG']->mimetype : '';

      if ($obj_mimetype || $jpg_mimetype) {
        $seq_padded = sprintf('%04s', $seq);

        $mets_files[] = "<mets:file ID='fid" . $fid . "' MIMETYPE='image/tiff' SEQ='" . $seq_padded . "'><mets:FLocat xlink:href='" . $name . "' LOCTYPE='URL'/></mets:file>";
        $struct_maps[] = "<mets:div TYPE='page' LABEL='unum'><mets:fptr FILEID='fid" . $fid . "'/></mets:div>";

        $seq++;
      }
    }
  }

  $xml_string = $prefix .
                implode('', $mets_files) .
                $mid_point .
                implode('', $struct_maps) .
                $suffix;

  return $xml_string;
}

function islandora_mets_editor_get_mets_structMap($xml_str) {
  $mets_xml = simplexml_load_string($xml_str);
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
      }
      $sections_array[] = array_merge($fptr_arr['@attributes'], $div_arr['@attributes']);
    }
    elseif ($sections_type == 'section') {
      $sections_array[] = $div_arr['@attributes'];
    }
  }
  return array(
    'fileSec_fileGrp_files' => $mets_files, 
    'structMap' => $sections_array);// $mets_structMap;
}

function islandora_mets_editor_parse_struct_div($xml_str) {
//  echo("<pre>" . htmlspecialchars($xml_str) . "</pre>");

}