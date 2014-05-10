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

function dv_Contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function dv_GetDynamicParams(url) {
    try {
        var regex = new RegExp("[\\?&](dvp_[^&]*=[^&#]*)", "gi");
        var dvParams = regex.exec(url);

        var results = new Array();
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
    for (key in errorObj) {
        if (errorObj.hasOwnProperty(key)) {
            if (key.indexOf('dvp_jsErrUrl') == -1) {
                errorQueryString += '&' + key + '=' + errorObj[key];
            }
            else {
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

    var errorImp = window._dv_win.location.protocol + '//' + serverUrl + errorQueryString;
    return errorImp;
}

function dv_sendImgImp(url) {
    (new Image()).src = url;
}

function dv_sendScriptRequest(url) {
    document.write('<scr' + 'ipt type="text/javascript" src="' + url + '"></scr' + 'ipt>');
}

function dv_getPropSafe(obj, propName) {
    try {
        if (obj)
            return obj[propName];
    } catch (e) { }
}

function dvBsType() {
    var that = this;
    this.t2tEventDataZombie = {};

    this.processT2TEvent = function (data, tag) {
        try {
            if (tag.ServerPublicDns) {
                data.timeStampCollection.push({"beginProcessT2TEvent" : getCurrentTime()});
                data.timeStampCollection.push({'beginVisitCallback' : tag.beginVisitCallbackTS});
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;

                if (!tag.uniquePageViewId) {
                    tag.uniquePageViewId = data.uniquePageViewId;
                }

                tpsServerUrl += '&dvp_upvid=' + tag.uniquePageViewId;
                tpsServerUrl += '&dvp_numFrames=' + data.totalIframeCount;
                tpsServerUrl += '&dvp_numt2t=' + data.totalT2TiframeCount;
                tpsServerUrl += '&dvp_frameScanDuration=' + data.scanAllFramesDuration;
                tpsServerUrl += '&dvp_scene=' + tag.adServingScenario;
                tpsServerUrl += '&dvp_ist2twin=' + (data.isWinner ? '1' : '0');
                tpsServerUrl += '&dvp_numTags=' + Object.keys($dvbs.tags).length;
                tpsServerUrl += '&dvp_isInSample=' + data.isInSample;
                tpsServerUrl += (data.wasZombie)?'&dvp_wasZombie=1':'&dvp_wasZombie=0';
                tpsServerUrl += '&dvp_ts_t2tCreatedOn=' + data.creationTime;
                if(data.timeStampCollection)
                {
                    if(window._dv_win.t2tTimestampData)
                    {
                        for(var tsI = 0; tsI < window._dv_win.t2tTimestampData.length; tsI++)
                        {
                            data.timeStampCollection.push(window._dv_win.t2tTimestampData[tsI]);
                        }
                    }

                    for(var i = 0; i< data.timeStampCollection.length;i++)
                    {
                        var item = data.timeStampCollection[i];
                        for(var propName in item)
                        {
                            if(item.hasOwnProperty(propName))
                            {
                                tpsServerUrl += '&dvp_ts_' + propName + '=' + item[propName];
                            }
                        }
                    }
                }
                $dvbs.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
            }
        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tProcess=1', { dvp_jsErrMsg: encodeURIComponent(e) });
            } catch (ex) { }
        }
    };

    this.processTagToTagCollision = function (collision, tag) {
        var i;
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        var additions = [
            '&dvp_collisionReasons=' + collision.reasonBitFlag,
            '&dvp_ts_reporterDvTagCreated=' + collision.thisTag.dvTagCreatedTS,
            '&dvp_ts_reporterVisitJSMessagePosted=' + collision.thisTag.visitJSPostMessageTS,
            '&dvp_ts_reporterReceivedByT2T=' + collision.thisTag.receivedByT2TTS,
            '&dvp_ts_collisionPostedFromT2T=' + collision.postedFromT2TTS,
            '&dvp_ts_collisionReceivedByCommon=' + collision.commonRecievedTS,
            '&dvp_collisionTypeId=' + collision.allReasonsForTagBitFlag
        ];
        tpsServerUrl += additions.join("");

        for (i = 0; i < collision.reasons.length; i++){
            var reason = collision.reasons[i];
            tpsServerUrl += '&dvp_' + reason + "MS=" + collision[reason+"MS"];
        }

        if(tag.uniquePageViewId){
            tpsServerUrl +=  '&dvp_upvid='+tag.uniquePageViewId;
        }
        $dvbs.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    var messageEventListener = function (event) {
        try {
            var timeCalled = getCurrentTime();
            var data = window.JSON.parse(event.data);
            if(!data.action){
                data = window.JSON.parse(data);
            }
            if(data.timeStampCollection)
            {
                data.timeStampCollection.push({messageEventListenerCalled:timeCalled});
            }
            var myUID;
            var visitJSHasBeenCalledForThisTag = false;
            if ($dvbs.tags) {
                for (var uid in $dvbs.tags) {
                    if ($dvbs.tags.hasOwnProperty(uid) && $dvbs.tags[uid] && $dvbs.tags[uid].t2tIframeId === data.iFrameId) {
                        myUID = uid;
                        visitJSHasBeenCalledForThisTag = true;
                        break;
                    }
                }
            }

            switch(data.action){
            case 'uniquePageViewIdDetermination' :
                if(visitJSHasBeenCalledForThisTag){
                    $dvbs.processT2TEvent(data, $dvbs.tags[myUID]);
                    $dvbs.t2tEventDataZombie[data.iFrameId] = undefined;
                }
                else
                {
                    data.wasZombie = 1;
                    $dvbs.t2tEventDataZombie[data.iFrameId] = data;
                }
            break;
            case 'maColl':
                var tag = $dvbs.tags[myUID];
                //mark we got a message, so we'll stop sending them in the future
                tag.AdCollisionMessageRecieved = true;
                if (!tag.uniquePageViewId) { tag.uniquePageViewId = data.uniquePageViewId; }
                data.collision.commonRecievedTS = timeCalled;
                $dvbs.processTagToTagCollision(data.collision, tag);
            break;
            }

        } catch (e) {
            try{
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

    this.resolveMacros = function(str, tag) {
        var viewabilityData = tag.getViewabilityData();
        var viewabilityBuckets = viewabilityData && viewabilityData.buckets ? viewabilityData.buckets : { };
        var upperCaseObj = objectsToUpperCase(tag, viewabilityData, viewabilityBuckets);
        var newStr = str.replace('[DV_PROTOCOL]', upperCaseObj.DV_PROTOCOL);
        newStr = newStr.replace('[PROTOCOL]', upperCaseObj.PROTOCOL);
        newStr = newStr.replace( /\[(.*?)\]/g , function(match, p1) {
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

    this.Enums = {
        BrowserId: { Others: 0, IE: 1, Firefox: 2, Chrome: 3, Opera: 4, Safari: 5 },
        TrafficScenario: { OnPage: 1, SameDomain: 2, CrossDomain: 128 }
    };

    this.CommonData = { };
    
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

function dv_handler9(){function s(a){window[a.callbackName]=function(d){if(null!=a.tagformat&&"2"==a.tagformat){if(window._dv_win.$dvbs){var e="https"==window._dv_win.location.toString().match("^https")?"https:":"http:";window._dv_win.$dvbs.tags.add(d.ImpressionID,a);window._dv_win.$dvbs.tags[d.ImpressionID].set({tagElement:a.script,dv_protocol:a.protocol,protocol:e,uid:a.uid,serverPublicDns:d.ServerPublicDns})}}else switch(e=window._dv_win.dv_config.bs_renderingMethod||function(a){document.write(a)},
d.ResultID){case 1:a.tagPassback?e(a.tagPassback):d.Passback?e(decodeURIComponent(d.Passback)):d.AdWidth&&d.AdHeight&&e(decodeURIComponent("%3Cstyle%3E%0A.container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%09%2F*%20for%20IE%20*%2F%0A%09background%3A%20-webkit-gradient(linear%2C%20left%20top%2C%20left%20bottom%2C%20from(%23315d8c)%2C%20to(%2384aace))%3B%0A%09%2F*%20for%20webkit%20browsers%20*%2F%0A%09background%3A%20-moz-linear-gradient(top%2C%20%23315d8c%2C%20%2384aace)%3B%0A%09%2F*%20for%20firefox%203.6%2B%20*%2F%0A%7D%0A.cloud%20%7B%0A%09color%3A%20%23fff%3B%0A%09position%3A%20relative%3B%0A%09font%3A%20100%25%22Times%20New%20Roman%22%2C%20Times%2C%20serif%3B%0A%09text-shadow%3A%200px%200px%2010px%20%23fff%3B%0A%09line-height%3A%200%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cscript%20type%3D%22text%2Fjavascript%22%3E%0A%09function%0A%20%20%20%20cloud()%7B%0A%09%09var%20b1%20%3D%20%22%3Cdiv%20class%3D%5C%22cloud%5C%22%20style%3D%5C%22font-size%3A%22%3B%0A%09%09var%20b2%3D%22px%3B%20position%3A%20absolute%3B%20top%3A%20%22%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2234px%3B%20left%3A%2028px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A%2010px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A50px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%09%09document.write(b1%20%2B%20%22400px%3B%20width%3A%20400px%3B%20height%3A%20400%22%20%2B%20b2%20%2B%20%2224px%3B%20left%3A20px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0A%09function%20clouds()%7B%0A%20%20%20%20%20%20%20%20var%20top%20%3D%20%5B%27-80%27%2C%2780%27%2C%27240%27%2C%27400%27%5D%3B%0A%09%09var%20left%20%3D%20-10%3B%0A%20%20%20%20%20%20%20%20var%20a1%20%3D%20%22%3Cdiv%20style%3D%5C%22position%3A%20relative%3B%20top%3A%20%22%3B%0A%09%09var%20a2%20%3D%20%22px%3B%20left%3A%20%22%3B%0A%20%20%20%20%20%20%20%20var%20a3%3D%20%22px%3B%5C%22%3E%3Cscr%22%2B%22ipt%20type%3D%5C%22text%5C%2Fjavascr%22%2B%22ipt%5C%22%3Ecloud()%3B%3C%5C%2Fscr%22%2B%22ipt%3E%3C%5C%2Fdiv%3E%22%3B%0A%20%20%20%20%20%20%20%20for(i%3D0%3B%20i%20%3C%208%3B%20i%2B%2B)%20%7B%0A%09%09%09document.write(a1%2Btop%5B0%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B1%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B2%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B3%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09if(i%3D%3D4)%0A%09%09%09%7B%0A%09%09%09%09left%20%3D-%2090%3B%0A%09%09%09%09top%20%3D%20%5B%270%27%2C%27160%27%2C%27320%27%2C%27480%27%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20%0A%09%09%09%09left%20%2B%3D%20160%3B%0A%09%09%7D%0A%09%7D%0A%0A%3C%2Fscript%3E%0A%3Cdiv%20class%3D%22container%22%20style%3D%22width%3A%20"+
d.AdWidth+"px%3B%20height%3A%20"+d.AdHeight+"px%3B%22%3E%0A%09%3Cscript%20type%3D%22text%2Fjavascript%22%3Eclouds()%3B%3C%2Fscript%3E%0A%3C%2Fdiv%3E"));break;case 2:case 3:a.tagAdtag&&e(a.tagAdtag);break;case 4:d.AdWidth&&d.AdHeight&&e(decodeURIComponent("%3Cstyle%3E%0A.container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cdiv%20class%3D%22container%22%20style%3D%22width%3A%20"+
d.AdWidth+"%3B%20height%3A%20"+d.AdHeight+"%3B%22%3E%09%0A%3C%2Fdiv%3E"))}}}function t(a){var d=null,e=null,c;var b=a.src,m=dv_GetParam(b,"cmp"),b=dv_GetParam(b,"ctx");c="919838"==b&&"7951767"==m||"919839"==b&&"7939985"==m||"971108"==b&&"7900229"==m||"971108"==b&&"7951940"==m?"</scr'+'ipt>":/<\/scr\+ipt>/g;"function"!==typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});var h=function(a){if((a=a.previousSibling)&&"#text"==a.nodeName&&(null==a.nodeValue||
void 0==a.nodeValue||0==a.nodeValue.trim().length))a=a.previousSibling;if(a&&"SCRIPT"==a.tagName&&("text/adtag"==a.getAttribute("type").toLowerCase()||"text/passback"==a.getAttribute("type").toLowerCase())&&""!=a.innerHTML.trim()){if("text/adtag"==a.getAttribute("type").toLowerCase())return d=a.innerHTML.replace(c,"<\/script>"),{isBadImp:!1,hasPassback:!1,tagAdTag:d,tagPassback:e};if(null!=e)return{isBadImp:!0,hasPassback:!1,tagAdTag:d,tagPassback:e};e=a.innerHTML.replace(c,"<\/script>");a=h(a);a.hasPassback=
!0;return a}return{isBadImp:!0,hasPassback:!1,tagAdTag:d,tagPassback:e}};return h(a)}function u(a){try{if(1>=a.depth)return{url:"",depth:""};var d,e=[];e.push({win:window._dv_win.top,depth:0});for(var c,b=1,m=0;0<b&&100>m;){try{if(m++,c=e.shift(),b--,0<c.win.location.toString().length&&c.win!=a)return 0==c.win.document.referrer.length||0==c.depth?{url:c.win.location,depth:c.depth}:{url:c.win.document.referrer,depth:c.depth-1}}catch(h){}d=c.win.frames.length;for(var p=0;p<d;p++)e.push({win:c.win.frames[p],
depth:c.depth+1}),b++}return{url:"",depth:""}}catch(j){return{url:"",depth:""}}}function q(a){new String;var d=new String,e,c,b;for(e=0;e<a.length;e++)b=a.charAt(e),c="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(b),0<=c&&(b="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((c+47)%94)),d+=b;return d}function r(){return Math.floor(1E12*(Math.random()+""))}this.createRequest=function(){var a;
a=window._dv_win.dv_config?window._dv_win.dv_config.bst2tid?window._dv_win.dv_config.bst2tid:window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():r():r();var d=doesBrowserSupportHTML5Push();if(d)try{var e=window._dv_win.dv_config.bst2turl||"https://cdn3.doubleverify.com/bst2tv2.html",c="bst2t_"+a,b;if(document.createElement&&(b=document.createElement("iframe")))b.name=b.id=window._dv_win.dv_config.emptyIframeID||"iframe_"+r(),b.width=0,b.height=0,b.id=c,b.style.display="none",b.src=
e;document.body.insertBefore(b,document.body.firstChild)}catch(m){}var h=!1;b=window._dv_win;c=0;e=!1;try{for(dv_i=0;10>=dv_i;dv_i++)if(null!=b.parent&&b.parent!=b)if(0<b.parent.location.toString().length)b=b.parent,c++,h=!0;else{h=!1;break}else{0==dv_i&&(h=!0);break}}catch(p){h=!1}0==b.document.referrer.length?h=b.location:h?h=b.location:(h=b.document.referrer,e=!0);window._dv_win._dvScripts||(window._dv_win._dvScripts=[]);var j=document.getElementsByTagName("script");for(dv_i in j){var k=j[dv_i].src,
n=window._dv_win.dv_config.bs_regex||/^[ \t]*(http(s)?:\/\/)?[a-z\-]*cdn(s)?\.doubleverify\.com:?[0-9]*\/dvbs_src\.js/;if(k&&k.match(n)&&!dv_Contains(window._dv_win._dvScripts,j[dv_i])){this.dv_script=j[dv_i];window._dv_win._dvScripts.push(j[dv_i]);var f;j=k;k={};try{for(var l=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),i=l.exec(j);null!=i;)"eparams"!==i[1]&&(k[i[1]]=i[2]),i=l.exec(j);f=k}catch(v){f=k}f.uid=a;f.script=this.dv_script;f.callbackName="__verify_callback_"+f.uid;f.tagAdtag=null;f.tagPassback=
null;f.tagIntegrityFlag="";f.tagHasPassbackFlag="";!1==(null!=f.tagformat&&"2"==f.tagformat)&&(a=t(f.script),f.tagAdtag=a.tagAdTag,f.tagPassback=a.tagPassback,a.isBadImp?f.tagIntegrityFlag="&isbadimp=1":a.hasPassback&&(f.tagHasPassbackFlag="&tagpb=1"));f.protocol="http:";f.ssl="0";"https"==f.script.src.match("^https")&&"https"==window._dv_win.location.toString().match("^https")&&(f.protocol="https:",f.ssl="1");s(f);a=f;f=h;i=c;h=e;c=d;void 0==a.dvregion&&(a.dvregion=0);l=e=d=void 0;try{k=j=b;for(n=
0;10>n&&k!=window._dv_win.top;)n++,k=k.parent;j.depth=n;var g=u(b),d="&aUrl="+encodeURIComponent(g.url),e="&aUrlD="+g.depth,l=b.depth+i;h&&b.depth--}catch(w){e=d=l=b.depth=""}g=a.script.src;i="&ctx="+(dv_GetParam(g,"ctx")||"")+"&cmp="+(dv_GetParam(g,"cmp")||"")+"&plc="+(dv_GetParam(g,"plc")||"")+"&sid="+(dv_GetParam(g,"sid")||"")+"&advid="+(dv_GetParam(g,"advid")||"")+"&adsrv="+(dv_GetParam(g,"adsrv")||"")+"&unit="+(dv_GetParam(g,"unit")||"")+"&uid="+a.uid;(h=dv_GetParam(g,"xff"))&&(i+="&xff="+h);
(h=dv_GetParam(g,"useragent"))&&(i+="&useragent="+h);i+="&turl="+dv_GetParam(g,"turl");a=(window._dv_win.dv_config.verifyJSURL||a.protocol+"//"+(window._dv_win.dv_config.bsAddress||"rtb"+a.dvregion+".doubleverify.com")+"/verify.js")+"?jsCallback="+a.callbackName+"&num=6"+i+"&srcurlD="+b.depth+"&ssl="+a.ssl+"&refD="+l+a.tagIntegrityFlag+a.tagHasPassbackFlag+"&htmlmsging="+(c?"1":"0");(c=dv_GetDynamicParams(g).join("&"))&&(a+="&"+c);f="srcurl="+encodeURIComponent(f);if((c=window._dv_win[q("=@42E:@?")][q("2?46DE@C~C:8:?D")])&&
0<c.length){b=[];b[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(l=0;l<c.length;l++)b[l+1]=c[l];c=b.reverse().join(",")}else c=null;c&&(f+="&ancChain="+encodeURIComponent(c));c=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&7>=new Number(RegExp.$1)&&(c=2E3);if(g=dv_GetParam(g,"referrer"))g="&referrer="+g,a.length+g.length<=c&&(a+=g);d.length+e.length+a.length<=c&&(a+=e,f+=d);return a+="&eparams="+encodeURIComponent(q(f))+"&"+this.getVersionParamName()+"="+this.getVersion()}}};
this.sendRequest=function(a){dv_sendScriptRequest(a);return!0};this.isApplicable=function(){return!0};this.onFailure=function(){var a=window._dv_win._dvScripts,d=this.dv_script;null!=a&&(void 0!=a&&d)&&(d=a.indexOf(d),-1!=d&&a.splice(d,1))};this.getVersionParamName=function(){return"ver"};this.getVersion=function(){return"9"}};


function dv_baseHandler(){function s(a){window[a.callbackName]=function(d){if(null!=a.tagformat&&"2"==a.tagformat){if(window._dv_win.$dvbs){var e="https"==window._dv_win.location.toString().match("^https")?"https:":"http:";window._dv_win.$dvbs.tags.add(d.ImpressionID,a);window._dv_win.$dvbs.tags[d.ImpressionID].set({tagElement:a.script,dv_protocol:a.protocol,protocol:e,uid:a.uid,serverPublicDns:d.ServerPublicDns})}}else switch(e=window._dv_win.dv_config.bs_renderingMethod||function(a){document.write(a)},
d.ResultID){case 1:a.tagPassback?e(a.tagPassback):d.Passback?e(decodeURIComponent(d.Passback)):d.AdWidth&&d.AdHeight&&e(decodeURIComponent("%3Cstyle%3E%0A.container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%09%2F*%20for%20IE%20*%2F%0A%09background%3A%20-webkit-gradient(linear%2C%20left%20top%2C%20left%20bottom%2C%20from(%23315d8c)%2C%20to(%2384aace))%3B%0A%09%2F*%20for%20webkit%20browsers%20*%2F%0A%09background%3A%20-moz-linear-gradient(top%2C%20%23315d8c%2C%20%2384aace)%3B%0A%09%2F*%20for%20firefox%203.6%2B%20*%2F%0A%7D%0A.cloud%20%7B%0A%09color%3A%20%23fff%3B%0A%09position%3A%20relative%3B%0A%09font%3A%20100%25%22Times%20New%20Roman%22%2C%20Times%2C%20serif%3B%0A%09text-shadow%3A%200px%200px%2010px%20%23fff%3B%0A%09line-height%3A%200%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cscript%20type%3D%22text%2Fjavascript%22%3E%0A%09function%0A%20%20%20%20cloud()%7B%0A%09%09var%20b1%20%3D%20%22%3Cdiv%20class%3D%5C%22cloud%5C%22%20style%3D%5C%22font-size%3A%22%3B%0A%09%09var%20b2%3D%22px%3B%20position%3A%20absolute%3B%20top%3A%20%22%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2234px%3B%20left%3A%2028px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A%2010px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A50px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%09%09document.write(b1%20%2B%20%22400px%3B%20width%3A%20400px%3B%20height%3A%20400%22%20%2B%20b2%20%2B%20%2224px%3B%20left%3A20px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0A%09function%20clouds()%7B%0A%20%20%20%20%20%20%20%20var%20top%20%3D%20%5B%27-80%27%2C%2780%27%2C%27240%27%2C%27400%27%5D%3B%0A%09%09var%20left%20%3D%20-10%3B%0A%20%20%20%20%20%20%20%20var%20a1%20%3D%20%22%3Cdiv%20style%3D%5C%22position%3A%20relative%3B%20top%3A%20%22%3B%0A%09%09var%20a2%20%3D%20%22px%3B%20left%3A%20%22%3B%0A%20%20%20%20%20%20%20%20var%20a3%3D%20%22px%3B%5C%22%3E%3Cscr%22%2B%22ipt%20type%3D%5C%22text%5C%2Fjavascr%22%2B%22ipt%5C%22%3Ecloud()%3B%3C%5C%2Fscr%22%2B%22ipt%3E%3C%5C%2Fdiv%3E%22%3B%0A%20%20%20%20%20%20%20%20for(i%3D0%3B%20i%20%3C%208%3B%20i%2B%2B)%20%7B%0A%09%09%09document.write(a1%2Btop%5B0%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B1%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B2%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B3%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09if(i%3D%3D4)%0A%09%09%09%7B%0A%09%09%09%09left%20%3D-%2090%3B%0A%09%09%09%09top%20%3D%20%5B%270%27%2C%27160%27%2C%27320%27%2C%27480%27%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20%0A%09%09%09%09left%20%2B%3D%20160%3B%0A%09%09%7D%0A%09%7D%0A%0A%3C%2Fscript%3E%0A%3Cdiv%20class%3D%22container%22%20style%3D%22width%3A%20"+
d.AdWidth+"px%3B%20height%3A%20"+d.AdHeight+"px%3B%22%3E%0A%09%3Cscript%20type%3D%22text%2Fjavascript%22%3Eclouds()%3B%3C%2Fscript%3E%0A%3C%2Fdiv%3E"));break;case 2:case 3:a.tagAdtag&&e(a.tagAdtag);break;case 4:d.AdWidth&&d.AdHeight&&e(decodeURIComponent("%3Cstyle%3E%0A.container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cdiv%20class%3D%22container%22%20style%3D%22width%3A%20"+
d.AdWidth+"%3B%20height%3A%20"+d.AdHeight+"%3B%22%3E%09%0A%3C%2Fdiv%3E"))}}}function t(a){var d=null,e=null,c;var b=a.src,m=dv_GetParam(b,"cmp"),b=dv_GetParam(b,"ctx");c="919838"==b&&"7951767"==m||"919839"==b&&"7939985"==m||"971108"==b&&"7900229"==m||"971108"==b&&"7951940"==m?"</scr'+'ipt>":/<\/scr\+ipt>/g;"function"!==typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});var h=function(a){if((a=a.previousSibling)&&"#text"==a.nodeName&&(null==a.nodeValue||
void 0==a.nodeValue||0==a.nodeValue.trim().length))a=a.previousSibling;if(a&&"SCRIPT"==a.tagName&&("text/adtag"==a.getAttribute("type").toLowerCase()||"text/passback"==a.getAttribute("type").toLowerCase())&&""!=a.innerHTML.trim()){if("text/adtag"==a.getAttribute("type").toLowerCase())return d=a.innerHTML.replace(c,"<\/script>"),{isBadImp:!1,hasPassback:!1,tagAdTag:d,tagPassback:e};if(null!=e)return{isBadImp:!0,hasPassback:!1,tagAdTag:d,tagPassback:e};e=a.innerHTML.replace(c,"<\/script>");a=h(a);a.hasPassback=
!0;return a}return{isBadImp:!0,hasPassback:!1,tagAdTag:d,tagPassback:e}};return h(a)}function u(a){try{if(1>=a.depth)return{url:"",depth:""};var d,e=[];e.push({win:window._dv_win.top,depth:0});for(var c,b=1,m=0;0<b&&100>m;){try{if(m++,c=e.shift(),b--,0<c.win.location.toString().length&&c.win!=a)return 0==c.win.document.referrer.length||0==c.depth?{url:c.win.location,depth:c.depth}:{url:c.win.document.referrer,depth:c.depth-1}}catch(h){}d=c.win.frames.length;for(var p=0;p<d;p++)e.push({win:c.win.frames[p],
depth:c.depth+1}),b++}return{url:"",depth:""}}catch(j){return{url:"",depth:""}}}function q(a){new String;var d=new String,e,c,b;for(e=0;e<a.length;e++)b=a.charAt(e),c="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(b),0<=c&&(b="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((c+47)%94)),d+=b;return d}function r(){return Math.floor(1E12*(Math.random()+""))}this.createRequest=function(){var a;
a=window._dv_win.dv_config?window._dv_win.dv_config.bst2tid?window._dv_win.dv_config.bst2tid:window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():r():r();var d=doesBrowserSupportHTML5Push();if(d)try{var e=window._dv_win.dv_config.bst2turl||"https://cdn3.doubleverify.com/bst2t.html",c="bst2t_"+a,b;if(document.createElement&&(b=document.createElement("iframe")))b.name=b.id=window._dv_win.dv_config.emptyIframeID||"iframe_"+r(),b.width=0,b.height=0,b.id=c,b.style.display="none",b.src=
e;document.body.insertBefore(b,document.body.firstChild)}catch(m){}var h=!1;b=window._dv_win;c=0;e=!1;try{for(dv_i=0;10>=dv_i;dv_i++)if(null!=b.parent&&b.parent!=b)if(0<b.parent.location.toString().length)b=b.parent,c++,h=!0;else{h=!1;break}else{0==dv_i&&(h=!0);break}}catch(p){h=!1}0==b.document.referrer.length?h=b.location:h?h=b.location:(h=b.document.referrer,e=!0);window._dv_win._dvScripts||(window._dv_win._dvScripts=[]);var j=document.getElementsByTagName("script");for(dv_i in j){var k=j[dv_i].src,
n=window._dv_win.dv_config.bs_regex||/^[ \t]*(http(s)?:\/\/)?[a-z\-]*cdn(s)?\.doubleverify\.com:?[0-9]*\/dvbs_src\.js/;if(k&&k.match(n)&&!dv_Contains(window._dv_win._dvScripts,j[dv_i])){this.dv_script=j[dv_i];window._dv_win._dvScripts.push(j[dv_i]);var f;j=k;k={};try{for(var l=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),i=l.exec(j);null!=i;)"eparams"!==i[1]&&(k[i[1]]=i[2]),i=l.exec(j);f=k}catch(v){f=k}f.uid=a;f.script=this.dv_script;f.callbackName="__verify_callback_"+f.uid;f.tagAdtag=null;f.tagPassback=
null;f.tagIntegrityFlag="";f.tagHasPassbackFlag="";!1==(null!=f.tagformat&&"2"==f.tagformat)&&(a=t(f.script),f.tagAdtag=a.tagAdTag,f.tagPassback=a.tagPassback,a.isBadImp?f.tagIntegrityFlag="&isbadimp=1":a.hasPassback&&(f.tagHasPassbackFlag="&tagpb=1"));f.protocol="http:";f.ssl="0";"https"==f.script.src.match("^https")&&"https"==window._dv_win.location.toString().match("^https")&&(f.protocol="https:",f.ssl="1");s(f);a=f;f=h;i=c;h=e;c=d;void 0==a.dvregion&&(a.dvregion=0);l=e=d=void 0;try{k=j=b;for(n=
0;10>n&&k!=window._dv_win.top;)n++,k=k.parent;j.depth=n;var g=u(b),d="&aUrl="+encodeURIComponent(g.url),e="&aUrlD="+g.depth,l=b.depth+i;h&&b.depth--}catch(w){e=d=l=b.depth=""}g=a.script.src;i="&ctx="+(dv_GetParam(g,"ctx")||"")+"&cmp="+(dv_GetParam(g,"cmp")||"")+"&plc="+(dv_GetParam(g,"plc")||"")+"&sid="+(dv_GetParam(g,"sid")||"")+"&advid="+(dv_GetParam(g,"advid")||"")+"&adsrv="+(dv_GetParam(g,"adsrv")||"")+"&unit="+(dv_GetParam(g,"unit")||"")+"&uid="+a.uid;(h=dv_GetParam(g,"xff"))&&(i+="&xff="+h);
(h=dv_GetParam(g,"useragent"))&&(i+="&useragent="+h);i+="&turl="+dv_GetParam(g,"turl");a=(window._dv_win.dv_config.verifyJSURL||a.protocol+"//"+(window._dv_win.dv_config.bsAddress||"rtb"+a.dvregion+".doubleverify.com")+"/verify.js")+"?jsCallback="+a.callbackName+"&num=6"+i+"&srcurlD="+b.depth+"&ssl="+a.ssl+"&refD="+l+a.tagIntegrityFlag+a.tagHasPassbackFlag+"&htmlmsging="+(c?"1":"0");(c=dv_GetDynamicParams(g).join("&"))&&(a+="&"+c);f="srcurl="+encodeURIComponent(f);if((c=window._dv_win[q("=@42E:@?")][q("2?46DE@C~C:8:?D")])&&
0<c.length){b=[];b[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(l=0;l<c.length;l++)b[l+1]=c[l];c=b.reverse().join(",")}else c=null;c&&(f+="&ancChain="+encodeURIComponent(c));c=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&7>=new Number(RegExp.$1)&&(c=2E3);if(g=dv_GetParam(g,"referrer"))g="&referrer="+g,a.length+g.length<=c&&(a+=g);d.length+e.length+a.length<=c&&(a+=e,f+=d);return a+="&eparams="+encodeURIComponent(q(f))+"&"+this.getVersionParamName()+"="+this.getVersion()}}};
this.sendRequest=function(a){dv_sendScriptRequest(a);return!0};this.isApplicable=function(){return!0};this.onFailure=function(){var a=window._dv_win._dvScripts,d=this.dv_script;null!=a&&(void 0!=a&&d)&&(d=a.indexOf(d),-1!=d&&a.splice(d,1))};this.getVersionParamName=function(){return"ver"};this.getVersion=function(){return"8"}};


function dvbs_src_main(dvbs_baseHandlerIns, dvbs_handlersDefs) {

    this.bs_baseHandlerIns = dvbs_baseHandlerIns;
    this.bs_handlersDefs = dvbs_handlersDefs;

    this.exec = function() {
        try {
            window._dv_win = (window._dv_win || window);
            window._dv_win.$dvbs = (window._dv_win.$dvbs || new dvBsType());

            window._dv_win.dv_config = window._dv_win.dv_config || { };
            window._dv_win.dv_config.bsErrAddress = window._dv_win.dv_config.bsAddress || 'rtb0.doubleverify.com';

            var errorsArr = (new dv_rolloutManager(this.bs_handlersDefs, this.bs_baseHandlerIns)).handle();
            if (errorsArr && errorsArr.length > 0)
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verify.js?ctx=818052&cmp=1619415', errorsArr);
        }
        catch(e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verify.js?ctx=818052&cmp=1619415&num=6&ver=0&dvp_isLostImp=1', { dvp_jsErrMsg: encodeURIComponent(e) });
            } catch(e) { }
        }
    };
};

try {
    window._dv_win = window;
    var dv_baseHandlerIns = new dv_baseHandler();
	dv_handler9.prototype = dv_baseHandlerIns;
dv_handler9.prototype.constructor = dv_handler9;

    var dv_handlersDefs = [{handler: new dv_handler9(), minRate: 0, maxRate: 5}];
    (new dvbs_src_main(dv_baseHandlerIns, dv_handlersDefs)).exec();
} catch (e) { }
