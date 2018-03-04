// --------------------------------
// Program flow:
// --------------------------------
// user enters url in config step
// connector fetches current performance data for sheet
// connector finds the ID of this url
// connector checks for this ID in cache, if there returns the archive spreadsheet url/id
// if archive url/id exists
//   connector fetches archived data for this url
//   also saves the latest round of data into the archive sheet
//   connector combines current data with archived data
//   returns full data to DS
// if no archive url/id exists: 
//   connector creates new Google Sheet for archiving, just for this audit url
//   connector copies new data into this google sheet
//   connector creates a daily trigger to fetch data for this url (and any others that are in this users cache)
//   connector stores the audit url and the archive url in users cache
//   returns the new row of data to DS


// --------------------------------
// other performance checks:
// --------------------------------
// conditional formatting
// vlookups
// index/match formulas
// number of charts


// --------------------------------
// Other to do items:
// --------------------------------
// Error handling if incorrect url entered
// don't have permission, not a google sheet url, blank, etc.



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
* @description Schema for the Google Sheets Performance Audit Data Connector
*/
var sheetsAuditSchema = [
  {
    name: 'sheet_name',
    label: 'Sheet name',
    description: 'Name of the individual tabs in your Google Sheet',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'sheet_cells',
    label: 'Sheet cell count',
    description: 'Count of the number of cells in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'sheet_rows',
    label: 'Sheet row count',
    description: 'Count of the number of rows in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'sheet_cols',
    label: 'Sheet column count',
    description: 'Count of the number of columns in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'data_cells_counter',
    label: 'Data cells count',
    description: 'Count of the number of cells containing data, in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'now_func_counter',
    label: 'NOW Function count',
    description: 'Count of the number NOW() functions in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'today_func_counter',
    label: 'TODAY Function count',
    description: 'Count of the number TODAY() functions in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'rand_func_counter',
    label: 'RAND Function count',
    description: 'Count of the number RAND() functions in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'randbetween_func_counter',
    label: 'RANDBETWEEN Function count',
    description: 'Count of the number RANDBETWEEN() functions in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'array_func_counter',
    label: 'Array Function count',
    description: 'Count of the number ArrayFormula() functions in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'total_cells',
    label: 'Total Cells',
    description: 'Count of the total number of cells in your whole Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: false
    }
  },
  {
    name: 'number_sheets',
    label: 'Number of Sheets',
    description: 'Count of the number of sheets in your whole Google Sheet',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: false
    }
  },
  {
    name: 'total_cell_percentage',
    label: 'Percent of Cell Limit',
    description: 'Total Cells expressed as a percentage of the Google Sheets Cell Limit of ' + SHEET_CELL_LIMIT,
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'PERCENT',
      isReaggregatable: false
    }
  },
  {
    name: 'sheet_load_time',
    label: 'Sheet Load Time',
    description: 'Time taken for Data Studio to fetch data for this Google Sheet, in minutes and seconds',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  }
];

 
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
  
  // get start time
  var startTime = new Date().getTime();
  
  // Get hold of user input parameters
  var url = request.configParams.url;
  
  // for testing
  //var url = "https://docs.google.com/spreadsheets/d/1hy4eMF6NJgUegxSP5Yfc50ZoqoKGB7lwvABocM4QZNM/edit#gid=0";
  
  var sheetsData = getSheetsData(url);
  
  // get end time
  var endTime = new Date().getTime();
  
  var sheetLoadTime = millisToMinutesAndSeconds(endTime - startTime);
  
  Logger.log(sheetsData);
  
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
        case 'data_cells_counter':
          values.push(sheetData.dataCellsCounter);
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
        case 'total_cells':
          values.push(sheetData.totalCells);
          break;
        case 'number_sheets':
          values.push(sheetData.numSheets);
          break;
        case 'total_cell_percentage':
          values.push(sheetData.totalCellPercent);
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
  

