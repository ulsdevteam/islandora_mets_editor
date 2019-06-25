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
  $protocols = array(
    'http' => 'http',
    'https' => 'https'
  );
  $form = array(
    'frame' => array(
      '#type' => 'fieldset',
      '#title' => 'Islandora METS Editor',
      'about' => array(
        '#type' => 'item',
        '#markup' => 'METS xml editor options...',
      ),
      'image_viewer_protocol' => array(
        '#type' => 'select',
        '#title' => t('Image Viewer Protocol'),
        '#description' => t('The image viewer\'s web protocol to be used for ' .
            'the `rft_id` parameter value of the image request url.'),
        '#required' => true,
        '#options' => $protocols,
        '#default_value' => variable_get('islandora_mets_editor_image_viewer_protocol', 'https'),
      ),
    ),
    'submit' => array(
      '#type' => 'submit',
      '#value' => t('Save Settings'),
    ),
    'reset' => array(
      '#type' => 'submit',
      '#prefix' => '&nbsp; ',
      '#value' => t('Reset'),
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
      variable_set('islandora_mets_editor_image_viewer_protocol', $form_state['values']['image_viewer_protocol']);
      drupal_set_message('[' . date('H:i:s') . '] The settings have been saved.');
      break;

    case 'edit-reset':
      variable_del('islandora_mets_editor_image_viewer_protocol');
      break;
  }
}
