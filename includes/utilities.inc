<?php

/**
 * @file
 * Utility functions for the Islandora METS Editor module.
 */

function islandora_mets_editor_xonomy_editor_javascript_call_script($xml, $docSpec, $editor_id = 'xonomy_editor') {
  return 'function start_xonomy_editor() {
    var docSpec=" . $docSpec . "
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
                        attributes: {
                                "TYPE": {
                                        asker: Xonomy.askString,
                                        askerParameter: {},
                                        menu: [],
                                        validate: function(jsAttribute) {
                                                if($.trim(jsAttribute.value)=="") {
                                                        Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @TYPE attribute should not be empty."});
                                                        return false;
                                                }
                                                return true;
                                        },
                                },
                        },
			collapsed: function(jsElement){return false},
		},
		"mets:file": {
			//isReadOnly: function(jsMe){return true},
			//isInvisible: function(jsMe){return true},
			//displayName: "člověk",
			canDropTo: ["mets:fileGrp"],
			localDropOnly: true, // false,
			menu: [
				{	caption: "New <person> before this",
					action: Xonomy.newElementBefore,
					actionParameter: "<person name=\'\' sex=\'\'/>",
					hideIf: function(jsElement){return false}
				},
				{	caption: "New <person> after this",
					action: Xonomy.newElementAfter,
					actionParameter: "<person name=\'\' sex=\'\'/>",
					hideIf: function(jsElement){return false}
				},
				{	caption: "Add @age",
					action: Xonomy.newAttribute,
					actionParameter: {name: "age", value: ""},
					hideIf: function(jsElement){return jsElement.hasAttribute("age")}
				},
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
				"sex": {
					shy: false,
					asker: Xonomy.askPicklist,
					askerParameter: [
						{value: "m", xdisplayValue: "muž", caption: "male"},
						{value: "f", xdisplayValue: "žen", caption: "female"},
						{value: "x", xdisplayValue: "jin", caption: "it\'s complicated"}
					],
					caption: function(jsMe){
						if(jsMe.value=="m") return "male";
						if(jsMe.value=="f") return "female";
						if(jsMe.value=="x") return "it\'s complicated";
					},
					// displayName: "pohlaví",
					// displayValue: function(jsMe){
						// if(jsMe.value=="m") return "muž";
						// if(jsMe.value=="f") return "žen";
						// if(jsMe.value=="x") return "jin";
						// return jsMe.value;
					// },
					menu: [],
					validate: function(jsAttribute) {
						if($.trim(jsAttribute.value)=="") {
							Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @sex attribute should not be empty."});
							return false;
						}
						return true;
					},
				},
				"age": {
					shy: false,
					asker: Xonomy.askString,
					askerParameter: null,
					menu: [{
						caption: "Delete",
						action: Xonomy.deleteAttribute,
						actionParameter: null,
						hideIf: function(jsAttribute){return false}
					}],
					validate: function(jsAttribute) {
						if(!/^[0-9]+$/g.test(jsAttribute.value)) {
							Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @age attribute should be a whole number greater than zero."});
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
                        menu: [{
                                caption: "New <div>",
                                action: Xonomy.newElementChild,
                                actionParameter: "<person name=\'\' sex=\'\'/>",
                                hideIf: function(jsElement){return false}
                        }],
                        collapsed: function(jsElement){return false},
                },
                "mets:div": {
                        //isReadOnly: function(jsMe){return true},
                        //isInvisible: function(jsMe){return true},
                        //displayName: "člověk",
                        canDropTo: ["mets:structMap"],
                        localDropOnly: true, // false,
                        menu: [
                                {       caption: "New <div> before this",
                                        action: Xonomy.newElementBefore,
                                        actionParameter: "<mets:div TYPE=\'page\' LABEL=\'unum\'/>",
                                        hideIf: function(jsElement){return false}
                                },
                                {       caption: "New <div> after this",
                                        action: Xonomy.newElementAfter,
                                        actionParameter: "<mets:div TYPE=\'page\' LABEL=\'unum\'/>",
                                        hideIf: function(jsElement){return false}
                                },
                                {       caption: "Add @div",
                                        action: Xonomy.newAttribute,
                                        actionParameter: {name: "div", value: ""},
                                        hideIf: function(jsElement){return jsElement.hasAttribute("div")}
                                },
                                {       caption: "Delete",
                                        action: Xonomy.deleteElement,
                                        actionParameter: null,
                                        hideIf: function(jsElement){return false}
                                }
                        ],
                        attributes: {
                                "FILEID": {
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
		}

	}
}';
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
    return $xml_string;
  }

  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');

  $prefix = "<mets xmlns='http://www.loc.gov/METS/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:mets='http://www.loc.gov/METS/' xmlns:mods='http://www.loc.gov/MODS' xmlns:xlink='http://www.w3.org/1999/xlink' xsi:schemaLocation='http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd'><mets:fileSec><mets:fileGrp USE='master'>";
  $mid_point = "</mets:fileGrp></mets:fileSec><mets:structMap TYPE='mixed'><mets:div TYPE='volume'>";
  $suffix = "</mets:div></mets:structMap></mets>";

  $pages = islandora_paged_content_get_pages_ri($islandora_object);
  $mets_files = $struct_maps = array();

  $seq = 0;
  foreach ($pages as $page) {
    if (isset($page['pid'])) {
      $page_obj = islandora_object_load($page['pid']);
      $name = (is_object($page_obj) && (get_class($page_obj) == 'IslandoraFedoraObject')) ? $page_obj->label : $page['label'];
      $fid = '$fid' . isset($page['page']) ? $page['page'] : 0;

      $obj_mimetype = isset($page_obj['OBJ']) ? $page_obj['OBJ']->mimetype : '';
      $jpg_mimetype = isset($page_obj['JPG']) ? $page_obj['JPG']->mimetype : '';

      if ($obj_mimetype || $jpg_mimetype) {
        $seq_padded = sprintf('%04s', $seq);

        $mets_files[] = "<mets:file ID='" . $fid . "' MIMETYPE='image/tiff' SEQ='" . $seq_padded . "'><mets:FLocat xlink:href='" . $name . "' LOCTYPE='URL'/></mets:file>";
        $struct_maps[] = "<mets:div TYPE='page' LABEL='unum'><mets:fptr FILEID='" . $fid . "'/></mets:div>";

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