/**
* Get Sheets Data
* Returns array of data for a given sheet url
* @param {string} url - url of the Google Sheet to audit
* @returns {array} sheetsArray - data associated with this Sheet url
*/
function getSheetsData(url) {
  
  var ss = SpreadsheetApp.openByUrl(url);
  var sheets = ss.getSheets();
  
  var sheetsArray = [];
  var numSheets = 0;
  var totalCells = 0;
  
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
    var data_counter = r * c;
    
    if (data_counter !== 0) {
      
      var dataRange = sheet.getRange(1,1,r,c);
      
      var dataValues = dataRange.getValues();
      
      dataValues.forEach(function(row) {
        row.forEach(function(cell) {
          if (cell === "") {
            data_counter --;
          }
        });
      });  
    }
    
    // count how many volatile formulas
    var expFuncs = expensiveFunctions(sheet);
    
    // add data to temporary object
    var vals = {};
    vals["name"] = name;
    vals["sheetCells"] = sheetCells;
    vals["sheetRows"] = maxRows;
    vals["sheetCols"] = maxCols;
    vals["dataCellsCounter"] = data_counter;
    vals["nowFuncCount"] = expFuncs[0];
    vals["todayFuncCount"] = expFuncs[1];
    vals["randFuncCount"] = expFuncs[2];
    vals["randbetweenFuncCount"] = expFuncs[3];
    vals["arrayFuncCount"] = expFuncs[4];
    
    // push into sheetsArray
    sheetsArray.push(vals);
    
    // increment counters
    numSheets++;
    totalCells = totalCells + sheetCells;
    
  });
  
  // calculate total cells as percentage of Sheet Limit
  var totalCellPercent = (totalCells / SHEET_CELL_LIMIT) * 100;
  
  // Add Google Sheet level data
  sheetsArray.forEach(function(sheetArray) {
    sheetArray["totalCells"] = totalCells;
    sheetArray["numSheets"] = numSheets;
    sheetArray["totalCellPercent"] = totalCellPercent;
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
  var arrs = identifyArrayFormulas(sheet);
  vols.push(arrs);
  
  return vols;
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
function identifyArrayFormulas(sheet) {
  
  // how many cells have data in them
  var r = sheet.getLastRow();
  var c = sheet.getLastColumn();
  var data_counter = r * c;
  
  var arrayCounter = 0;
  var reArray = /.*ARRAYFORMULA.*/;
  
  if (data_counter !== 0) {
  
    var dataRange = sheet.getRange(1,1,r,c);    
    var formulaCells = dataRange.getFormulas();

    formulaCells.forEach(function(row) {
      row.forEach(function(cell) {
        if (cell.toUpperCase().match(reArray)) { 
          arrayCounter ++; 
        };
      });
    });    
  }
  
  return arrayCounter;

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



// ----------------------------------------
// WORKINGS
// ----------------------------------------

function testData() {
  
  //var url = "https://docs.google.com/spreadsheets/d/1hy4eMF6NJgUegxSP5Yfc50ZoqoKGB7lwvABocM4QZNM/edit#gid=0";
  var url = "https://docs.google.com/spreadsheets/d/1NiIpq4LUQrhF-zgmt8mjd6BFL79NcHyn2OrxdXGrO60/edit#gid=0";
  //var url = "https://docs.google.com/spreadsheets/d/1hy4eMF6NJgUegxSP5Yfc50ZoqoKGB7lwvABocM4QZNM/edit#gid=0";
  
  //var url = "https://drive.google.com/file/d/1VX67WduDFnj0tm60LVi5eY0n_Hf3lGum/view?usp=sharing"; // html file

  var sheetsData = listRevisions(url);
  
  Logger.log(sheetsData);
  
}


function listRevisions(url) {
  
  var ss = SpreadsheetApp.openByUrl(url);
  //var doc = DocumentApp.openByUrl(url);
  
  var fileId = ss.getId();
  
  // Drive is an advanced Google service
  // Need to enable before this works
  // https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services
  
  var revisions = Drive.Revisions.list(fileId);
  
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
}


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

Advanced Drive service Files API - Changes:
https://developers.google.com/drive/v2/reference/changes

Advanced Drive service Files API - Revisions:
https://developers.google.com/drive/v2/reference/revisions

re2 regex syntax:
https://github.com/google/re2/blob/master/doc/syntax.txt

Non-capturing groups explainer:
https://groups.google.com/forum/#!topic/golang-nuts/8Xmvar_ptcU


*/