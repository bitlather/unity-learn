function dv_rolloutManager(handlersDefsArray, baseHandler) {
    this.handle = function () {
        var errorsArr = [];

        var handler = chooseEvaluationHandler(handlersDefsArray);
        if (handler) {
            var errorObj = handleSpecificHandler(handler);
            if (errorObj === null)
                return errorsArr;
            else {
                handler.onFailure();
                errorsArr.push(errorObj);
            }
        }

        var errorObjHandler = handleSpecificHandler(baseHandler);
        if (errorObjHandler) {
            errorObjHandler['dvp_isLostImp'] = 1;
            errorsArr.push(errorObjHandler);
        }
        return errorsArr;
    }

    function handleSpecificHandler(handler) {
        var url;
        var errorObj = null;

        try {
            url = handler.createRequest();
            if (url) {
                if (!handler.sendRequest(url))
                    errorObj = createAndGetError('sendRequest failed.', url, handler.getVersion(), handler.getVersionParamName(), handler.dv_script);
            }
            else
                errorObj = createAndGetError('createRequest failed.', url, handler.getVersion(), handler.getVersionParamName(), handler.dv_script);
        }
        catch (e) {
            errorObj = createAndGetError(e.name + ': ' + e.message, url, handler.getVersion(), handler.getVersionParamName(), (handler ? handler.dv_script : null));
        }

        return errorObj;
    }

    function createAndGetError(error, url, ver, versionParamName, dv_script) {
        var errorObj = {};
        errorObj[versionParamName] = ver;
        errorObj['dvp_jsErrMsg'] = encodeURIComponent(error);
        if (dv_script && dv_script.parentElement && dv_script.parentElement.tagName && dv_script.parentElement.tagName == 'HEAD')
            errorObj['dvp_isOnHead'] = '1';
        if (url)
            errorObj['dvp_jsErrUrl'] = url;
        return errorObj;
    }

    function chooseEvaluationHandler(handlersArray) {
        var rand = Math.random() * 100;
        for (var i = 0; i < handlersArray.length; i++) {
            if (rand >= handlersArray[i].minRate && rand < handlersArray[i].maxRate) {
                if (handlersArray[i].handler.isApplicable())
                    return handlersArray[i].handler;
                else
                    break;
            }
        }
        return null;
    }    
}

function getCurrentTime() {
    "use strict";
    if (Date.now) {
        return Date.now();
    }
    return (new Date()).getTime();
}

function doesBrowserSupportHTML5Push() {
    "use strict";
    return typeof window.parent.postMessage === 'function' && window.JSON;
}

function dv_GetParam(url, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS, 'i');
    var results = regex.exec(url);
    if (results == null)
        return null;
    else
        return results[1];
}

function dv_GetKeyValue(url) {
    var keyReg = new RegExp(".*=");
    var keyRet = url.match(keyReg)[0];
    keyRet = keyRet.replace("=", "");

    var valReg = new RegExp("=.*");
    var valRet = url.match(valReg)[0];
    valRet = valRet.replace("=", "");

    return { key: keyRet, value: valRet };
}

function dv_Contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function dv_GetDynamicParams(url, prefix) {
    try {
        prefix = (prefix != undefined && prefix != null) ? prefix : 'dvp';
        var regex = new RegExp("[\\?&](" + prefix + "_[^&]*=[^&#]*)", "gi");
        var dvParams = regex.exec(url);

        var results = [];
        while (dvParams != null) {
            results.push(dvParams[1]);
            dvParams = regex.exec(url);
        }
        return results;
    }
    catch (e) {
        return [];
    }
}

function dv_createIframe() {
    var iframe;
    if (document.createElement && (iframe = document.createElement('iframe'))) {
        iframe.name = iframe.id = 'iframe_' + Math.floor((Math.random() + "") * 1000000000000);
        iframe.width = 0;
        iframe.height = 0;
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
    }

    return iframe;
}

function dv_GetRnd() {
    return ((new Date()).getTime() + "" + Math.floor(Math.random() * 1000000)).substr(0, 16);
}

function dv_SendErrorImp(serverUrl, errorsArr) {

    for (var j = 0; j < errorsArr.length; j++) {
        var errorObj = errorsArr[j];
        var errorImp = dv_CreateAndGetErrorImp(serverUrl, errorObj);
        dv_sendImgImp(errorImp);
    }
}

function dv_CreateAndGetErrorImp(serverUrl, errorObj) {
    var errorQueryString = '';
    for (var key in errorObj) {
        if (errorObj.hasOwnProperty(key)) {
            if (key.indexOf('dvp_jsErrUrl') == -1) {
                errorQueryString += '&' + key + '=' + errorObj[key];
            } else {
                var params = ['ctx', 'cmp', 'plc', 'sid'];
                for (var i = 0; i < params.length; i++) {
                    var pvalue = dv_GetParam(errorObj[key], params[i]);
                    if (pvalue) {
                        errorQueryString += '&dvp_js' + params[i] + '=' + pvalue;
                    }
                }
            }
        }
    }

    return window._dv_win.location.protocol + '//' + serverUrl + errorQueryString;
}

