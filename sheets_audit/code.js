// --------------------------------
// To do items:
// --------------------------------
// Error handling if incorrect url entered
// don't have permission, not a google sheet url, blank, etc.
// specific error if you don't have permission, so user can request it
// implement caching to improve performance for user


/** 
* Google Sheets Performance Auditor Data Studio Connector v1
* Built by Ben Collins, 2018
* https://www.benlcollins.com
*/


/**
* @description Constants for the Google Sheets Performance Audit Data Connector
*/
var SHEET_CELL_LIMIT = 2000000;


/**
* Returns Data Studio configuration settings
* @param {object} request - the request variable from Data Studio
* @returns {array} of configuration settings
*/
function getConfig(request) {
  var config = {
    configParams: [
      // input for Google Sheet url
      {
        name: 'url',
        displayName: 'Google Sheet Url',
        helpText: 'Enter the Google Sheet Url to perform the audit on.',
        placeholder: 'https://docs.google.com/spreadsheets/',
        isTextArea: false
      }
    ]
  };
  return config;
};

 
/**
* Returns Data Studio schema
* @param {object} request - the request variable from Data Studio
* @returns {array} sheetsAuditSchema - the Google Sheets Performance Audit Schema
*/
function getSchema(request) {
  return {schema: sheetsAuditSchema};
};
  

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


/**
* This checks whether the current user is an admin user of the connector.
*
* @returns {boolean} Returns true if the current authenticated user at the time
* of function execution is an admin user of the connector. If the function is
* omitted or if it returns false, then the current user will not be considered
* an admin user of the connector.
*/
function isAdminUser() {
  return true;
}


