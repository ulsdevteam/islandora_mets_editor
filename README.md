Islandora Mets Editor
=============

## Installation

This module requires [Islandora Paged Content](https://github.com/Islandora/islandora_paged_content) module in order to run.

This modules requires the jQuery jstree javascript library which is included in the "js" subfolder -- and this javascript depends on jQuery and jQuery-ui. The stylesheet for jstree is named `css/style.css`, but the code loads this as `jstree.style.css` due to the fact that Drupal does not support having the same name for a stylesheet between any module and any library.

## Configuration

There is currently nothing to configure for this module, but there is a placeholder for this at `admin/islandora/mets_editor`.

## Usage

*Note: This module does not support some METS standards and will not persist any other METS nodes other than those within **mets:fileGrp** and **mets:mets:structMap**.  To use this module for METS files that have additional sections, a manual merge of the initial METS and edited METS file would be necessary.*

After installation, the code will display a "METS Editor" tab for any Islandora object that is considered paged-content (includes bookCModel, manuscriptCModel, and newspaperIssueCModel).  If an object already has a METS xml datastream, this will be loaded into the editor.  If the object does not have any METS file, the code will create one from the object's child page objects.  Each page would initially be labeled as "UNUM" which indicates that it is unnumbered.  The METS file that is displayed will only be saved to the object if the [Update METS file] and [Save METS] buttons are clicked.

### Keyboard Shortcuts ###
The editor is meant to be as intuitive as possible, but some of the way that it was designed is based on the legacy proprietary METS editor that we used to use here in our pre-Islandora days.  Because of this, certain key strokes correspond to specific actions:
| Key | Action |
| --- | ------ |
| **Insert**  | Add section, same as clicking the [Add Section] button |
| **↑** and **↓** | Navigate up and down to rename pages while using the [Overwrite "Auto-name" Pages] checkbox. *The editor must have focus.* |
| **F2** | Rename section or page, clicking the [Edit Page] / [Edit Section] button. |

### Page preview & OCR ###
The right side of the screen is dedicated to the review of the images and potentially the OCR for those pages.  The **Page preview** functions exactly the same as any Openseadragon image viewer (scrolling, clicking, panning, etc).

#### Add Section
Adds a new section within the currently selected heirarchy. The new section will appear as the last item at the same level as the current selection.  The user is prompted for a label for the new section.
#### Edit Section
Allows the currently selected section div to be renamed.
#### Remove Section
Removes the selected section div from the METS.  This keeps all of the pages contained in that section, but simply gets rid of the selected section.

## Author / License

Written by [Willow Gillingham](https://github.com/bgilling) for the [University of Pittsburgh](http://www.pitt.edu).  Copyright (c) University of Pittsburgh.

Released under a license of GPL v2 or later.
