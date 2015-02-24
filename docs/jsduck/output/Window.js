Ext.data.JsonP.Window({"tagname":"class","name":"Window","autodetected":{},"files":[{"filename":"Window.js","href":"Window.html#Window"}],"members":[{"name":"click","tagname":"method","owner":"Window","id":"method-click","meta":{}},{"name":"executeScript","tagname":"method","owner":"Window","id":"method-executeScript","meta":{}},{"name":"findEl","tagname":"method","owner":"Window","id":"method-findEl","meta":{}},{"name":"getTitle","tagname":"method","owner":"Window","id":"method-getTitle","meta":{}},{"name":"goTo","tagname":"method","owner":"Window","id":"method-goTo","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-Window","short_doc":"Almost every method makes use of ´this.__browser.switchToWindow(this);`\nbecause we need to ensure that the commands a...","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/Window.html#Window' target='_blank'>Window.js</a></div></pre><div class='doc-contents'><p>Almost every method makes use of ´this.__browser.switchToWindow(this);`\nbecause we need to ensure that the commands are sent to the correct\nwindow and not some other window the driver has selected.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-click' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Window'>Window</span><br/><a href='source/Window.html#Window-method-click' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Window-method-click' class='name expandable'>click</a>( <span class='pre'>cssSelector</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Returns false if not clicked. ...</div><div class='long'><p>Returns false if not clicked.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>cssSelector</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-executeScript' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Window'>Window</span><br/><a href='source/Window.html#Window-method-executeScript' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Window-method-executeScript' class='name expandable'>executeScript</a>( <span class='pre'>script, testArgs</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Executes a certain script into this window. ...</div><div class='long'><p>Executes a certain script into this window. You can provide the script\nas function or as a string. If the current window is not selected in the driver\nthen it will select and then run the script.\nIt will return the output of the script ran in this window.</p>\n\n<p>If you want to pass arguments to your function then use the <code>testArgs</code> argument.\nYou need EJSON to use this feature for now. @todo: Make EJSON as a plugin.</p>\n\n<pre><code>executeScript(function(data){return data.i;}, {i: 27});\n// Will return the value `27`.\n</code></pre>\n\n<p>The main benefit is that you are actually sending a function and not a string\nwhich allows you to have syntax highlight in the function you are sending to the\nclient side. Is also more readable than the selenium way.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>script</span> : Object<div class='sub-desc'></div></li><li><span class='pre'>testArgs</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-findEl' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Window'>Window</span><br/><a href='source/Window.html#Window-method-findEl' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Window-method-findEl' class='name expandable'>findEl</a>( <span class='pre'>cssSelector</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Finds an element in this window. ...</div><div class='long'><p>Finds an element in this window. It will automatically wrap the element\nreturned into a Element of our type.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>cssSelector</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-getTitle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Window'>Window</span><br/><a href='source/Window.html#Window-method-getTitle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Window-method-getTitle' class='name expandable'>getTitle</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Will switch to this window and go back to the driver's window. ...</div><div class='long'><p>Will switch to this window and go back to the driver's window.</p>\n</div></div></div><div id='method-goTo' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Window'>Window</span><br/><a href='source/Window.html#Window-method-goTo' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Window-method-goTo' class='name expandable'>goTo</a>( <span class='pre'>url</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Goes to a certain url. ...</div><div class='long'><p>Goes to a certain url. When ends the page should be loaded already.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>url</span> : Object<div class='sub-desc'></div></li></ul></div></div></div></div></div></div></div>","meta":{}});