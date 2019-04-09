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
    <div id="jstree_div" class="treeview_editor">
      <ul>
        <li class="jstree-open" id="node_1"><a href="#">Volume</a>
        <ul class="jstree-open">
    <?php foreach ($mets_array['structMap'] as $index => $structElement) : ?>
        <li id="index_<?php print $index; ?>"<?php print ($structElement['TYPE'] == 'section') ? ' class="jstree-file"': ' class="jstree-open"'; ?>><a href="#"><?php print $structElement['TYPE'] . ': ' . $structElement['LABEL']; ?></a></li>
    <?php endforeach; ?>
        </ul>
      </li>
      </ul>
    </div>

<?php /*
    <div id="treeview_editor">
        <select multiple size="10" name="struct" class="struct_selectbox">
    <?php foreach ($mets_array['structMap'] as $index => $structElement) : ?>
      <option value="<?php print $index; ?>" class="struct_<?php print $structElement['TYPE']; ?>">
      <?php if ($structElement['TYPE'] == 'page') {
        print 'page[' . $structElement['FILEID'] . ']: ';
      } else {
        print 'section: ';
      } ?>
      <?php print (($structElement['LABEL'] <> '') ? $structElement['LABEL'] : '<span class="notset">(no label)</span>'); ?>
      </option>
    <?php endforeach; ?></select></div>
    <div id="rs_dragbar"></div>
  </div> */ ?>
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
          <span class="page_info"><b><?php print $page['label']; ?></b><br>
              <i>Sequence: <?php print $page['page']; ?></i> 
              <?php print (user_access('manage object properties')) ? '<span class="ime_smaller ime_right_floater">' . l('Manage', 'islandora/object/' . $page['pid'] . '/manage', 
                array('attributes'=>array('target' => '_blank'))) . '</span>' : ''; ?><br>
          (<code><?php print (isset($page['width']) ? number_format($page['width']) : '??? '); ?> pixels wide,
                 <?php print (isset($page['height']) ? number_format($page['height']) : '??? '); ?> pixels tall.</code>)
          </span>
      </div>
    <?php } ?>
   </div>
  </div>
</div>
<button type="button" onclick="harvest();">Update METS file</button>
