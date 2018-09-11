/**
 * Google Data Connector, using the Open Notify API
 * Gets the current latitude and longitude of the International Space Station
 * 
 * API: http://api.open-notify.org
 * Endpoint: http://api.open-notify.org/iss-now.json
 * 
 * Ben Collins
 * 2018
 */


/**
* Returns Data Studio configuration settings
* @param {object} request - the request variable from Data Studio
* @returns {array} of configuration settings
*/
function getConfig(request) {
  var config = {
    configParams: []
  };
  return config;
};


/**
* @description Schema for the ISS Data Studio Community Connector
*/
var issSchema = [
  {
    name: 'timestamp',
    label: 'Timestamp',
    description: 'Epoch timestamp in seconds',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION',
      sematicType: 'DURATION',
    }
  },
  {
    name: 'latitude',
    label: 'Latitude',
    description: 'Latitude of the ISS returned via the API',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      sematicType: 'NUMBER',
      isReaggregatable: false
    }
  },
  {
    name: 'longitude',
    label: 'Longitude',
    description: 'Longitude of the ISS returned via the API',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      sematicType: 'NUMBER',
      isReaggregatable: false
    }
  },
  {
    name: 'position',
    label: 'Position',
    description: 'Combination of the latitude and longitude fields',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      sematicType: 'LATITUDE_LONGITUDE'
    }
  },
  {
    name: 'dsDate',
    label: 'Data Studio Date',
    description: 'Human readable date from the timestamp',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      sematicType: 'YEAR_MONTH_DAY'
    }
  }
];


/**
* Returns Data Studio schema
* @param {object} request - the request variable from Data Studio
* @returns {array} - the connector Schema
*/
function getSchema(request) {
  return {schema: issSchema};
};


/**
* Get Data
* Returns Data to Data Studio based on the request
* @param {object} request - the request variable from Data Studio
* @returns {array} with the schema and the data values, for Data Studio
*    in the form: [{values=[...]},{values=[...]},...]
*/
function getData(request) {
  
  // Set the url
  var url = 'http://api.open-notify.org/iss-now.json';
  
  // empty arrays for data
  var dataSchema = [];
  var data = [];
  var values = [];
  
  request.fields.forEach(function(field) {
    for (var i = 0; i < issSchema.length; i++) {
      if (issSchema[i].name === field.name) {
        dataSchema.push(issSchema[i]);
        break;
      }
    }
  });
  
  // Fetch the data
  // include error handling
  try {
    var response = JSON.parse(UrlFetchApp.fetch(url));
  } catch(e) {
    throw new Error("DS_USER: Unable to fetch the location data. Please try again later.");
  }
  
  // turn epoch timestamp into human readable date
  var date = new Date(response.timestamp * 1000);
  var dsDate = date.toISOString().slice(0,10).replace(/-/g,"");
  
  // select items from the response data to return to Data Studio
  dataSchema.forEach(function(field) {
    switch(field.name) {
      case 'timestamp':
        values.push(response.timestamp);
        break;
      case 'latitude':
        values.push(response.iss_position.latitude);
        break;
      case 'longitude':
        values.push(response.iss_position.longitude);
        break;
      case 'position':
        values.push(response.iss_position.latitude + "," + response.iss_position.longitude);
        break;
      case 'dsDate':
        values.push(dsDate);
        break;
      default:
        values.push('');
    }
  });
    
  data.push({
    values: values
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