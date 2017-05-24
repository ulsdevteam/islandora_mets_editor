<?php

/**
 * @file
 * METS editor form.
 */

function islandora_mets_editor_form(array $form, array &$form_state, AbstractObject $islandora_object) {
  module_load_include('inc', 'upitt_workflow', 'includes/utilities');

  $xml_editor_markup = theme('islandora_mets_editor_editor_markup', 
          array('islandora_object' => $islandora_object));

  $form['editorform'] = array(
    'pid' => array(
      '#type' => 'hidden',
      '#value' => $islandora_object->id,
    ),
    'objectsformset' => array(
      '#type' => 'fieldset',
      'xmlfile' => array(
        '#attributes' => array(
          'id' => 'xmlfile',
          'style' => 'display:none',
        ),
        '#type' => 'textarea',
        '#prefix' => $xml_editor_markup,
        '#default_value' => (isset($form_state['input']['xmlfile']) ? htmlspecialchars($form_state['input']['xmlfile']) : ''),
      ),

      'submit' => array(
        '#type' => 'submit',
        '#value' => t('Save configuration'),
      ),
    ),
  );
  
  return $form;
}

function islandora_mets_editor_form_submit(array $form, array &$form_state) {
  module_load_include('inc', 'islandora_mets_editor', 'includes/utilities');
  global $user;

  // the textarea with id = ' xmlfile contains the METS xml

  if (isset($form_state['values']['xmlfile']) && isset($form_state['values']['pid'])) {
    $pid = $form_state['values']['pid'];
    $islandora_object = islandora_object_load($pid);
    $mets_datastream = (isset($islandora_object['METS']) ? $islandora_object['METS'] : $islandora_object->constructDatastream('METS'));
    if (!isset($islandora_object['METS'])) {
      // only set the label / mimetype once
      $mets_datastream->mimetype = 'application/xml';
      $mets_datastream->label = 'METS metadata';
    }
    $mets_datastream->setContentFromString($form_state['values']['xmlfile']);
    $islandora_object->ingestDatastream($mets_datastream);
file_put_contents('/tmp/mets', $form_state['values']['xmlfile']);
//    if 
  }
  else {
    drupal_set_message(t('There was no updated METS, so nothing was saved.  Please click <b>Update METS file</b> button and try again.'));
  }
}
