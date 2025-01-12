# Architecture

...

Primary role of frontend framework:

* Provide API to: Map a state object to logical "view" components, then components to DOM
* Update components -> Dom in response to state changes
* Issue commands in response to user action

## Principles

* Unidirectional state
* No JS renderer; User's implementation updates DOM 
* Framework binds state updates to component callbacks
* Prefer event emitters
* Simplify using [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements), [shadow dom](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM), [templates, and slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots).
* Browsers are better maintained and auto-updating; target previous year's ES, e.g. ES2024 in 2025 

## Implementation

* Exclusively use [Autonomous custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#types_of_custom_element)
* Use browser modules

## Questions

* Provide build functionality? Might only [add filename hashes and import maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#improve_caching_by_mapping_away_hashed_filenames)
* Use styled-components or [css imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#loading_non-javascript_resources)?
* Provide a server for production? Probably; enables an experience where everything "just works"
  * Could "build" client by creating a binary running a web server that delivers FE

## References

* https://github.com/facebook/react/issues/11171