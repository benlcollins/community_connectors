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
    var cacheKey = "revisionFields" + url;
    Logger.log(cacheKey);
    var revisionData = getCachedRevisions(url, cacheKey);
    
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
    
    // fetch the current data
    // check for cached data first
    var cacheKey = "sheetsFields" + url;
    Logger.log(cacheKey);
    var sheetsData = getCachedSheetsData(url, cacheKey);
    
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
            values.push(sheetData.fileName);
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
            values.push(sheetData.sheetLoadTime);
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
   
}
  

/**
* Get Sheets Data from Cache
* Returns array of data for a given sheet url
* @param {string} url - the Google Sheet url to audit
* @param {string} cacheKey - the cache key for this url for Sheets Fields
* @returns {array} sheetsArray - data associated with this Sheet url
*/
function getCachedSheetsData(url, cacheKey) {
  
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
      var response = getSheetsData(url);
      cache.put(cacheKey, JSON.stringify(response));
    }
    catch(e) {
      throw new Error("DS_USER: Cannot retrieve Sheets data.");
    }
  }
  return response;
}

/**
* Get Sheets Data
* Returns array of data for a given sheet url
* @param {string} sheets - the Google Sheet object to audit
* @returns {array} sheetsArray - data associated with this Sheet url
*/
function getSheetsData(url) {
  
  // get start time
  var startTime = new Date().getTime();
  
  // Open spreadsheet
  var ss = SpreadsheetApp.openByUrl(url);
  var fileName = ss.getName();
  var sheets = ss.getSheets();
  
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
  
  // get load time
  // this is just a proxy value, based on how long it took Data Studio to get data 
  var endTime = new Date().getTime();
  var sheetLoadTime = (endTime - startTime) / 1000;
  
  // Add Google Sheet level data
  sheetsArray.forEach(function(sheetArray) {
    sheetArray["totalCells"] = totalCells;
    sheetArray["totalDataCells"] = totalDataCells;
    sheetArray["numSheets"] = numSheets;
    sheetArray["totalCellPercent"] = totalCellPercent;
    sheetArray["totalDataCellPercent"] = totalDataCellPercent;
    sheetArray["fileName"] = fileName;
    sheetArray["sheetLoadTime"] = sheetLoadTime;
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
  
  return vols;
}


/**
* Identify charts
* Returns array of charts for a given sheet (tab) of a Google Sheet
* @param {string} sheet - single sheet from the Google Sheet to audit
* @returns {array} array of charts in this sheet
*/
function identifyCharts(sheet) {
  
  // how many charts in the sheet
  var charts = sheet.getCharts(); 
  return charts.length;
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
* Get Revisions Data from Cache
* Returns array of revisions data for a given sheet url
* @param {string} url - the Google Sheet url to audit
* @param {string} cacheKey - the cache key for this url for Revisions Fields
* @returns {array} array - revisions data associated with this Sheet url
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
