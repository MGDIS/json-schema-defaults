(function(root, factory) {

 'use strict';

  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define('json-schema-defaults', [], function() {
      return factory();
    });
  } else {
    // global with noConflict
    var jsonSchemaDefaults = root.jsonSchemaDefaults;
    root.jsonSchemaDefaults = factory();
    root.jsonSchemaDefaults.noConflict = function() {
      var defaults = root.jsonSchemaDefaults;
      root.jsonSchemaDefaults = jsonSchemaDefaults;
      return defaults;
    };
  }

}(this, function() {

  'use strict';

  var defaults = function(schema) {

    if (schema['default']) {

      return schema['default'];

    } else if (schema.type === 'object') {

      if (!schema.properties) { return {}; }

      for (var key in schema.properties) {
        if (schema.properties.hasOwnProperty(key)) {
          schema.properties[key] = defaults(schema.properties[key]);

          if (typeof schema.properties[key] === 'undefined') {
            delete schema.properties[key];
          }
        }
      }

      return schema.properties;

    } else if (schema.type === 'array') {

      if (!schema.items) { return []; }
      return [defaults(schema.items)];

    }

  };

  return defaults;

}));
