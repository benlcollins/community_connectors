/**
* @description Schema for the Google Sheets Performance Audit Data Connector
*/
var sheetsAuditSchema = [
  {
    name: 'file_name',
    label: 'Google Sheet filename',
    description: 'Name of your Google Sheet',
    dataType: 'STRING',
    group: 'totals',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'sheet_name',
    label: 'Sheet name',
    description: 'Name of the individual tabs in your Google Sheet',
    dataType: 'STRING',
    group: 'sheet',
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
    group: 'sheet',
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
    group: 'sheet',
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
    group: 'sheet',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'sheet_data_cells',
    label: 'Sheet data cell count',
    description: 'Count of the number of cells containing data, in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    group: 'sheet',
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
    group: 'sheet_formulas',
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
    group: 'sheet_formulas',
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
    group: 'sheet_formulas',
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
    group: 'sheet_formulas',
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
    group: 'sheet_formulas',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'vlookup_func_counter',
    label: 'Vlookup Function count',
    description: 'Count of the number VLOOKUP() functions in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    group: 'sheet_formulas',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  },
  {
    name: 'chart_counter',
    label: 'Chart count',
    description: 'Count of the number of charts in a single tab of your Google Sheet',
    dataType: 'NUMBER',
    group: 'sheet_formulas',
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
    group: 'totals',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: false
    }
  },
  {
    name: 'total_data_cells',
    label: 'Total Data Cells',
    description: 'Count of the total number of cells containing data in your whole Google Sheet',
    dataType: 'NUMBER',
    group: 'totals',
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
    group: 'totals',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: false
    }
  },
  {
    name: 'total_cell_percentage',
    label: 'Total Cells as Percent of Cell Limit',
    description: 'Total Cells expressed as a percentage of the Google Sheets Cell Limit of ' + SHEET_CELL_LIMIT,
    dataType: 'NUMBER',
    group: 'totals',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'PERCENT',
      isReaggregatable: false
    }
  },
  {
    name: 'total_cell_percentage_100',
    label: 'Total Cells / Cell Limit * 100',
    description: 'Total Cells / Cell Limit of '  + SHEET_CELL_LIMIT + ' * 100',
    dataType: 'NUMBER',
    group: 'totals',
    formula: 'total_cell_percentage * 100',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'PERCENT',
      isReaggregatable: false
    }
  },
  {
    name: 'total_data_cell_percentage',
    label: 'Data Cells as Percent of Cell Limit',
    description: 'Total Data Cells expressed as a percentage of the Google Sheets Cell Limit of ' + SHEET_CELL_LIMIT,
    dataType: 'NUMBER',
    group: 'totals',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'PERCENT',
      isReaggregatable: false
    }
  },
  {
    name: 'sheet_load_time',
    label: 'Sheet Load Time',
    description: 'Time taken for Data Studio to fetch data for this Google Sheet, in seconds',
    dataType: 'NUMBER',
    group: 'totals',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'DURATION',
      isReaggregatable: false
    }
  },
  {
    name: 'revision_user_name',
    label: 'Revision User Name',
    description: 'Name of the user who made this revision',
    dataType: 'STRING',
    group: 'revision',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'revision_email',
    label: 'Revision Email',
    description: 'Email of the user who made this revision',
    dataType: 'STRING',
    group: 'revision',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'revision_date',
    label: 'Revision Date',
    description: 'The date of a specific revision (in format YYYYMMDD eg 20170314)',
    dataType: 'STRING',
    group: 'revision',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'YEAR_MONTH_DAY',
      semanticGroup: 'DATETIME'
    }
  },
  {
    name: 'revision_date_hour',
    label: 'Revision Date Hour',
    description: 'The date and hour of a specific revision (in format YYYYMMDDHH eg 2017031415)',
    dataType: 'STRING',
    group: 'revision',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'YEAR_MONTH_DAY_HOUR',
      semanticGroup: 'DATETIME'
    }
  },
  {
    name: 'revision_id',
    label: 'Revision ID',
    description: 'ID of this revision',
    dataType: 'STRING',
    group: 'revision',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'revision_arbNum',
    label: 'Revision Count',
    description: 'Fixed number 1 for this revision for aggregations',
    dataType: 'NUMBER',
    group: 'revision',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    }
  }
  
];
