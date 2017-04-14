islandora_mets_editor
=============


Using the xonomy javascript library to provide an XML editor.  This library is stored in /libraries/xonomy.

Also, the xonomy library does not work with jquery 1.4.4, so the jquery 3.1.1 has been added under /misc/jquery-3.1.1.min.js and is loaded explicitely for this module ONLY for the islandora/object/%/METS/edit page.

Finally, the xonomy javascript file has to be patched in order to detect the change of nodes for the purpose of updating the image thumbnails.  This is in the `misc/xonomy/xonomy.js` file.  Replace all instances of "`Xonomy.click(`" with "`xonomy_click_passthrough`".


## Author / License

Written by Brian Gillingham for the [University of Pittsburgh](http://www.pitt.edu).  Copyright (c) University of Pittsburgh.

Released under a license of GPL v2 or later.
