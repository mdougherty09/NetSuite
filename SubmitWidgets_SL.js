/**
 * Copyright NetSuite, Inc. 2018 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 May 2018     mvictoria
 * 
 */


// Constant Variables
var SCRIPT_NAME = 'customscript_mv_submit_widgets_cs';

var REC_WIDGETS = 'customrecord_mv_widget_items';

var FLD_WI_DESC = 'custrecord_mv_wi_description';
var FLD_WI_VALUE = 'custrecord_mv_wi_value';
var FLD_WI_TOTAL_VALUES = 'custrecord_mv_wi_total_values_submitted';
var FLD_WI_SUBMITTED_WIDGETS = 'custrecord_mv_wi_submitted_widgets';
var FLD_WI_APPROVER = 'custrecord_mv_wi_approver';

var FLD_ACTION = 'custpage_mv_action';
var FLD_TOTAL_VALUE = 'custpage_mv_total_value';

var SBL_WIDGETS = 'custpage_sbl_mv_widgets';

var COL_SELECT = 'custpage_col_select';
var COL_WIDGET_ID = 'custpage_col_widget_id';
var COL_NAME = 'custpage_col_name';
var COL_DESCRIPTION = 'custpage_col_description';
var COL_VALUE = 'custpage_col_value';

var BTN_SUBMIT = 'custpage_btn_mv_submit';

var HC_SUBMIT = 'mv_submit';


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */
function submitWidgets(request, response) {
    var sAction = request.getParameter(FLD_ACTION) || '';
    
    if (sAction == HC_SUBMIT) {
        sAction = '';
        processSelectedWidgets(request);
    } // end if
    
    var frm = nlapiCreateForm('Widgets', false);
    
    frm.addSubmitButton('Refresh');
    frm.addButton(BTN_SUBMIT, 'Submit', 'processSelectedWidgets()');
    
    var fldAction = frm.addField(FLD_ACTION, 'text', null);
    fldAction.setDisplayType('hidden');
    fldAction.setDefaultValue(sAction);

    var fldTotalValue = frm.addField(FLD_TOTAL_VALUE, 'currency', 'Total Selected Values');
    fldTotalValue.setDisplayType('disabled');
    fldTotalValue.setDefaultValue(0);
    
    var sblWidgets = frm.addSubList(SBL_WIDGETS, 'list', 'Widgets');
    
    sblWidgets.addField(COL_SELECT, 'checkbox', 'Select');
    sblWidgets.addField(COL_WIDGET_ID, 'text', 'Widget ID').setDisplayType('hidden');
    sblWidgets.addField(COL_NAME, 'text', 'Name');
    sblWidgets.addField(COL_DESCRIPTION, 'text', 'Description');
    sblWidgets.addField(COL_VALUE, 'currency', 'Value');
    
    var aWidgets = getWidgets();
    var oSearchResult;
    
    for (var i = 0; i < aWidgets.length; i++) {
        oSearchResult = aWidgets[i];
        
        sblWidgets.setLineItemValue(COL_WIDGET_ID, i+1, oSearchResult.getId());
        sblWidgets.setLineItemValue(COL_NAME, i+1, oSearchResult.getValue('name') || '');
        sblWidgets.setLineItemValue(COL_DESCRIPTION, i+1, oSearchResult.getValue(FLD_WI_DESC) || '');
        sblWidgets.setLineItemValue(COL_VALUE, i+1, parseFloat(oSearchResult.getValue(FLD_WI_VALUE) || '0'));
    } // end for
    
    frm.setScript(SCRIPT_NAME);
    response.writePage(frm);
} // end function submitWidgets


/**
 * @param {Object} request The request object of the Suitelet
 * @return {void}
 */
function processSelectedWidgets(request) {
    var sSelected;
    
    var aWidgetIDs = [];
    var idWidget;
    
    var fTotalValue = 0;
    var fValue;

    for (var i = 1; i <= request.getLineItemCount(SBL_WIDGETS); i++) {
        sSelected = request.getLineItemValue(SBL_WIDGETS, COL_SELECT, i) || '';
        idWidget = request.getLineItemValue(SBL_WIDGETS, COL_WIDGET_ID, i) || '';
        
        if (sSelected == 'T' && idWidget != '') {
            aWidgetIDs.push(idWidget);
            
            fValue = parseFloat(request.getLineItemValue(SBL_WIDGETS, COL_VALUE, i) || '0');
            fTotalValue += fValue;
        } // end if
    } // end for
    
    for (var i = 0; i < aWidgetIDs.length; i++) {
        idWidget = aWidgetIDs[i];
        
        // Update affected Widget records and save the Total Value and selected Widgets.
        nlapiSubmitField(REC_WIDGETS, idWidget, 
                [FLD_WI_TOTAL_VALUES, FLD_WI_SUBMITTED_WIDGETS, FLD_WI_APPROVER], 
                [fTotalValue, aWidgetIDs, '']);
    } // end for
} // end function processSelectedWidgets


/**
 * Get Widget Item records that are not yet submitted for approval.
 * 
 * @return {Array} aSearchResults Returns an array that contains the result of the search.
 */
function getWidgets() {
    var aSearchColumns = [];
    var aSearchFilters = [];
    
    aSearchColumns.push(new nlobjSearchColumn('name').setSort(false));
    aSearchColumns.push(new nlobjSearchColumn(FLD_WI_DESC));
    aSearchColumns.push(new nlobjSearchColumn(FLD_WI_VALUE));
    
    // Filter by "Submitted Widgets" equal to NONE
    aSearchFilters.push(new nlobjSearchFilter(FLD_WI_SUBMITTED_WIDGETS, null, 'anyof', '@NONE@'));
    
    var aSearchResults = nlapiSearchRecord(REC_WIDGETS, null, aSearchFilters, aSearchColumns) || [];
    
    return aSearchResults;
} // end function getWidgets

