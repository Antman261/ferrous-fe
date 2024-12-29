* html5 templates https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts
* https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id
Elements with ID attributes are available as global properties. The property name is the ID attribute, and the property value is the element. For example, given markup like:

HTML
Copy to Clipboard
<p id="preamble"></p>
You could access the paragraph element in JavaScript using code like:

JS
Copy to Clipboard
const content = window.preamble.textContent;

* https://www.abstractsyntaxseed.com/blog/defining-asts-with-dynamic-classes-in-javascript
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#improve_caching_by_mapping_away_hashed_filenames