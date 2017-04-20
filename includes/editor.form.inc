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
    'form_description' => array('#markup' => '* A description of this form *'),

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

  drupal_set_message(t('There were no PID values for this editor.  Please try again.'));
}
