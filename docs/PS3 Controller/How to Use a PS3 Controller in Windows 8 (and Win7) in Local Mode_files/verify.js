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
		brandShieldId:'d737576ece9a4254b585d161820831f1',
		comparisonItems:[{name : 'cmp', value : 2036965},{name : 'plmt', value : 2044332}]
	};
	
	var msg = {
		action : 'notifyBrandShieldAdEntityInformation',
		bsAdEntityInformation : info
	};
	
	var msgString = window.JSON.stringify(msg);
	
	var bst2tWin = findBST2T('bst2t_296280403388');

    if(bst2tWin){
        bst2tWin.postMessage(msgString, '*');

        setTimeout(function(){bst2tWin.postMessage(msgString, '*');}, 100);

        setTimeout(function(){bst2tWin.postMessage(msgString, '*');}, 500);
    }
    } catch(err){}
}

setTimeout(function(){sendInfoToBST2T();}, 10);
__verify_callback_296280403388({
ResultID:2,
Passback:"",
AdWidth:300,
AdHeight:250});