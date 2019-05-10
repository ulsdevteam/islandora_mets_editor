<?php

/**
 * @file
 * METS editor form.
 */

function islandora_mets_editor_form(array $form, array &$form_state, AbstractObject $islandora_object) {
  module_load_include('inc', 'upitt_workflow', 'includes/utilities');
  module_load_include('inc', 'islandora_mets_editor', 'includes/utilities');

  $object_PID = $islandora_object->id;
  $mets_datastream = islandora_datastream_load('METS', $islandora_object);
  // Assign an empty value to the temporary mets filename variable.
  $tmp_mets_filename = '';
  if (is_object($mets_datastream)) { // isset($islandora_object['METS']) && $islandora_object['METS']) {
    $fn_pid = str_replace(":", "_", $islandora_object->id);
    $tmp_mets_filename = tempnam('/tmp', 'METS_' . $fn_pid);
    $mets_datastream->getContent($tmp_mets_filename);
    $form_state['input']['xmlfile'] = ''; // feature currently not supported
  }
  $mets_array = (file_exists($tmp_mets_filename)) ? islandora_mets_editor_get_mets_structMap($tmp_mets_filename) : array();
    // We are all done using this temporary file that points to the saved METS xml.
  if (file_exists($tmp_mets_filename)) {
    @unlink($tmp_mets_filename);
  }

  $xml_editor_markup = theme('islandora_mets_editor_editor_markup', array(
    'islandora_object' => $islandora_object,
    'mets_array' => '',
    'json_javascript' => ''));
  $form['editorform'] = array(
    'pid' => array(
      '#type' => 'hidden',
      '#value' => $islandora_object->id,
    ),
    'object_PID' => array(
      '#attributes' => array('id' => 'object_PID'),
      '#type' => 'hidden',
      '#value' => $object_PID,
    ),
    'json_mets' => array(
      '#attributes' => array('id' => 'json_mets'),
      '#type' => 'hidden',
      '#value' => '',
    ),
    'objectsformset' => array(
      '#type' => 'fieldset',
      '#prefix' => '<div id="object_label">Working with: ' . $islandora_object->id . '</div>',
      'xmlfile' => array(
        '#attributes' => array(
          'id' => 'xmlfile',
          'style' => 'display:none',
        ),
        '#type' => 'textarea',
        '#prefix' => $xml_editor_markup,
        '#default_value' => (isset($form_state['input']['xmlfile']) ? htmlspecialchars($form_state['input']['xmlfile']) : ''),
      ),
    ),
    // The button to harvest the METS from the javascript is within the
    // editor-markup.tpl.php.
    'submit' => array(
      '#type' => 'submit',
      '#value' => t('Save METS'),
    ),
  );
  return $form;
}

/*
    <div id="jstree_div" class="treeview_editor">
      <ul>
        <li class="jstree-open" id="node_1"><a href="#">Volume</a>
          <ul class="jstree-open">
      <?php foreach ($mets_array['structMap'] as $index => $structElement) : ?>
          <?php $info = ' <span style="color:#777;font-size: small">(index' . $index . ', child of ' . $structElement['parent_id'] . ')</span>'; ?>
          <?php if ($structElement['TYPE'] == 'page') : ?>
          <li id="index_<?php print $index; ?>"><a href="#"><?php print $structElement['TYPE'] . ': ' . $structElement['LABEL']; ?><?php print $info; ?></a></li>
          <?php else: ?>
          <li id="index_<?php print $index; ?>" class="jstree-open"': ' class="jstree-open"><a href="#"><?php print $structElement['TYPE'] . ': ' . $structElement['LABEL']; ?><?php print $info; ?></a></li>
          <?php endif; ?>
      <?php endforeach; ?>
          </ul>
      </ul>
    </div>
*/

function islandora_mets_editor_form_submit(array $form, array &$form_state) {
  module_load_include('inc', 'islandora_mets_editor', 'includes/utilities');
  global $user;

  if (isset($form_state['values']['pid']) && isset($form_state['input']['json_mets']) && $form_state['input']['json_mets']) {
    $json_arr = json_decode($form_state['input']['json_mets'], true);
    drupal_set_message("<b>JSON array that represents the updated METS file</b>" . 
        "<div style='max-height:220px;overflow:scroll'><pre>".print_r($json_arr, true) . "</pre></div>");
    $form_state['values']['xmlfile'] = 'parsed and created this xml from the json';
  }
  if (isset($form_state['values']['xmlfile']) && isset($form_state['values']['pid'])) {
    $pid = $form_state['values']['pid'];
    if ($form_state['values']['xmlfile'] <> 'parsed and created this xml from the json') {
      $islandora_object = islandora_object_load($pid);
      $mets_datastream = (isset($islandora_object['METS']) ? $islandora_object['METS'] : $islandora_object->constructDatastream('METS'));
      if (!isset($islandora_object['METS'])) {
        // only set the label / mimetype once
        $mets_datastream->mimetype = 'application/xml';
        $mets_datastream->label = 'METS metadata';
      }
      $mets = str_replace("'", '"', htmlspecialchars_decode($form_state['values']['xmlfile']));
      $mets_datastream->setContentFromString($mets);
      $islandora_object->ingestDatastream($mets_datastream);
    }
    else {
      drupal_set_message('Skipped setting the actual METS datastream for now.');
    }
  }
  else {
    drupal_set_message(t('There was no updated METS, so nothing was saved.  Please click <b>Update METS file</b> button and try again.'));
  }
}