function dv_sendImgImp(url) {
    (new Image()).src = url;
}

function dv_getPropSafe(obj, propName) {
    try {
        if (obj)
            return obj[propName];
    } catch (e) { }
}

function dvType() {
    var that = this;
    this.t2tEventDataZombie = {};

    this.processT2TEvent = function (data, tag) {
        try {
            if (tag.ServerPublicDns) {
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;

                if (!tag.uniquePageViewId) {
                    tag.uniquePageViewId = data.uniquePageViewId;
                }

                tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
                $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
            }
        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tProcess=1', { dvp_jsErrMsg: encodeURIComponent(e) });
            } catch (ex) { }
        }
    };

    this.processTagToTagCollision = function (collision, tag) {
        var i;
        for (i = 0; i < collision.eventsToFire.length; i++) {
            this.pubSub.publish(collision.eventsToFire[i], tag.uid);
        }
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        tpsServerUrl += '&colltid=' + collision.allReasonsForTagBitFlag;

        for (i = 0; i < collision.reasons.length; i++) {
            var reason = collision.reasons[i];
            tpsServerUrl += '&' + reason.name + "ms=" + reason.milliseconds;
        }

        if (collision.thisTag) {
            tpsServerUrl += '&tlts=' + collision.thisTag.t2tLoadTime;
        }
        if (tag.uniquePageViewId) {
            tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
        }
        $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    this.processBSIdFound = function (bsID, tag) {
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        tpsServerUrl += '&bsimpid=' + bsID;
        if (tag.uniquePageViewId) {
            tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
        }
        $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    var messageEventListener = function (event) {
        try {
            var timeCalled = getCurrentTime();
            var data = window.JSON.parse(event.data);
            if (!data.action) {
                data = window.JSON.parse(data);
            }
            var myUID;
            var visitJSHasBeenCalledForThisTag = false;
            if ($dv.tags) {
                for (var uid in $dv.tags) {
                    if ($dv.tags.hasOwnProperty(uid) && $dv.tags[uid] && $dv.tags[uid].t2tIframeId === data.iFrameId) {
                        myUID = uid;
                        visitJSHasBeenCalledForThisTag = true;
                        break;
                    }
                }
            }

            var tag;
            switch (data.action) {
                case 'uniquePageViewIdDetermination':
                    if (visitJSHasBeenCalledForThisTag) {
                        $dv.processT2TEvent(data, $dv.tags[myUID]);
                        $dv.t2tEventDataZombie[data.iFrameId] = undefined;
                    }
                    else {
                        data.wasZombie = 1;
                        $dv.t2tEventDataZombie[data.iFrameId] = data;
                    }
                    break;
                case 'maColl':
                    tag = $dv.tags[myUID];
                    if (!tag.uniquePageViewId) { tag.uniquePageViewId = data.uniquePageViewId; }
                    data.collision.commonRecievedTS = timeCalled;
                    $dv.processTagToTagCollision(data.collision, tag);
                    break;
                case 'bsIdFound':
                    tag = $dv.tags[myUID];
                    if (!tag.uniquePageViewId) { tag.uniquePageViewId = data.uniquePageViewId; }
                    $dv.processBSIdFound(data.id, tag);
                    break;
            }

        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tListener=1', { dvp_jsErrMsg: encodeURIComponent(e) });
            } catch (ex) { }
        }
    };

    if (window.addEventListener)
        addEventListener("message", messageEventListener, false);
    else
        attachEvent("onmessage", messageEventListener);

    this.pubSub = new function () {

        var subscribers = [];

        this.subscribe = function (eventName, uid, actionName, func) {
            if (!subscribers[eventName + uid])
                subscribers[eventName + uid] = [];
            subscribers[eventName + uid].push({ Func: func, ActionName: actionName });
        }

        this.publish = function (eventName, uid) {
            var actionsResults = [];
            if (eventName && uid && subscribers[eventName + uid] instanceof Array)
                for (var i = 0; i < subscribers[eventName + uid].length; i++) {
                    var funcObject = subscribers[eventName + uid][i];
                    if (funcObject && funcObject.Func && typeof funcObject.Func == "function" && funcObject.ActionName) {
                        var isSucceeded = runSafely(function () {
                            return funcObject.Func(uid);
                        });
                        actionsResults.push(encodeURIComponent(funcObject.ActionName) + '=' + (isSucceeded ? '1' : '0'));
                    }
                }
            return actionsResults.join('&');
        }
    };

    this.domUtilities = new function () {

        this.addImage = function (url, parentElement) {
            var image = parentElement.ownerDocument.createElement("img");
            image.width = 0;
            image.height = 0;
            image.style.display = 'none';
            image.src = appendCacheBuster(url);
            parentElement.insertBefore(image, parentElement.firstChild);
        };

        this.addScriptResource = function (url, parentElement) {
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.src = appendCacheBuster(url);
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addScriptCode = function (srcCode, parentElement) {
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.innerHTML = srcCode;
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addHtml = function (srcHtml, parentElement) {
            var divElem = parentElement.ownerDocument.createElement("div");
            divElem.style = "display: inline";
            divElem.innerHTML = srcHtml;
            parentElement.insertBefore(divElem, parentElement.firstChild);
        }
    };

    this.resolveMacros = function (str, tag) {
        var viewabilityData = tag.getViewabilityData();
        var viewabilityBuckets = viewabilityData && viewabilityData.buckets ? viewabilityData.buckets : {};
        var upperCaseObj = objectsToUpperCase(tag, viewabilityData, viewabilityBuckets);
        var newStr = str.replace('[DV_PROTOCOL]', upperCaseObj.DV_PROTOCOL);
        newStr = newStr.replace('[PROTOCOL]', upperCaseObj.PROTOCOL);
        newStr = newStr.replace(/\[(.*?)\]/g, function (match, p1) {
            var value = upperCaseObj[p1];
            if (value === undefined || value === null)
                value = '[' + p1 + ']';
            return encodeURIComponent(value);
        });
        return newStr;
    };

    this.settings = new function () {
    };

    this.tagsType = function () { };

    this.tagsPrototype = function () {
        this.add = function (tagKey, obj) {
            if (!that.tags[tagKey])
                that.tags[tagKey] = new that.tag();
            for (var key in obj)
                that.tags[tagKey][key] = obj[key];
        }
    };

    this.tagsType.prototype = new this.tagsPrototype();
    this.tagsType.prototype.constructor = this.tags;
    this.tags = new this.tagsType();

    this.tag = function () { }
    this.tagPrototype = function () {
        this.set = function (obj) {
            for (var key in obj)
                this[key] = obj[key];
        }

        this.getViewabilityData = function () {
        }
    };

    this.tag.prototype = new this.tagPrototype();
    this.tag.prototype.constructor = this.tag;

    this.registerEventCall = function (impressionId, values, timeoutMs) {
        var url = this.tags[impressionId].protocol + '//' + this.tags[impressionId].ServerPublicDns + "/event.gif?impid=" + impressionId + '&' + createQueryStringParams(values);
        this.domUtilities.addImage(url, $dv.tags[impressionId].tagElement.parentNode);
    };

    var createQueryStringParams = function (values) {
        var params = '';
        for (var key in values) {
            if (typeof values[key] !== 'function') {
                var value = encodeURIComponent(values[key]);
                if (params === '')
                    params += key + '=' + value;
                else
                    params += '&' + key + '=' + value;
            }
        }

        return params;
    };

    this.Enums = {
        BrowserId: { Others: 0, IE: 1, Firefox: 2, Chrome: 3, Opera: 4, Safari: 5 },
        TrafficScenario: { OnPage: 1, SameDomain: 2, CrossDomain: 128 }
    };

    this.CommonData = {};

    var runSafely = function (action) {
        try {
            var ret = action();
            return ret !== undefined ? ret : true;
        } catch (e) { return false; }
    };

    var objectsToUpperCase = function () {
        var upperCaseObj = {};
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    upperCaseObj[key.toUpperCase()] = obj[key];
                }
            }
        }
        return upperCaseObj;
    };

    var appendCacheBuster = function (url) {
        if (url !== undefined && url !== null && url.match("^http") == "http") {
            if (url.indexOf('?') !== -1) {
                if (url.slice(-1) == '&')
                    url += 'cbust=' + dv_GetRnd();
                else
                    url += '&cbust=' + dv_GetRnd();
            }
            else
                url += '?cbust=' + dv_GetRnd();
        }
        return url;
    };
}


