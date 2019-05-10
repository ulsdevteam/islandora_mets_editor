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
        */
?>

<div id="mets_editor_wrapper">
  <div id="rs_sidebar">
    <fieldset id="img_size">
      <legend>Selected page</legend>
        <div id="keypress_result"></div>
        <div id="event_result">&nbsp;<br />
            id = ?, parent = <br />
            <b>Label: </b><i>?</i><hr />
            <span class="fileid">____</span> (?)
        </div>
    </fieldset>

    <div class="treeview_editor">
        <div id="tree"></div>
    </div>
  </div>
  <div id="rs_dragbar"></div>

  <div id="rs_main">
    <div id="page_elements_tabs" class="tab-report">
      <div id="img_size_fields">No page is currently selected.</div>
      <ul>
        <li><a href="#page_preview">Page preview</a></li>
        <li><a href="#page_ocr">OCR</a></li>
      </ul>
      <div id="page_preview"></div>
      <div id="page_ocr"></div>
    </div>
  </div>
</div>
<button type="button" id="btn_autonum" class="one-row-buttons" onclick="auto_num();">AUTO #</button>
<input type="checkbox" id="cbx_overwrite" class="one-row-buttons" value="0" />
<label for="cbx_overwrite">Overwrite Page Numbers</label>
<br class="clearfloat" />
<button type="button" id="btn_add" disabled class="one-row-buttons" onclick="add_div();">{+} Section</button>
<button type="button" id="btn_edit" disabled class="one-row-buttons" onclick="edit_div();">Edit Section</button>
<button type="button" id="btn_rm" disabled class="one-row-buttons" onclick="rm_div();">{-} Section</button>
<br class="clearfloat" />

<button type="button" onclick="harvest();">Update METS file</button>
