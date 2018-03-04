// Google Data Studio Community Connector, using the Open Notify API
// http://api.open-notify.org/iss-now.json

function getConfig(request) {
  var config = {
    configParams: []
  };
  return config;
};

var issSchema = [
  {
    name: 'timestamp',
    label: 'Timestamp',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'latitude',
    label: 'Latitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC'
    }
  },
  {
    name: 'longitude',
    label: 'Longitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC'
    }
  },
  // this arbitrary number is fixed and used to give a value to the location of the space station for plotting on the Geo map
  {
    name: 'arbNum',
    label: 'Arbitrary Number',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC'
    }
  },
  {
    name: 'position',
    label: 'Position',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'dsDate',
    label: 'Data Studio Date',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  }
];

function getSchema(request) {
  return {schema: issSchema};
};

function getData(request) {
  Logger.log(request);
  
  var dataSchema = [];
  
  request.fields.forEach(function(field) {
    for (var i = 0; i < issSchema.length; i++) {
      if (issSchema[i].name === field.name) {
        dataSchema.push(issSchema[i]);
        break;
      }
    }
  });
  
  Logger.log(dataSchema);
  
  var url = 'http://api.open-notify.org/iss-now.json';
  var response = JSON.parse(UrlFetchApp.fetch(url));
  
  // Logger.log(response); // what comes back from the Open Notify API
  // {iss_position={latitude=-9.3766, longitude=-128.4282}, message=success, timestamp=1502477201}
  
  // turn epoch timestamp into human readable date
  var date = new Date(response.timestamp * 1000);
  var dsDate = date.toISOString().slice(0,10).replace(/-/g,"");
  
  // select items from the response data to return to Data Studio
  var data = [];
  var values = [];
  
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
      case 'arbNum':
        values.push('1');
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
  Logger.log(values);
    
  data.push({
    values: values
  });
  
  Logger.log(data); // show the data that is being sent to Data Studio

  return {
    schema: dataSchema,
    rows: data
  };
};

function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
}