function dv_handler35(){function t(b){var a;if(document.createElement&&(a=document.createElement("iframe")))a.name=a.id=window._dv_win.dv_config.emptyIframeID||"iframe_"+Math.floor(1E12*(Math.random()+"")),a.width=0,a.height=0,a.style.display="none",a.src=b;return a}function x(b){var a={};try{for(var c=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),d=c.exec(b);null!=d;)"eparams"!==d[1]&&(a[d[1]]=d[2]),d=c.exec(b);return a}catch(i){return a}}function y(b){try{if(1>=b.depth)return{url:"",depth:""};var a,c=[];
c.push({win:window._dv_win.top,depth:0});for(var d,i=1,g=0;0<i&&100>g;){try{if(g++,d=c.shift(),i--,0<d.win.location.toString().length&&d.win!=b)return 0==d.win.document.referrer.length||0==d.depth?{url:d.win.location,depth:d.depth}:{url:d.win.document.referrer,depth:d.depth-1}}catch(l){}a=d.win.frames.length;for(var q=0;q<a;q++)c.push({win:d.win.frames[q],depth:d.depth+1}),i++}return{url:"",depth:""}}catch(f){return{url:"",depth:""}}}function u(b){var a=String(),c,d,i;for(c=0;c<b.length;c++)i=b.charAt(c),
d="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(i),0<=d&&(i="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((d+47)%94)),a+=i;return a}function z(){var b=window._dv_win.$dv.Enums.BrowserId,a=function(a){var b=a.indexOf(this.versionSearchString);if(-1!=b)return parseFloat(a.substring(b+this.versionSearchString.length+1))},c={ID:b.Others,version:0};c.ID=function(a){switch(a){case "Explorer":return b.IE;
case "Firefox":return b.Firefox;case "Chrome":return b.Chrome;case "Opera":return b.Opera;case "Safari":return b.Safari;default:return 0}}(function(a){for(var b=0;b<a.length;b++){var c=a[b].string,l=a[b].prop;this.versionSearchString=a[b].versionSearch||a[b].identity;if(c){if(-1!=c.indexOf(a[b].subString))return a[b].identity}else if(l)return a[b].identity}}([{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",
identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,
subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Trident/7",identity:"Explorer",versionSearch:"rv"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}]))||b.Others;c.version=a(navigator.userAgent)||a(navigator.appVersion)||"";return c}this.createRequest=function(){var b=!1,a=window._dv_win,c=0,d=!1,i=getCurrentTime();window._dv_win.t2tTimestampData=
[{dvTagCreated:i}];var g,l,q="https:"===window._dv_win.location.protocol?"https:":"http:",f=doesBrowserSupportHTML5Push();if(f)try{l=t(window._dv_win.dv_config.t2turl||"https://cdn3.doubleverify.com/t2tv4.html"),document.body.insertBefore(l,document.body.firstChild)}catch(C){}try{for(g=0;10>=g;g++)if(null!=a.parent&&a.parent!=a)if(0<a.parent.location.toString().length)a=a.parent,c++,b=!0;else{b=!1;break}else{0==g&&(b=!0);break}}catch(D){b=!1}0==a.document.referrer.length?b=a.location:b?b=a.location:
(b=a.document.referrer,d=!0);var n=null,v=null;window._dv_win.external&&(n=void 0!=window._dv_win.external.QueuePageID?window._dv_win.external.QueuePageID:null,v=void 0!=window._dv_win.external.CrawlerUrl?window._dv_win.external.CrawlerUrl:null);window._dv_win._dvScripts||(window._dv_win._dvScripts=[]);var j=document.getElementsByTagName("script");for(g in j){var e=j[g].src,k=window._dv_win.dv_config.reqex||/^[ \t]*(http(s)?:\/\/)?[a-z\-]*cdn(s)?\.doubleverify\.com:?[0-9]*\/dvtp_src.js/;if(e&&e.match(k)&&
!dv_Contains(window._dv_win._dvScripts,j[g])){this.dv_script=j[g];window._dv_win._dvScripts.push(j[g]);var j=dv_GetParam(e,"region")||"",w="http:";g="0";"https"==e.match("^https")&&"https"==window._dv_win.location.toString().match("^https")&&(w="https:",g="1");try{for(var h=k=a,p=0;10>p&&h!=window._dv_win.top;)p++,h=h.parent;k.depth=p;var m=y(a);dv_aUrlParam="&aUrl="+encodeURIComponent(m.url);dv_aUrlDepth="&aUrlD="+m.depth;dv_referrerDepth=a.depth+c;d&&a.depth--}catch(E){dv_aUrlDepth=dv_aUrlParam=
dv_referrerDepth=a.depth=""}c=dv_GetDynamicParams(e,"dvp");d=dv_GetDynamicParams(e,"dvpx");for(m=0;m<d.length;m++)k=dv_GetKeyValue(d[m]),d[m]=k.key+"="+encodeURIComponent(k.value);"41"==j&&(j=50>100*Math.random()?"41":"8",c.push("dvp_region="+j));c=c.join("&");d=d.join("&");j=window._dv_win.dv_config.tpsAddress||"tps"+j+".doubleverify.com";m="visit.js";1==dv_GetParam(e,"dvapi")&&(m="dvvisit.js");k="";h=dv_GetParam(e,"xff");null!=h&&(k+="&xff="+h);h=dv_GetParam(e,"useragent");null!=h&&(k+="&useragent="+
h);for(var h="ctx cmp ipos sid plc adid crt btreg btadsrv adsrv advid num pid crtname unit chnl uid scusrid turl".split(" "),p=[],r=0;r<h.length;r++)p.push(h[r]+"="+(dv_GetParam(e,h[r])||""));var h=p.join("&"),A=e,e=(window._dv_win.dv_config.visitJSURL||w+"//"+j+"/"+m)+"?"+h+"&dvtagver=6.1.src&srcurlD="+a.depth+"&curl="+(null==v?"":encodeURIComponent(v))+"&qpgid="+(null==n?"":n)+"&ssl="+g+"&refD="+dv_referrerDepth+k+"&htmlmsging="+(f?"1":"0");"http:"==e.match("^http:")&&"https"==window._dv_win.location.toString().match("^https")&&
(e+="&dvp_diffSSL=1");c&&(e+="&"+c);d&&(e+="&"+d);a="srcurl="+encodeURIComponent(b);if((f=window._dv_win[u("=@42E:@?")][u("2?46DE@C~C:8:?D")])&&0<f.length){b=[];b[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(n=0;n<f.length;n++)b[n+1]=f[n];f=b.reverse().join(",")}else f=null;f&&(a+="&ancChain="+encodeURIComponent(f));f=dv_GetParam(e,"uid");null==f?(f=dv_GetRnd(),e+="&uid="+f):(f=dv_GetRnd(),e=e.replace(/([?&]uid=)(?:[^&])*/i,"$1"+f));f=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&
7>=new Number(RegExp.$1)&&(f=2E3);b=navigator.userAgent.toLowerCase();if(-1<b.indexOf("webkit")||-1<b.indexOf("chrome"))b="&referrer="+encodeURIComponent(window._dv_win.location),e.length+b.length<=f&&(e+=b);dv_aUrlParam.length+dv_aUrlDepth.length+e.length<=f&&(e+=dv_aUrlDepth,a+=dv_aUrlParam);e+="&"+this.getVersionParamName()+"="+this.getVersion();e+="&eparams="+encodeURIComponent(u(a));void 0!=window._dv_win.$dv.CommonData.BrowserId&&void 0!=window._dv_win.$dv.CommonData.BrowserVersion?a={ID:window._dv_win.$dv.CommonData.BrowserId,
version:window._dv_win.$dv.CommonData.BrowserVersion}:(a=z(),window._dv_win.$dv.CommonData.BrowserId=a.ID,window._dv_win.$dv.CommonData.BrowserVersion=a.version);e+="&brid="+a.ID+"&brver="+a.version;void 0!=window._dv_win.$dv.CommonData.Scenario?a=window._dv_win.$dv.CommonData.Scenario:(a=this.getTrafficScenarioType(),window._dv_win.$dv.CommonData.Scenario=a);var e=e+("&tstype="+a),s="";try{window.top==window?s="1":window.top.location.host==window.location.host&&(s="2")}catch(F){s="3"}var a="dvCallback_"+
(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():dv_GetRnd()),B=this.dv_script;window._dv_win[a]=function(a,b,c,d){var f=getCurrentTime();b.$uid=c;b=x(A);a.tags.add(c,b);b=x(e);a.tags[c].set(b);a.tags[c].beginVisitCallbackTS=f;a.tags[c].set({tagElement:B,dv_protocol:w,protocol:q,uid:c});a.tags[c].ImpressionServedTime=getCurrentTime();a.tags[c].getTimeDiff=function(){return(new Date).getTime()-this.ImpressionServedTime};try{"undefined"!=typeof d&&null!==
d&&(a.tags[c].ServerPublicDns=d),a.tags[c].adServingScenario=s,a.tags[c].t2tIframeCreationTime=i,a.tags[c].t2tProcessed=!1,a.tags[c].t2tIframeId=l.id,a.tags[c].t2tIframeWindow=l.contentWindow,$dv.t2tEventDataZombie[l.id]&&(a.tags[c].uniquePageViewId=$dv.t2tEventDataZombie[l.id].uniquePageViewId,$dv.processT2TEvent($dv.t2tEventDataZombie[l.id],a.tags[c]))}catch(g){}};return e+"&jsCallback="+a}}};this.sendRequest=function(b){var a;a=this.getVersionParamName();var c=this.getVersion(),d={};d[a]=c;d.dvp_jsErrUrl=
b;d.dvp_jsErrMsg=encodeURIComponent("Error loading visit.js");window._dv_win.dv_config=window._dv_win.dv_config||{};window._dv_win.dv_config.tpsErrAddress=window._dv_win.dv_config.tpsAddress||"tps30.doubleverify.com";a='try{ script.onerror = function(){ try{(new Image()).src = "'+dv_CreateAndGetErrorImp(window._dv_win.dv_config.tpsErrAddress+"/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&dvp_isLostImp=1",d)+'";}catch(e){}}}catch(e){}';a='<html><head></head><body><script id="TPSCall" type="text/javascript" src="'+
b+'"><\/script><script type="text/javascript">var script = document.getElementById("TPSCall"); if (script && script.readyState) { script.onreadystatechange = function() { if (script.readyState == "complete") document.close(); } } else document.close(); '+a+"<\/script></body></html>";c=t("about:blank");this.dv_script.id=c.id.replace("iframe","script");dv_GetParam(b,"uid");document.body.insertBefore(c,document.body.firstChild);b=dv_getPropSafe(c,"contentDocument")||dv_getPropSafe(dv_getPropSafe(c,"contentWindow"),
"document")||dv_getPropSafe(window._dv_win.frames[c.name],"document");window._dv_win.t2tTimestampData.push({beforeVisitCall:getCurrentTime()});if(b){b.open();if(c=c.contentWindow||window._dv_win.frames[c.name])c.$dv=window._dv_win.$dv;b.write(a)}else b='javascript: (function(){document.open(); document.domain="'+window.document.domain+"\"; window.$dv = window.parent.$dv; document.write('"+encodeURIComponent(a)+"');})()",c=t(b),this.dv_script.id=c.id.replace("iframe","script"),document.body.insertBefore(c,
document.body.firstChild);return!0};this.isApplicable=function(){return!0};this.onFailure=function(){var b=window._dv_win._dvScripts,a=this.dv_script;null!=b&&(void 0!=b&&a)&&(a=b.indexOf(a),-1!=a&&b.splice(a,1))};this.getTrafficScenarioType=function(){var b=window._dv_win.$dv.Enums.TrafficScenario;try{if(window.top==window)return b.OnPage;if(window.top.document.domain==window.document.domain)return b.SameDomain}catch(a){}return b.CrossDomain};this.getVersionParamName=function(){return"jsver"};this.getVersion=
function(){return"35"}};


function dv_baseHandler(){function t(b){var a;if(document.createElement&&(a=document.createElement("iframe")))a.name=a.id=window._dv_win.dv_config.emptyIframeID||"iframe_"+Math.floor(1E12*(Math.random()+"")),a.width=0,a.height=0,a.style.display="none",a.src=b;return a}function x(b){var a={};try{for(var c=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),d=c.exec(b);null!=d;)"eparams"!==d[1]&&(a[d[1]]=d[2]),d=c.exec(b);return a}catch(i){return a}}function y(b){try{if(1>=b.depth)return{url:"",depth:""};var a,c=
[];c.push({win:window._dv_win.top,depth:0});for(var d,i=1,g=0;0<i&&100>g;){try{if(g++,d=c.shift(),i--,0<d.win.location.toString().length&&d.win!=b)return 0==d.win.document.referrer.length||0==d.depth?{url:d.win.location,depth:d.depth}:{url:d.win.document.referrer,depth:d.depth-1}}catch(l){}a=d.win.frames.length;for(var q=0;q<a;q++)c.push({win:d.win.frames[q],depth:d.depth+1}),i++}return{url:"",depth:""}}catch(f){return{url:"",depth:""}}}function u(b){var a=String(),c,d,i;for(c=0;c<b.length;c++)i=
b.charAt(c),d="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(i),0<=d&&(i="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((d+47)%94)),a+=i;return a}function z(){var b=window._dv_win.$dv.Enums.BrowserId,a=function(a){var b=a.indexOf(this.versionSearchString);if(-1!=b)return parseFloat(a.substring(b+this.versionSearchString.length+1))},c={ID:b.Others,version:0};c.ID=function(a){switch(a){case "Explorer":return b.IE;
case "Firefox":return b.Firefox;case "Chrome":return b.Chrome;case "Opera":return b.Opera;case "Safari":return b.Safari;default:return 0}}(function(a){for(var b=0;b<a.length;b++){var c=a[b].string,l=a[b].prop;this.versionSearchString=a[b].versionSearch||a[b].identity;if(c){if(-1!=c.indexOf(a[b].subString))return a[b].identity}else if(l)return a[b].identity}}([{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",
identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,
subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Trident/7",identity:"Explorer",versionSearch:"rv"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}]))||b.Others;c.version=a(navigator.userAgent)||a(navigator.appVersion)||"";return c}this.createRequest=function(){var b=!1,a=window._dv_win,c=0,d=!1,i=getCurrentTime();window._dv_win.t2tTimestampData=
[{dvTagCreated:i}];var g,l,q="https:"===window._dv_win.location.protocol?"https:":"http:",f=doesBrowserSupportHTML5Push();if(f)try{l=t(window._dv_win.dv_config.t2turl||"https://cdn3.doubleverify.com/t2tv3.html"),document.body.insertBefore(l,document.body.firstChild)}catch(C){}try{for(g=0;10>=g;g++)if(null!=a.parent&&a.parent!=a)if(0<a.parent.location.toString().length)a=a.parent,c++,b=!0;else{b=!1;break}else{0==g&&(b=!0);break}}catch(D){b=!1}0==a.document.referrer.length?b=a.location:b?b=a.location:
(b=a.document.referrer,d=!0);var n=null,v=null;window._dv_win.external&&(n=void 0!=window._dv_win.external.QueuePageID?window._dv_win.external.QueuePageID:null,v=void 0!=window._dv_win.external.CrawlerUrl?window._dv_win.external.CrawlerUrl:null);window._dv_win._dvScripts||(window._dv_win._dvScripts=[]);var j=document.getElementsByTagName("script");for(g in j){var e=j[g].src,k=window._dv_win.dv_config.reqex||/^[ \t]*(http(s)?:\/\/)?[a-z\-]*cdn(s)?\.doubleverify\.com:?[0-9]*\/dvtp_src.js/;if(e&&e.match(k)&&
!dv_Contains(window._dv_win._dvScripts,j[g])){this.dv_script=j[g];window._dv_win._dvScripts.push(j[g]);var j=dv_GetParam(e,"region")||"",w="http:";g="0";"https"==e.match("^https")&&"https"==window._dv_win.location.toString().match("^https")&&(w="https:",g="1");try{for(var h=k=a,p=0;10>p&&h!=window._dv_win.top;)p++,h=h.parent;k.depth=p;var m=y(a);dv_aUrlParam="&aUrl="+encodeURIComponent(m.url);dv_aUrlDepth="&aUrlD="+m.depth;dv_referrerDepth=a.depth+c;d&&a.depth--}catch(E){dv_aUrlDepth=dv_aUrlParam=
dv_referrerDepth=a.depth=""}c=dv_GetDynamicParams(e,"dvp");d=dv_GetDynamicParams(e,"dvpx");for(m=0;m<d.length;m++)k=dv_GetKeyValue(d[m]),d[m]=k.key+"="+encodeURIComponent(k.value);"41"==j&&(j=50>100*Math.random()?"41":"8",c.push("dvp_region="+j));c=c.join("&");d=d.join("&");j=window._dv_win.dv_config.tpsAddress||"tps"+j+".doubleverify.com";m="visit.js";1==dv_GetParam(e,"dvapi")&&(m="dvvisit.js");k="";h=dv_GetParam(e,"xff");null!=h&&(k+="&xff="+h);h=dv_GetParam(e,"useragent");null!=h&&(k+="&useragent="+
h);for(var h="ctx cmp ipos sid plc adid crt btreg btadsrv adsrv advid num pid crtname unit chnl uid scusrid turl".split(" "),p=[],r=0;r<h.length;r++)p.push(h[r]+"="+(dv_GetParam(e,h[r])||""));var h=p.join("&"),A=e,e=(window._dv_win.dv_config.visitJSURL||w+"//"+j+"/"+m)+"?"+h+"&dvtagver=6.1.src&srcurlD="+a.depth+"&curl="+(null==v?"":encodeURIComponent(v))+"&qpgid="+(null==n?"":n)+"&ssl="+g+"&refD="+dv_referrerDepth+k+"&htmlmsging="+(f?"1":"0");"http:"==e.match("^http:")&&"https"==window._dv_win.location.toString().match("^https")&&
(e+="&dvp_diffSSL=1");c&&(e+="&"+c);d&&(e+="&"+d);a="srcurl="+encodeURIComponent(b);if((f=window._dv_win[u("=@42E:@?")][u("2?46DE@C~C:8:?D")])&&0<f.length){b=[];b[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(n=0;n<f.length;n++)b[n+1]=f[n];f=b.reverse().join(",")}else f=null;f&&(a+="&ancChain="+encodeURIComponent(f));f=dv_GetParam(e,"uid");null==f?(f=dv_GetRnd(),e+="&uid="+f):(f=dv_GetRnd(),e=e.replace(/([?&]uid=)(?:[^&])*/i,"$1"+f));f=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&
7>=new Number(RegExp.$1)&&(f=2E3);b=navigator.userAgent.toLowerCase();if(-1<b.indexOf("webkit")||-1<b.indexOf("chrome"))b="&referrer="+encodeURIComponent(window._dv_win.location),e.length+b.length<=f&&(e+=b);dv_aUrlParam.length+dv_aUrlDepth.length+e.length<=f&&(e+=dv_aUrlDepth,a+=dv_aUrlParam);e+="&"+this.getVersionParamName()+"="+this.getVersion();e+="&eparams="+encodeURIComponent(u(a));void 0!=window._dv_win.$dv.CommonData.BrowserId&&void 0!=window._dv_win.$dv.CommonData.BrowserVersion?a={ID:window._dv_win.$dv.CommonData.BrowserId,
version:window._dv_win.$dv.CommonData.BrowserVersion}:(a=z(),window._dv_win.$dv.CommonData.BrowserId=a.ID,window._dv_win.$dv.CommonData.BrowserVersion=a.version);e+="&brid="+a.ID+"&brver="+a.version;void 0!=window._dv_win.$dv.CommonData.Scenario?a=window._dv_win.$dv.CommonData.Scenario:(a=this.getTrafficScenarioType(),window._dv_win.$dv.CommonData.Scenario=a);var e=e+("&tstype="+a),s="";try{window.top==window?s="1":window.top.location.host==window.location.host&&(s="2")}catch(F){s="3"}var a="dvCallback_"+
(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():dv_GetRnd()),B=this.dv_script;window._dv_win[a]=function(a,b,c,d){var f=getCurrentTime();b.$uid=c;b=x(A);a.tags.add(c,b);b=x(e);a.tags[c].set(b);a.tags[c].beginVisitCallbackTS=f;a.tags[c].set({tagElement:B,dv_protocol:w,protocol:q,uid:c});a.tags[c].ImpressionServedTime=getCurrentTime();a.tags[c].getTimeDiff=function(){return(new Date).getTime()-this.ImpressionServedTime};try{"undefined"!=typeof d&&null!==
d&&(a.tags[c].ServerPublicDns=d),a.tags[c].adServingScenario=s,a.tags[c].t2tIframeCreationTime=i,a.tags[c].t2tProcessed=!1,a.tags[c].t2tIframeId=l.id,a.tags[c].t2tIframeWindow=l.contentWindow,$dv.t2tEventDataZombie[l.id]&&(a.tags[c].uniquePageViewId=$dv.t2tEventDataZombie[l.id].uniquePageViewId,$dv.processT2TEvent($dv.t2tEventDataZombie[l.id],a.tags[c]))}catch(g){}};return e+"&jsCallback="+a}}};this.sendRequest=function(b){var a;a=this.getVersionParamName();var c=this.getVersion(),d={};d[a]=c;d.dvp_jsErrUrl=
b;d.dvp_jsErrMsg=encodeURIComponent("Error loading visit.js");window._dv_win.dv_config=window._dv_win.dv_config||{};window._dv_win.dv_config.tpsErrAddress=window._dv_win.dv_config.tpsAddress||"tps30.doubleverify.com";a='try{ script.onerror = function(){ try{(new Image()).src = "'+dv_CreateAndGetErrorImp(window._dv_win.dv_config.tpsErrAddress+"/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&dvp_isLostImp=1",d)+'";}catch(e){}}}catch(e){}';a='<html><head></head><body><script id="TPSCall" type="text/javascript" src="'+
b+'"><\/script><script type="text/javascript">var script = document.getElementById("TPSCall"); if (script && script.readyState) { script.onreadystatechange = function() { if (script.readyState == "complete") document.close(); } } else document.close(); '+a+"<\/script></body></html>";c=t("about:blank");this.dv_script.id=c.id.replace("iframe","script");dv_GetParam(b,"uid");document.body.insertBefore(c,document.body.firstChild);b=dv_getPropSafe(c,"contentDocument")||dv_getPropSafe(dv_getPropSafe(c,"contentWindow"),
"document")||dv_getPropSafe(window._dv_win.frames[c.name],"document");window._dv_win.t2tTimestampData.push({beforeVisitCall:getCurrentTime()});if(b){b.open();if(c=c.contentWindow||window._dv_win.frames[c.name])c.$dv=window._dv_win.$dv;b.write(a)}else b='javascript: (function(){document.open(); document.domain="'+window.document.domain+"\"; window.$dv = window.parent.$dv; document.write('"+encodeURIComponent(a)+"');})()",c=t(b),this.dv_script.id=c.id.replace("iframe","script"),document.body.insertBefore(c,
document.body.firstChild);return!0};this.isApplicable=function(){return!0};this.onFailure=function(){var b=window._dv_win._dvScripts,a=this.dv_script;null!=b&&(void 0!=b&&a)&&(a=b.indexOf(a),-1!=a&&b.splice(a,1))};this.getTrafficScenarioType=function(){var b=window._dv_win.$dv.Enums.TrafficScenario;try{if(window.top==window)return b.OnPage;if(window.top.document.domain==window.document.domain)return b.SameDomain}catch(a){}return b.CrossDomain};this.getVersionParamName=function(){return"jsver"};this.getVersion=
function(){return"34"}};


function dv_src_main(dv_baseHandlerIns, dv_handlersDefs) {

    this.baseHandlerIns = dv_baseHandlerIns;
    this.handlersDefs = dv_handlersDefs;

    this.exec = function () {
        try {
            window._dv_win = (window._dv_win || window);
            window._dv_win.$dv = (window._dv_win.$dv || new dvType());
            
            window._dv_win.dv_config = window._dv_win.dv_config || {};
            window._dv_win.dv_config.tpsErrAddress = window._dv_win.dv_config.tpsAddress || 'tps30.doubleverify.com';
            
            var errorsArr = (new dv_rolloutManager(this.handlersDefs, this.baseHandlerIns)).handle();
            if (errorsArr && errorsArr.length > 0)
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src', errorsArr);
        }
        catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_isLostImp=1', { dvp_jsErrMsg: encodeURIComponent(e) });
            } catch (e) { }
        }
    }
}

try {
    window._dv_win = window;
    var dv_baseHandlerIns = new dv_baseHandler();
	dv_handler35.prototype = dv_baseHandlerIns;
dv_handler35.prototype.constructor = dv_handler35;

    var dv_handlersDefs = [{handler: new dv_handler35(), minRate: 0, maxRate: 5}];
    (new dv_src_main(dv_baseHandlerIns, dv_handlersDefs)).exec();
} catch (e) { }
