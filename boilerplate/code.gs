/**
 * Boilerplate code 
 * Required for Data Studio Community Connector projects
 */


/**
* Returns Data Studio configuration settings
* @param {object} request - the request variable from Data Studio
* @returns {array} of configuration settings
*/
function getConfig(request) {
  var config = {
    configParams: [
      {
        name: '',
        displayName: '',
        helpText: '',
        placeholder: ''
      }
    ]
  };
  return config;
}
 

/**
* @description Schema for the Data Studio Community Connector
*/
var fixedSchema = [
  {
    name: '',
    label: '',
    description: '',
    group: '',
    dataType: '',
    semantics: {
      conceptType: '',
      semanticType: '',
      semanticGroup: ''
    }
  }
];


/**
* Returns Data Studio schema
* @param {object} request - the request variable from Data Studio
* @returns {array} - the connector Schema
*/
function getSchema(request) {
  return {schema: fixedSchema};
}


/**
* Get Data
* Returns Data to Data Studio based on the request
* @param {object} request - the request variable from Data Studio
* @returns {array} with the schema and the data values, for Data Studio
*    in the form: [{values=[...]},{values=[...]},...]
*/
function getData(request) {
  
  var url = '';

  // Fetch the data.
  // By default URL fetch will throw an exception if the response code indicates failure.
  var response = UrlFetchApp.fetch(url);
  var responseData = JSON.parse(response.getContentText());

  // Prepare the schema for the fields requested.
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i=0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name == field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });

  // Prepare the tabular data.
  var data = [];
  
  responseData.forEach(function(item) {
    var values = [];
    
    // Provide values in the order defined by the schema.
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case '':
          values.push(item.name);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };
}


/**
* Authentication
* @returns {object} containing the authentication method used by the connector.
*/
function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
}