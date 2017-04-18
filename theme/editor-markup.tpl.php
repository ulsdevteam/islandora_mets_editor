<?php
/**
        * @file
        * editor-markup display template.
        *
        * Variables available:
        * - $islandora_object: The underlying object for the METS.
        *
        * - $pages: array of pages -- from islandora_paged_content function call --
        *      $pages['label'] - the label of the underlying page object
        *      $pages['pid'] - the PID for the underlying page object
        *      $pages['page'] - the 4 digit sequence number... used in deriving the PID
        *      $pages['height']
        *      $pages['width']
        *
        * @see islandora_mets_editor_preprocess_islandora_upitt_view
        */
?>

<div id="mets_editor_wrapper">
  <div id="xonomy_editor" class="scroll_short"></div>
  <div id="page_preview"></div>
  <fieldset id="img_size">
    <legend>Page image size</legend>
    <div id="img_size_fields">
      No page is currently selected.
    </div>
  </fieldset>
  <div id="page_selector">
  <?php
  dpm($variables);
  foreach ($variables['pages'] as $page) { ?>
    <div>
        <img class="mini-thumb" src="/islandora/object/<?php print $page['pid']; ?>/datastream/TN/view" width="48" />
        <div class="page_info_div"><b><?php print $page['label']; ?></b><br>
        (<code><?php print number_format($page['width']); ?> pixels wide,
            <?php print number_format($page['height']); ?> pixels tall.</code>)</div>
    </div>
  <?php } ?>
 </div>
</div>
<button type="button" onclick="harvest();">Update METS file</button>
