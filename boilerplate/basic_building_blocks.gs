/**
 * The Building Blocks required for Data Studio Community Connector projects
 */

/**
* Returns Data Studio configuration settings
* @param {object} request - the request variable from Data Studio
* @returns {array} of configuration settings
*/
function getConfig(request) { }
 
/**
* @description Schema for the Data Studio Community Connector
*/
var fixedSchema = [ ];

/**
* Returns Data Studio schema
* @param {object} request - the request variable from Data Studio
* @returns {array} - the connector Schema
*/
function getSchema(request) { }

/**
* Get Data
* Returns Data to Data Studio based on the request
* @param {object} request - the request variable from Data Studio
* @returns {array} with the schema and the data values, for Data Studio
*    in the form: [{values=[...]},{values=[...]},...]
*/
function getData(request) { }

/**
* Authentication
* @returns {object} containing the authentication method used by the connector.
*/
function getAuthType() { }