function getCustomerEntityId(dataIn) {

//var JSONdataIn =  JSON.parse(dataIn);
	
var nlobj = nlapiLoadRecord(dataIn.recordtype,dataIn.id);

// var workflowStatus = nlapiInitiateWorkflow('journalentry',JSONdataIn.id,'customworkflow_je_approval');

return JSON.stringify(nlobj) ;
}



function postCustomerEntityId(dataIn)
{

    var nlobj = nlapiLoadRecord(dataIn.recordtype,dataIn.id);

    var response = '<font color="green">' +  nlobj.getFieldValue('entityid') + '</font>';
    
    return response;
}
