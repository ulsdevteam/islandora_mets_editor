<?php

/**
 * @file
 * METS editor form.
 */

function islandora_mets_editor_form(array $form, array &$form_state, AbstractObject $islandora_object) {
  module_load_include('inc', 'upitt_workflow', 'includes/utilities');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');

  // If the object model is a paged Content model, and there are pages contained within the object's
  $is_paged_object = (is_object($islandora_object)) ? (!(array_search('islandora:bookCModel', $islandora_object->models) === FALSE) ||
    !(array_search('islandora:newspaperIssueCModel', $islandora_object->models) === FALSE) ||
    !(array_search('islandora:manuscriptCModel', $islandora_object->models) === FALSE) ) : FALSE;


  $pages = ($is_paged_object) ? islandora_paged_content_get_pages_ri($islandora_object) : array();

  if ($is_paged_object && (count($pages) < 1)) {
    drupal_set_message('There are no pages related to this object.  To create a valid METS file, there must be pages added to this object.', 'warning');
  } 
  elseif (!$is_paged_object) {
    return;
  }
  
  $xml_editor_markup = '<div id="mets_editor_wrapper">' .
         '  <div id="xonomy_editor" class="scroll_short"></div>' .
         '  <div id="page_preview"></div>' .
         '  <fieldset id="img_size">' .
         '    <legend>Page image size</legend>' .
         '    <div id="img_size_fields">' .
         '      No page is currently selected.' .
         '    </div>' .
         '  </fieldset>' .
         '</div>' .
         '<button type="button" onclick="harvest();">Update METS file</button>';

  $form['editorform'] = array(
    'form_description' => array('#markup' => '* A description of this form *'),

    'objectsformset' => array(
      '#attributes' => array('style' => 'background-color:#e7e7e7'),
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
