/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define([ 'N/record','N/log','N/email','N/util' ], 


function(record) {
	return {
		post : function(restletBody) {
			var restletData = restletBody.data;
			for ( var item in restletData) {
				var objRecord = record.create({
					type : 'customrecord_item_items',
					isDynamic : true
				});
				var itemData = restletData[item];
				for ( var key in itemData) {
					if (itemData.hasOwnProperty(key)) {
						objRecord.setValue({
							fieldId : key,
							value : itemData[key]
						});
					}
				}
				var recordId = objRecord.save({
					enableSourcing : false,
					ignoreMandatoryFields : false
				});
				log.debug(recordId);
			}
		}
	}
});