/**
* Get Data
* Returns Data to Data Studio based on the request
* @param {object} request - the request variable from Data Studio
* @returns {array} with the schema and the data values, for Data Studio
*    in the form: [{values=[...]},{values=[...]},...]
*/
function getData(request) {

  // Get hold of user input parameters
  var url = request.configParams.url;
  var fields = request.fields;
  
  // create an array of field names for handling revision v sheets logic
  var output = [];
  
  for (var i = 0; i < fields.length; i++) {
    output.push(fields[i].name.substr(0,8));
  }
  
  output = output.filter(function(x, i, a) {
    return a.indexOf(x) == i;
  });
  
  
  // Process request for revision data
  if (output.length === 1 && output[0] === "revision") {
    Logger.log("Revision fields data requested.");
    
    // Prepare the schema for the fields requested.
    var revisionSchema = [];
    
    request.fields.forEach(function(field) {
      for (var i=0; i < sheetsAuditSchema.length; i++) {
        if (sheetsAuditSchema[i].name == field.name) {
          revisionSchema.push(sheetsAuditSchema[i]);
          break;
        }
      }
    });
    
    // Prepare the tabular data.
    var data = [];
    
    // get the revision fields data
    // check for cached data first
    var cacheKey = "revisionFields" + url; // TO DO
    
    var revisionData = getCachedRevisions(url, cacheKey);
    
      
    //var revisionData = listAllRevisions(url);
    
    revisionData.forEach(function(revision) {
      var values = [];
      
      revisionSchema.forEach(function(field) {
        switch(field.name) {
          case 'revision_user_name':
            values.push(revision.revisionUsername);
            break;
          case 'revision_email':
            values.push(revision.revisionEmail);
            break;
          case 'revision_date':
            values.push(revision.revisionDate);
            break;
          case 'revision_date_hour':
            values.push(revision.revisionDateHour);
            break;
          case 'revision_id':
            values.push(revision.revisionId);
            break;
          case 'revision_arbNum':
            values.push(1);
            break;
          default:
            values.push('');
        }
      });
      data.push({
        values: values
      });
    });
    
    // return the revision data
    return {
      schema: revisionSchema,
      rows: data
    };
  }
  
  // Process request for Sheets fields data
  else if (output.indexOf("revision") === -1) {
    Logger.log("Sheets stuff only!");
    
    // get start time
    var startTime = new Date().getTime();
    
    // Open spreadsheet
    var ss = SpreadsheetApp.openByUrl(url);
    var fileName = ss.getName();
    var fileId = ss.getId();
    var sheets = ss.getSheets();
    
    // fetch the current data
    var sheetsData = getSheetsData(sheets);
    Logger.log(sheetsData);
    
    // get load time
    // this is just a proxy value, based on how long it took Data Studio to get data 
    var endTime = new Date().getTime();
    
    var sheetLoadTime = (endTime - startTime) / 1000; 
    
    var currentTimestamp = new Date();
    
    // Prepare the schema for the fields requested.
    var dataSchema = [];
    request.fields.forEach(function(field) {
      for (var i=0; i < sheetsAuditSchema.length; i++) {
        if (sheetsAuditSchema[i].name == field.name) {
          dataSchema.push(sheetsAuditSchema[i]);
          break;
        }
      }
    });
    
    // Prepare the tabular data.
    var data = [];
    
    sheetsData.forEach(function(sheetData) {
      var values = [];
      
      dataSchema.forEach(function(field) {
        switch(field.name) {
          case 'file_name':
            values.push(fileName);
            break;
          case 'sheet_name':
            values.push(sheetData.name);
            break;
          case 'sheet_cells':
            values.push(sheetData.sheetCells);
            break;
          case 'sheet_rows':
            values.push(sheetData.sheetRows);
            break;
          case 'sheet_cols':
            values.push(sheetData.sheetCols);
            break;
          case 'sheet_data_cells':
            values.push(sheetData.sheetDataCells);
            break;
          case 'now_func_counter':
            values.push(sheetData.nowFuncCount);
            break;
          case 'today_func_counter':
            values.push(sheetData.todayFuncCount);
            break;
          case 'rand_func_counter':
            values.push(sheetData.randFuncCount);
            break;
          case 'randbetween_func_counter':
            values.push(sheetData.randbetweenFuncCount);
            break;
          case 'array_func_counter':
            values.push(sheetData.arrayFuncCount);
            break;
          case 'vlookup_func_counter':
            values.push(sheetData.vlookupFuncCount);
            break;
          case 'chart_counter':
            values.push(sheetData.chartCount);
            break;
          case 'total_cells':
            values.push(sheetData.totalCells);
            break;
          case 'total_data_cells':
            values.push(sheetData.totalDataCells);
            break;
          case 'number_sheets':
            values.push(sheetData.numSheets);
            break;
          case 'total_cell_percentage':
            values.push(sheetData.totalCellPercent);
            break;
          case 'total_cell_percentage_100':
            values.push(sheetData.totalCellPercent);
            break;
          case 'total_data_cell_percentage':
            values.push(sheetData.totalDataCellPercent);
            break;
          case 'sheet_load_time':
            values.push(sheetLoadTime);
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
  
  // Mixed revision and Sheets fields error:
  else {
    // return custom error message
    throw new Error("DS_USER: Cannot combine Revision fields data and Sheets fields data in the same chart.");
  }
    
  
  
  
  /*
  var choice = request.fields.filter(function(field) {
    return field.name === "revision_arbNum";
  });
  
  Logger.log(choice);
  
  if (choice.length > 0) {
    // do something specific to return these cells
    Logger.log("user wants revision data!");
    
    // Prepare the schema for the fields requested.
    var revisionSchema = [];
    request.fields.forEach(function(field) {
      for (var i=0; i < sheetsAuditSchema.length; i++) {
        if (sheetsAuditSchema[i].name == field.name) {
          revisionSchema.push(sheetsAuditSchema[i]);
          break;
        }
      }
    });
    
    // Prepare the tabular data.
    var data = [];
    
    // get the revision data
    var revisionData = listAllRevisions(url);
    
    revisionData.forEach(function(revision) {
      var values = [];
      
      revisionSchema.forEach(function(field) {
        switch(field.name) {
          case 'revision_user_name':
            values.push(revision.revisionUsername);
            break;
          case 'revision_email':
            values.push(revision.revisionEmail);
            break;
          case 'revision_date':
            values.push(revision.revisionDate);
            break;
          case 'revision_date_hour':
            values.push(revision.revisionDateHour);
            break;
          case 'revision_id':
            values.push(revision.revisionId);
            break;
          case 'revision_arbNum':
            values.push(1);
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
      schema: revisionSchema,
      rows: data
    };
    
    
  }
  // TO DO 
  // Decide if I want to use this approach with the else, or just go with default
  else {
    Logger.log("Non-revision data for this chart");
  }
  
  
  // for testing
  //var url = "https://docs.google.com/spreadsheets/d/1UwOm6r-g5r1nLSUipBucLgUxzBtf2bkFAcbg0KEdgMc/edit#gid=0"
  //var url = "https://docs.google.com/spreadsheets/d/1hy4eMF6NJgUegxSP5Yfc50ZoqoKGB7lwvABocM4QZNM/edit#gid=0";
  //var url = "https://docs.google.com/spreadsheets/d/1krGeDAeJq-6rJsx34dSEWM2eOkqFKth222KBCl-eAho/edit#gid=0";
  
  // get start time
  var startTime = new Date().getTime();
  
  // Open spreadsheet
  var ss = SpreadsheetApp.openByUrl(url);
  var fileName = ss.getName();
  var fileId = ss.getId();
  var sheets = ss.getSheets();
  
  // fetch the current data
  var sheetsData = getSheetsData(sheets);
  Logger.log(sheetsData);
  
  // get load time
  // this is just a proxy value, based on how long it took Data Studio to get data
  // make into a callback?
  // will not add to archive, because triggered sheet work will not have an equivalent 
  var endTime = new Date().getTime();
  
  var sheetLoadTime = (endTime - startTime) / 1000; 
  
  var currentTimestamp = new Date();
  
  // -----------------------------------
  // DS Section - uncomment
  // -----------------------------------
  
  // Prepare the schema for the fields requested.
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i=0; i < sheetsAuditSchema.length; i++) {
      if (sheetsAuditSchema[i].name == field.name) {
        dataSchema.push(sheetsAuditSchema[i]);
        break;
      }
    }
  });

  // Prepare the tabular data.
  var data = [];
  
  sheetsData.forEach(function(sheetData) {
    var values = [];
    
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'file_name':
          values.push(fileName);
          break;
        case 'sheet_name':
          values.push(sheetData.name);
          break;
        case 'sheet_cells':
          values.push(sheetData.sheetCells);
          break;
        case 'sheet_rows':
          values.push(sheetData.sheetRows);
          break;
        case 'sheet_cols':
          values.push(sheetData.sheetCols);
          break;
        case 'sheet_data_cells':
          values.push(sheetData.sheetDataCells);
          break;
        case 'now_func_counter':
          values.push(sheetData.nowFuncCount);
          break;
        case 'today_func_counter':
          values.push(sheetData.todayFuncCount);
          break;
        case 'rand_func_counter':
          values.push(sheetData.randFuncCount);
          break;
        case 'randbetween_func_counter':
          values.push(sheetData.randbetweenFuncCount);
          break;
        case 'array_func_counter':
          values.push(sheetData.arrayFuncCount);
          break;
        case 'vlookup_func_counter':
          values.push(sheetData.vlookupFuncCount);
          break;
        case 'chart_counter':
          values.push(sheetData.chartCount);
          break;
        case 'total_cells':
          values.push(sheetData.totalCells);
          break;
        case 'total_data_cells':
          values.push(sheetData.totalDataCells);
          break;
        case 'number_sheets':
          values.push(sheetData.numSheets);
          break;
        case 'total_cell_percentage':
          values.push(sheetData.totalCellPercent);
          break;
        case 'total_cell_percentage_100':
          values.push(sheetData.totalCellPercent);
          break;
        case 'total_data_cell_percentage':
          values.push(sheetData.totalDataCellPercent);
          break;
        case 'sheet_load_time':
          values.push(sheetLoadTime);
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
  */
  
}
  

/**
* Get Sheets Data
* Returns array of data for a given sheet url
* @param {string} sheets - the Google Sheet object to audit
* @returns {array} sheetsArray - data associated with this Sheet url
*/
function getSheetsData(sheets) {
  
  var sheetsArray = [];
  var numSheets = 0;
  var totalCells = 0;
  var totalDataCells = 0;
  
  sheets.forEach(function(sheet) {
    
    // get name
    var name = sheet.getName();

    // how many cells in the sheet currently
    var maxRows = sheet.getMaxRows();
    var maxCols = sheet.getMaxColumns();
    var sheetCells = maxRows * maxCols;
    
    // how many cells have data in them
    var r = sheet.getLastRow();
    var c = sheet.getLastColumn();
    var sheetDataCells = r * c;
    
    if (sheetDataCells !== 0) {
      
      var dataRange = sheet.getRange(1,1,r,c);
      
      var dataValues = dataRange.getValues();
      
      dataValues.forEach(function(row) {
        row.forEach(function(cell) {
          if (cell === "") {
            sheetDataCells --;
          }
        });
      });  
    }
    
    // count how many volatile formulas
    var expFuncs = expensiveFunctions(sheet);
    
    // count how many charts in the sheet
    var chartCount = identifyCharts(sheet);
    
    // add data to temporary object
    var vals = {};
    vals["name"] = name;
    vals["sheetCells"] = sheetCells;
    vals["sheetRows"] = maxRows;
    vals["sheetCols"] = maxCols;
    vals["sheetDataCells"] = sheetDataCells;
    vals["nowFuncCount"] = expFuncs[0];
    vals["todayFuncCount"] = expFuncs[1];
    vals["randFuncCount"] = expFuncs[2];
    vals["randbetweenFuncCount"] = expFuncs[3];
    vals["arrayFuncCount"] = expFuncs[4];
    vals["vlookupFuncCount"] = expFuncs[5];
    vals["chartCount"] = chartCount;
    
    // push into sheetsArray
    sheetsArray.push(vals);
    
    // increment counters
    numSheets++;
    totalCells = totalCells + sheetCells;
    totalDataCells = totalDataCells + sheetDataCells;
    
  });
  
  // calculate total cells as percentage of Sheet Limit
  var totalCellPercent = (totalCells / SHEET_CELL_LIMIT);
  var totalDataCellPercent = (totalDataCells / SHEET_CELL_LIMIT);
  
  // Add Google Sheet level data
  sheetsArray.forEach(function(sheetArray) {
    sheetArray["totalCells"] = totalCells;
    sheetArray["totalDataCells"] = totalDataCells;
    sheetArray["numSheets"] = numSheets;
    sheetArray["totalCellPercent"] = totalCellPercent;
    sheetArray["totalDataCellPercent"] = totalDataCellPercent;
  });
  
  // return all the data
  return sheetsArray;
}


/**
* Get data on expensive functions
* Returns array of data for a given sheet (tab) of a Google Sheet
* @param {string} sheet - single sheet from the Google Sheet to audit
* @returns {array} vols - slow function count data associated with this sheet
*/
function expensiveFunctions(sheet) {
  
  var vols = identifyVolatiles(sheet);
  var arrs = identifyOtherFunctions(sheet);
  
  for (var i = 0; i < arrs.length; i++) {
    vols.push(arrs[i]);
  }
  
  //Logger.log("vols");
  //Logger.log(vols);
  
  return vols;
}


/**
* Identify charts
* Returns array of charts for a given sheet (tab) of a Google Sheet
* @param {string} sheet - single sheet from the Google Sheet to audit
* @returns {array} array of charts in this sheet
*/
function identifyCharts(sheet) {
  
  /*
  // testing
  var url = "https://docs.google.com/spreadsheets/d/1UwOm6r-g5r1nLSUipBucLgUxzBtf2bkFAcbg0KEdgMc/edit#gid=0";
  
  // Open spreadsheet
  var ss = SpreadsheetApp.openByUrl(url);
  var sheet = ss.getSheets()[0];
  */
  
  // how many charts in the sheet
  var charts = sheet.getCharts();
  
  return charts.length;
  
  /*
  // other possible options for future releases
  
  var chart = charts[0];
  
  var ranges = chart.getRanges();
  var containerInfo = chart.getContainerInfo();
  
  // Outputs
  
  Logger.log(charts.length);
  Logger.log("Anchor Column: %s\r\nAnchor Row %s\r\nOffset X %s\r\nOffset Y %s",
             containerInfo.getAnchorColumn(),
             containerInfo.getAnchorRow(),
             containerInfo.getOffsetX(),
             containerInfo.getOffsetY());
  Logger.log(chart.getOptions());
  
  for (var i in ranges) {
    var range = ranges[i];
    Logger.log(range.getA1Notation());
  }
  */
  
}


/**
* Identify volatile functions
* Returns array of data for a given sheet (tab) of a Google Sheet
* @param {string} sheet - single sheet from the Google Sheet to audit
* @returns {array} array of counts of volatile functions in this sheet
*/
function identifyVolatiles(sheet) {
  
  // how many cells have data in them
  var r = sheet.getLastRow();
  var c = sheet.getLastColumn();
  var data_counter = r * c;
  
  var nowCounter = 0;
  var todayCounter = 0;
  var randCounter = 0;
  var randbetweenCounter = 0;
  var reNow = /.*NOW.*/;
  var reToday = /.*TODAY.*/;
  var reRand = /.*RAND.*/;
  var reRandbetween = /.*RANDBETWEEN.*/;
  
  if (data_counter !== 0) {
  
    var dataRange = sheet.getRange(1,1,r,c);
    var formulaCells = dataRange.getFormulas();
    
    formulaCells.forEach(function(row) {
      row.forEach(function(cell) {
        if (cell.toUpperCase().match(reNow)) { nowCounter ++; };
        if (cell.toUpperCase().match(reToday)) { todayCounter++ };
        if (cell.toUpperCase().match(reRand) && !cell.toUpperCase().match(reRandbetween)) { randCounter++ };
        if (cell.toUpperCase().match(reRandbetween)) { randbetweenCounter++ }; 
      });
    });
  }
  
  return [nowCounter, todayCounter, randCounter, randbetweenCounter];
  
}


/**
* Identify array functions
* Returns array of data for a given sheet (tab) of a Google Sheet
* @param {string} sheet - single sheet from the Google Sheet to audit
* @returns {array} count of array functions in this sheet
*/
function identifyOtherFunctions(sheet) {
  
  // how many cells have data in them
  var r = sheet.getLastRow();
  var c = sheet.getLastColumn();
  var data_counter = r * c;
  
  var arrayCounter = 0;
  var vlookupCounter = 0;
  var reArray = /.*ARRAYFORMULA.*/;
  var reVlookup = /.*VLOOKUP.*/;
  
  if (data_counter !== 0) {
  
    var dataRange = sheet.getRange(1,1,r,c);    
    var formulaCells = dataRange.getFormulas();

    formulaCells.forEach(function(row) {
      row.forEach(function(cell) {
        if (cell.toUpperCase().match(reArray)) { arrayCounter ++; };
        if (cell.toUpperCase().match(reVlookup)) { vlookupCounter ++; };
      });
    });    
  }  
  return [arrayCounter, vlookupCounter];

}


/**
* Get revision history data for this url
* Returns array of revision data for a given Google Sheet url
* @param {string} url - url of the Google Sheet to audit
* @returns {array} of objects containing revision username, email, date, date+hour and Id.
*/
function getCachedRevisions(url, cacheKey) {
  
  var cache = CacheService.getUserCache();
  var cachedData = cache.get(cacheKey);
  
  if (cachedData !== null) {
    //var response = cachedData;
    Logger.log("Using cached data!!");
    try {
      var response = JSON.parse(cachedData);
    }
    catch(e) {
      throw new Error("DS_USER: Problem parsing cached data. Please contact connector administrator.");
    }
  }
  else {
    Logger.log("Fetching new data");
    try {
      var response = listAllRevisions(url);
      cache.put(cacheKey, JSON.stringify(response));
    }
    catch(e) {
      throw new Error("DS_USER: Cannot retrieve Drive Revision data.");
    }
  }
  return response;
}


/**
* Get revision history data for this url
* Returns array of revision data for a given Google Sheet url
* @param {string} url - url of the Google Sheet to audit
* @returns {array} of objects containing revision username, email, date, date+hour and Id.
*/
function listAllRevisions(url) {
  
  var ss = SpreadsheetApp.openByUrl(url);
  var fileId = ss.getId();
  
  var revisionData = [];
  var revisions = Drive.Revisions.list(fileId, { maxResults: 1000 });
  var items = revisions.items;
  
  Logger.log(items.length);
  
  for (var i = 0; i < items.length; i++) {
    
    var revision = {};
    revision["revisionUsername"] = items[i].lastModifyingUserName;
    revision["revisionEmail"] = items[i].lastModifyingUser.emailAddress;
    revision["revisionDate"] = dateToString(items[i].modifiedDate);
    revision["revisionDateHour"] = dateToStringHour(items[i].modifiedDate);
    revision["revisionId"] = items[i].id;
    
    revisionData.push(revision);
  }
  
  return revisionData;
}


/**
* Convert milliseconds to Minutes and Seconds
* @param {number} millis - milliseconds number
* @returns {string} minutes and seconds in format 4:37
*/
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


/**
* Convert array of names and array of values into object of key/value pairs
* https://stackoverflow.com/questions/1117916/merge-keys-array-and-values-array-into-an-object-in-javascript
* @param {array} names - these will be the keys in object
* @param {array} values - these will be the values in object
* @returns {object} object of key/value pairs
*/
function toObject(names, values) {
    var result = {};
    for (var i = 0; i < names.length; i++)
         result[names[i]] = values[i];
    return result;
}


/**
* Convert long date string to short date string YYYYMMDD
* @param {string} date e.g. format 2017-10-05T15:59:15.905Z
* @returns {string} date as a string in format YYYYMMDD
*/
function dateToString(string) {
  var year = string.substring(0,4);
  var month = string.substring(5,7);
  var day = string.substring(8,10);
  
  return year + month + day;
}


/**
* Convert long date string to YEAR_MONTH_DAY_HOUR YYYYMMDDHH
* @param {string} date e.g. format 2017-10-05T15:59:15.905Z
* @returns {string} date as a string in format YYYYMMDDHH
*/
function dateToStringHour(string) {
  var year = string.substring(0,4);
  var month = string.substring(5,7);
  var day = string.substring(8,10);
  var hour = string.substring(11,13);
  
  return year + month + day + hour;
}







// ----------------------------------------
// WORKINGS
// ----------------------------------------

function testData() {
  
  //var url = "https://docs.google.com/spreadsheets/d/1hy4eMF6NJgUegxSP5Yfc50ZoqoKGB7lwvABocM4QZNM/edit#gid=0";
  //var url = "https://docs.google.com/spreadsheets/d/1NiIpq4LUQrhF-zgmt8mjd6BFL79NcHyn2OrxdXGrO60/edit#gid=0";
  var url = "https://docs.google.com/spreadsheets/d/1q0LQonsLMIZfG9rd3aa-uu9UhFzps74eaHquBFtMxjc/edit#gid=150755882";

  var revisionsData = listAllRevisions(url);
  
  
  Logger.log(testResults);
  //Logger.log(testResults.items);
  
}

  
/*
  // TO DO: keep calling revisions whilst page token exists (really big spreadsheets)
  // inside main revision function
  if (revisions.nextPageToken > 0) {
    
    var token = revisions.nextPageToken; 
    Logger.log(token);
    
    var nextBatch = getRevisionsBatch(fileId,token);
    
    Logger.log(nextBatch);
  }
  */



// gets the next batch
function getRevisionsBatch(id, pageToken) {
  
  var revisionsBatch = Drive.Revisions.list(fileId, 
                                       { 
                                         maxResults: 1000,
                                         pageToken: pageToken
                                       });
  return revisionsBatch;
  
}


/*
// attempts to delve into revisions, open old sheets, get files sizes
// did not really lead anywhere
// do not appear to be available
  
  if (revisions.items && revisions.items.length > 0) {
    
    Logger.log(revisions.items.length);
    //Logger.log(revisions);

    for (var i = 0; i < revisions.items.length; i++) {
    //for (var i = 0; i < 2; i++) {
      var revision = revisions.items[i];
      
      var last_user = revision.lastModifyingUser.displayName;
      var last_user_email = revision.lastModifyingUser.emailAddress;
      var last_user_picture_url = revision.lastModifyingUser.picture;
      
      var self_link = revision.selfLink;
      
      var re = /files\/(.*)/;
      
      var revision_filepath = self_link.match(re);
      
      //Logger.log(file_ID);
      //Logger.log(file_ID[1]);
      //Logger.log(file_ID[2]);
      
      var revision_id = revision.id;
      
      var revision_url = "https://docs.google.com/spreadsheets/d/" + revision_filepath[1];
      Logger.log(revision_url);
      
      var revision_data = getSheetsData(revision_url);
      Logger.log("revision data");
      Logger.log(revision_data);
      
      
      
      Logger.log(revision_id);
      
      //getRevision(fileId,revision_id);
      
      //getChanges(fileId);
      
      //var revision_data = getSheetsData(revision_url); // doesn't look like I can do this :(
      //Logger.log(revision_data);
      
      //var date = new Date(revision.modifiedDate);
      
      //Logger.log('Date: %s, File size (bytes): %s', date.toLocaleString(), revision.fileSize);
    }

  } else {
    Logger.log('No revisions found.');
  }
*/


// get data for a particular revision
// still not giving me anything extra
function getRevision(fileId, revisionId) {
  
  var request = Drive.Revisions.get(fileId, revisionId);
  
  Logger.log(typeof request);
  Logger.log(request.length);
  Logger.log(request);
  
  /*
  request.execute(function(resp) {
    console.log('Revision ID: ' + resp.id);
    console.log('Modified Date: ' + resp.modifiedDate);
    if (resp.pinned) {
      console.log('This revision is pinned');
    }
  });
  */
}


// can I find the change matching the revision ids above??
function getChanges(fileId) {
  /*
  var request = Drive.Changes.list({
    'changeId': 156913
  });
  */
  var request = Drive.Changes.list();
  
  request.items.forEach(function(change,i) {
    
    Logger.log(i);
    Logger.log(change.modificationDate);
    Logger.log(change.file.lastModifyingUserName);
    
  });
    
  
  Logger.log(request);
  Logger.log(request.items.length);
  Logger.log(request.items[1]);
  
}


  /*
  // Section for keeping archives in an archive Google Sheet
  //
  // get user properties
  var userProperties = PropertiesService.getUserProperties();
  //Logger.log(userProperties.getProperties());
  //userProperties.deleteAllProperties(); // TO DO: comment out for running script
  
  var propertyIds = userProperties.getKeys();

  //Logger.log(propertyIds);
  
  // see if archive sheet exists for this url, by checking if this url id is a key in the properties service
  var archived = propertyIds.filter(function(key) {
    return key === sheetId;
  });
  
  //Logger.log(archived);
  
  // archive sheet exists
  if (archived.length > 0) {
    
    Logger.log("archive not null");
    
    // open the archive sheet to get the archived data
    var archiveId = userProperties.getProperty(archived[0]);   
    var archiveSs = SpreadsheetApp.openById(archiveId);
    var archiveSheet = archiveSs.getActiveSheet();
    
    // connector fetches archived data for this url
    var heads = archiveSheet.getDataRange().offset(0,0,1).getValues()[0];  // https://mashe.hawksey.info/2018/02/google-apps-script-patterns-writing-rows-of-data-to-google-sheets/
    Logger.log(heads.length);
    
    var archiveDataArray = archiveSheet.getRange(2,1,archiveSheet.getLastRow() - 1,archiveSheet.getLastColumn()).getValues();
    Logger.log("archiveDataArray");
    Logger.log(archiveDataArray);
    
    // connector combines current data with archived data
    var archiveDataArrayOfObjects = [];
    for (var i = 0; i < archiveDataArray.length; i++) {
      var archiveDataObject = toObject(heads, archiveDataArray[i]);  // converts to object with key/value pairs
      archiveDataArrayOfObjects.push(archiveDataObject);
    }
    Logger.log(" ");
    Logger.log("archiveDataArrayOfObjects");
    Logger.log(archiveDataArrayOfObjects);
    
    // add archive data to sheets data, for Data Studio
    sheetsData.concat(archiveDataObject);
    Logger.log(" ");
    Logger.log("allData");
    Logger.log(sheetsData);
    
    // also saves the latest round of data into the archive sheet
    // TO DO: need to add a timestamp
    var archiveTimestamp = new Date();
    
    var newRows = sheetsData.map(function(row) {
      return heads.map(function(cell) {
        return (cell === "Timestamp") ? archiveTimestamp : row[cell];
      });
    });
    
    Logger.log(newRows.length);
    Logger.log(newRows[0].length);
    Logger.log(newRows);
    
    archiveSheet.getRange(archiveSheet.getLastRow() + 1,1,sheetsData.length,heads.length).setValues(newRows);
    
  }
  // no archived data yet
  else {
    
    Logger.log("archive null");
    
    // create a new archive spreadsheet
    // using the Drive API
    var name = "Archive - " + sheetName;
    var folderId = "1hu87u1tGOgrIB72is4AxgvMxxjPnGRD1";
    
    var resource = {
      title: name,
      mimeType: MimeType.GOOGLE_SHEETS,
      parents: [{ id: folderId }]
    };
    
    var fileJson = Drive.Files.insert(resource);
    
    // make note of ID of archive sheet
    var archiveId = fileJson.id;
    
    //var archiveId = "1lfdwMHrkWsrav2i9g1qoDcAicjb_7sCDzQCMtdnEN4Q";
    //Logger.log(archiveId);
    
    // open spreadsheet and add header row
    var archiveSs = SpreadsheetApp.openById(archiveId);
    var archiveSheet = archiveSs.getActiveSheet();
    var headers = Object.keys(sheetsData[0]);
    var headers = Object.keys(sheetsData[0]);
    headers.push("Timetsamp");
    //Logger.log(headers);
    
    archiveSheet.getRange(1,1,1,headers.length).setValues([headers]);
      
    // add current data to archive sheet
    var currentTimestamp = new Date();
    
    var newRows = sheetsData.map(function(row) {
      return headers.map(function(cell) {
        return (cell === "Timestamp") ? currentTimestamp : row[cell];
      });
    });
    
    archiveSheet.getRange(2,1,sheetsData.length,headers.length).setValues(newRows);
    
    // add this archive ID alongside this audit ID to the properties store
    userProperties.setProperty(sheetId, archiveId);
    
  }
  
  // -----------------------------------
  // Auto Trigger section
  // -----------------------------------
  // very first time script runs, create time trigger (once a day default)
  // runs function to:
  // get all the user properties (audit url + archive url pairs)
  // gets new round of performance data for audit url
  // adds to the relevant archive url
  
  
  
  // -----------------------------------
  // End trigger section
  // -----------------------------------
  

  */
                        
                        
// https://docs.google.com/spreadsheets/d/1NiIpq4LUQrhF-zgmt8mjd6BFL79NcHyn2OrxdXGrO60/edit#gid=0?revision=1


/* 
Useful links for google refs:

https://developers.google.com/datastudio/connector/gallery/

Data Studio reference:
https://developers.google.com/datastudio/connector/reference

GData API Directory:
https://developers.google.com/gdata/docs/directory

Apps Script Drive service:
https://developers.google.com/apps-script/reference/drive/

Advanced Google Services enbabling:
https://developers.google.com/apps-script/guides/services/advanced

Advanced Drive service Files API:
https://developers.google.com/drive/v2/reference/files

// Drive is an advanced Google service
// Need to enable before this works
// https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services

Advanced Drive service Files API - Changes:
https://developers.google.com/drive/v2/reference/changes

Advanced Drive service Files API - Revisions:
https://developers.google.com/drive/v2/reference/revisions

re2 regex syntax:
https://github.com/google/re2/blob/master/doc/syntax.txt

Non-capturing groups explainer:
https://groups.google.com/forum/#!topic/golang-nuts/8Xmvar_ptcU

List a file's comments:
https://developers.google.com/drive/v3/reference/comments/list

Replies to comments:
https://developers.google.com/drive/v3/reference/replies/list

*/