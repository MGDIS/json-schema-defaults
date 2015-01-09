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

  var isObject = function (item) {
    return typeof item === 'object' && item.toString() === {}.toString();
  };

  var clone = function (source) {
    var target = {};
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(source[key])) {
          target[key] = clone(source[key]);
        } else {
          target[key] = source[key];
        }

      }
    }
    return target;
  };

  var assign = function (target, source) {
    target = clone(target);

    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(target[key]) && isObject(source[key])) {
          target[key] = assign(target[key], source[key]);
        } else {
          target[key] = source[key];
        }

      }
    }
    return target;
  };


  var getLocalRef = function (path, root) {
    path = path.replace(/^#\/definitions\//, '').split('/');

    var find = function (path, root) {
        var key = path.shift();
        if (!root[key]) {
          return {};
        } else if(!path.length) {
          return root[key];
        } else {
          return find(path, root[key]);
        }
    };

    var result = find(path, root);

    if (!isObject(result)) {
      return result;
    }
    return clone(result);
  };


  var mergeAllOf = function (allOfList, root) {
    var length = allOfList.length,
        index = -1,
        result = {};

    while (++index < length) {
      var item = allOfList[index];

      item = (typeof item['$ref'] !== 'undefined') ? getLocalRef(item['$ref'], root) : item;

      result = assign(result, item);
    }

    return result;
  };


  var defaults = function(schema, definitions) {

    if (typeof definitions === 'undefined') {
      definitions = schema.definitions;
    }

    if (typeof schema['allOf'] !== 'undefined') {
      var mergedItem = mergeAllOf(schema['allOf'], definitions);
      return defaults(mergedItem, definitions);
    }

    if (typeof schema['$ref'] !== 'undefined') {
      var reference = getLocalRef(schema['$ref'], definitions);
      return defaults(reference, definitions);
    }

    if (typeof schema['default'] !== 'undefined') {

      return schema['default'];

    } else if (schema.type === 'object') {

      if (!schema.properties) { return {}; }

      for (var key in schema.properties) {
        if (schema.properties.hasOwnProperty(key)) {
          schema.properties[key] = defaults(schema.properties[key], definitions);

          if (typeof schema.properties[key] === 'undefined') {
            delete schema.properties[key];
          }
        }
      }

      return schema.properties;

    } else if (schema.type === 'array') {

      if (!schema.items) { return []; }
      return [defaults(schema.items, definitions)];

    }

  };

  return defaults;

}));
