function findBST2T(id) {
    var i;

	var frame = document.getElementById(id);
	if(frame)
	{
		return frame.contentWindow;
	}

	return null;
}

function sendInfoToBST2T(){
    try{
	var info = {
		brandShieldId:'d49fb2f55d7f418c932abc6ee5ada450',
		comparisonItems:[{name : 'cmp', value : 2097399},{name : 'plmt', value : 2097480}]
	};
	
	var msg = {
		action : 'notifyBrandShieldAdEntityInformation',
		bsAdEntityInformation : info
	};
	
	var msgString = window.JSON.stringify(msg);
	
	var bst2tWin = findBST2T('bst2t_405359829775');

    if(bst2tWin){
        bst2tWin.postMessage(msgString, '*');

        setTimeout(function(){bst2tWin.postMessage(msgString, '*');}, 100);

        setTimeout(function(){bst2tWin.postMessage(msgString, '*');}, 500);
    }
    } catch(err){}
}

setTimeout(function(){sendInfoToBST2T();}, 10);
__verify_callback_405359829775({
ResultID:2,
Passback:"",
AdWidth:728,
AdHeight:90});