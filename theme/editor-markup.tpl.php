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
  <div id="rs_sidebar">
    <div id="xonomy_editor" class="scroll_short"></div>
    <div id="rs_dragbar"></div>
  </div>
  <div id="rs_main">
    <div id="page_preview"></div>
    <fieldset id="img_size">
      <legend>Page image size</legend>
      <div id="img_size_fields">
        No page is currently selected.
      </div>
    </fieldset>
    <div id="page_selector">
    <?php
    foreach ($variables['pages'] as $page) { ?>
      <div class="page_info_wrap_div">
          <div class="mini_thumb_div">
            <img class="mini_thumb" src="/islandora/object/<?php print $page['pid']; ?>/datastream/TN/view" width="48" onclick="click_page('<?php print $page['pid']; ?>')" />
          </div>
          <span class="page_info">Label: <b><?php print $page['label']; ?></b><br>
  Sequence: <?php print $page['page']; ?><br>
          (<code><?php print (isset($page['width']) ? number_format($page['width']) : '??? '); ?> pixels wide,
                 <?php print (isset($page['height']) ? number_format($page['height']) : '??? '); ?> pixels tall.</code>)
          </span>
      </div>
    <?php } ?>
   </div>
  </div>
</div>
<button type="button" onclick="harvest();">Update METS file</button>
