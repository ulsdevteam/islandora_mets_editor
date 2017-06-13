<?php

/**
 * @file
 * Administration forms and submit handling for Islandora METS Editor module.
 */

/**
 * Administration and configuration form for islandora_mets_editor.
 *
 * @ingroup forms
 *
 * @todo break out non-settings elements into their own form.
 *
 * @return array
 *   The Drupal form definition.
 */
function islandora_mets_editor_admin_form() {
  $form = array(
    'frame' => array(
      '#type' => 'fieldset',
      '#title' => 'About Islandora METS Editor',
      'about' => array(
        '#type' => 'item',
        '#markup' => 'METS xml editor options...',
      )
    ),
    'submit' => array(
      '#type' => 'submit',
      '#value' => t('Return'),
    ),
  );
  return $form;
}

/**
 * Function that sets the Drupal variables with user's input.
 *
 * @param array $form
 *   The Drupal form definition.
 * @param array $form_state
 *   The Drupal form state.
 */
function islandora_mets_editor_admin_form_submit(array $form, array &$form_state) {
  $id = $form_state['triggering_element']['#id'];
  switch ($id) {
    case 'edit-submit':
      drupal_goto('/admin/islandora');
      break;

    case 'edit-reset':
      break;
  }
}
