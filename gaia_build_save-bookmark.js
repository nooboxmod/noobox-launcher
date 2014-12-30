;'use strict';(function(window){var gL10nData={};var gLanguage='';var gMacros={};var gReadyState='loading';var gNestedProps=['style','dataset'];var gDefaultLocale='en-US';var gAsyncResourceLoading=true;var gDEBUG=1;function consoleLog(message){if(gDEBUG>=2){console.log('[l10n] '+message);}};function consoleWarn(message){if(gDEBUG){console.warn('[l10n] '+message);}};function consoleWarn_missingKeys(untranslatedElements,lang){var len=untranslatedElements.length;if(!len||!gDEBUG){return;}
var missingIDs=[];for(var i=0;i<len;i++){var l10nId=untranslatedElements[i].getAttribute('data-l10n-id');if(missingIDs.indexOf(l10nId)<0){missingIDs.push(l10nId);}}
console.warn('[l10n] '+
missingIDs.length+' missing key(s) for ['+lang+']: '+
missingIDs.join(', '));}
function getL10nResourceLinks(){return document.querySelectorAll('link[type="application/l10n"]');}
function getL10nDictionary(lang){var getInlineDict=function(locale){var sel='script[type="application/l10n"][lang="'+locale+'"]';return document.querySelector(sel);};var script=getInlineDict(lang)||getInlineDict(gDefaultLocale);return script?JSON.parse(script.innerHTML):null;}
function getTranslatableChildren(element){return element?element.querySelectorAll('*[data-l10n-id]'):[];}
function getL10nAttributes(element){if(!element){return{};}
var l10nId=element.getAttribute('data-l10n-id');var l10nArgs=element.getAttribute('data-l10n-args');var args={};if(l10nArgs){try{args=JSON.parse(l10nArgs);}catch(e){consoleWarn('could not parse arguments for #'+l10nId);}}
return{id:l10nId,args:args};}
function setTextContent(element,text){if(!element.firstElementChild){element.textContent=text;return;}
var found=false;var reNotBlank=/\S/;for(var child=element.firstChild;child;child=child.nextSibling){if(child.nodeType===3&&reNotBlank.test(child.nodeValue)){if(found){child.nodeValue='';}else{child.nodeValue=text;found=true;}}}
if(!found){element.insertBefore(document.createTextNode(text),element.firstChild);}}
function fireL10nReadyEvent(){var evtObject=document.createEvent('Event');evtObject.initEvent('localized',false,false);evtObject.language=gLanguage;window.dispatchEvent(evtObject);}
function parseResource(href,lang,successCallback,failureCallback){var baseURL=href.replace(/\/[^\/]*$/,'/');function evalString(text){if(text.lastIndexOf('\\')<0){return text;}
return text.replace(/\\\\/g,'\\').replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t').replace(/\\b/g,'\b').replace(/\\f/g,'\f').replace(/\\{/g,'{').replace(/\\}/g,'}').replace(/\\"/g,'"').replace(/\\'/g,"'");}
function parseProperties(text){var dictionary=[];var reBlank=/^\s*|\s*$/;var reComment=/^\s*#|^\s*$/;var reSection=/^\s*\[(.*)\]\s*$/;var reImport=/^\s*@import\s+url\((.*)\)\s*$/i;var reSplit=/^([^=\s]*)\s*=\s*(.+)$/;var reUnicode=/\\u([0-9a-fA-F]{1,4})/g;var reMultiline=/[^\\]\\$/;function parseRawLines(rawText,extendedSyntax){var entries=rawText.replace(reBlank,'').split(/[\r\n]+/);var currentLang='*';var genericLang=lang.replace(/-[a-z]+$/i,'');var skipLang=false;var match='';for(var i=0;i<entries.length;i++){var line=entries[i];if(reComment.test(line)){continue;}
while(reMultiline.test(line)&&i<entries.length){line=line.slice(0,line.length-1)+
entries[++i].replace(reBlank,'');}
if(extendedSyntax){if(reSection.test(line)){match=reSection.exec(line);currentLang=match[1];skipLang=(currentLang!=='*')&&(currentLang!==lang)&&(currentLang!==genericLang);continue;}else if(skipLang){continue;}
if(reImport.test(line)){match=reImport.exec(line);loadImport(baseURL+match[1]);}}
var tmp=line.match(reSplit);if(tmp&&tmp.length==3){var val=tmp[2].replace(reUnicode,function(match,token){return unescape('%u'+'0000'.slice(token.length)+token);});dictionary[tmp[1]]=evalString(val);}}}
function loadImport(url){loadResource(url,function(content){parseRawLines(content,false);},null,false);}
parseRawLines(text,true);return dictionary;}
function loadResource(url,onSuccess,onFailure,asynchronous){onSuccess=onSuccess||function _onSuccess(data){};onFailure=onFailure||function _onFailure(){consoleWarn(url+' not found.');};var xhr=new XMLHttpRequest();xhr.open('GET',url,asynchronous);if(xhr.overrideMimeType){xhr.overrideMimeType('text/plain; charset=utf-8');}
xhr.onreadystatechange=function(){if(xhr.readyState==4){if(xhr.status==200||xhr.status===0){onSuccess(xhr.responseText);}else{onFailure();}}};xhr.onerror=onFailure;xhr.ontimeout=onFailure;try{xhr.send(null);}catch(e){onFailure();}}
loadResource(href,function(response){if(/\.json$/.test(href)){gL10nData=JSON.parse(response);}else{var data=parseProperties(response);for(var key in data){var id,prop,nestedProp,index=key.lastIndexOf('.');if(index>0){id=key.slice(0,index);prop=key.slice(index+1);index=id.lastIndexOf('.');if(index>0){nestedProp=id.substr(index+1);if(gNestedProps.indexOf(nestedProp)>-1){id=id.substr(0,index);prop=nestedProp+'.'+prop;}}}else{index=key.lastIndexOf('[');if(index>0){id=key.slice(0,index);prop='_'+key.slice(index);}else{id=key;prop='_';}}
if(!gL10nData[id]){gL10nData[id]={};}
gL10nData[id][prop]=data[key];}}
if(successCallback){successCallback();}},failureCallback,gAsyncResourceLoading);};function loadLocale(lang,translationRequired){clear();gReadyState='loading';gLanguage=lang;var untranslatedElements=[];var inlineDict=getL10nDictionary(lang);if(inlineDict){gL10nData=inlineDict;if(translationRequired){untranslatedElements=translateFragment();}}
function finish(){if(translationRequired){if(!inlineDict){untranslatedElements=translateFragment();}else if(untranslatedElements.length){untranslatedElements=translateElements(untranslatedElements);}}
gReadyState='complete';fireL10nReadyEvent(lang);consoleWarn_missingKeys(untranslatedElements,lang);}
function l10nResourceLink(link){var re=/\{\{\s*locale\s*\}\}/;var parse=function(locale,onload,onerror){var href=unescape(link.href).replace(re,locale);parseResource(href,locale,onload,function notFound(){consoleWarn(href+' not found.');onerror();});};this.load=function(locale,onload,onerror){onerror=onerror||function(){};parse(locale,onload,function parseFallbackLocale(){if(re.test(unescape(link.href))&&gDefaultLocale!=locale){consoleLog('Trying the fallback locale: '+gDefaultLocale);parse(gDefaultLocale,onload,onerror);}else{onerror();}});};}
var resourceLinks=getL10nResourceLinks();var resourceCount=resourceLinks.length;if(!resourceCount){consoleLog('no resource to load, early way out');translationRequired=false;finish();}else{var onResourceCallback=function(){if(--resourceCount<=0){finish();}};for(var i=0,l=resourceCount;i<l;i++){var resource=new l10nResourceLink(resourceLinks[i]);resource.load(lang,onResourceCallback,onResourceCallback);}}}
function clear(){gL10nData={};gLanguage='';}
var kPluralForms=['zero','one','two','few','many','other'];function getPluralRules(lang){var locales2rules={'af':3,'ak':4,'am':4,'ar':1,'asa':3,'az':0,'be':11,'bem':3,'bez':3,'bg':3,'bh':4,'bm':0,'bn':3,'bo':0,'br':20,'brx':3,'bs':11,'ca':3,'cgg':3,'chr':3,'cs':12,'cy':17,'da':3,'de':3,'dv':3,'dz':0,'ee':3,'el':3,'en':3,'eo':3,'es':3,'et':3,'eu':3,'fa':0,'ff':5,'fi':3,'fil':4,'fo':3,'fr':5,'fur':3,'fy':3,'ga':8,'gd':24,'gl':3,'gsw':3,'gu':3,'guw':4,'gv':23,'ha':3,'haw':3,'he':2,'hi':4,'hr':11,'hu':0,'id':0,'ig':0,'ii':0,'is':3,'it':3,'iu':7,'ja':0,'jmc':3,'jv':0,'ka':0,'kab':5,'kaj':3,'kcg':3,'kde':0,'kea':0,'kk':3,'kl':3,'km':0,'kn':0,'ko':0,'ksb':3,'ksh':21,'ku':3,'kw':7,'lag':18,'lb':3,'lg':3,'ln':4,'lo':0,'lt':10,'lv':6,'mas':3,'mg':4,'mk':16,'ml':3,'mn':3,'mo':9,'mr':3,'ms':0,'mt':15,'my':0,'nah':3,'naq':7,'nb':3,'nd':3,'ne':3,'nl':3,'nn':3,'no':3,'nr':3,'nso':4,'ny':3,'nyn':3,'om':3,'or':3,'pa':3,'pap':3,'pl':13,'ps':3,'pt':3,'rm':3,'ro':9,'rof':3,'ru':11,'rwk':3,'sah':0,'saq':3,'se':7,'seh':3,'ses':0,'sg':0,'sh':11,'shi':19,'sk':12,'sl':14,'sma':7,'smi':7,'smj':7,'smn':7,'sms':7,'sn':3,'so':3,'sq':3,'sr':11,'ss':3,'ssy':3,'st':3,'sv':3,'sw':3,'syr':3,'ta':3,'te':3,'teo':3,'th':0,'ti':4,'tig':3,'tk':3,'tl':4,'tn':3,'to':0,'tr':0,'ts':3,'tzm':22,'uk':11,'ur':3,'ve':3,'vi':0,'vun':3,'wa':4,'wae':3,'wo':0,'xh':3,'xog':3,'yo':0,'zh':0,'zu':3};function isIn(n,list){return list.indexOf(n)!==-1;}
function isBetween(n,start,end){return start<=n&&n<=end;}
var pluralRules={'0':function(n){return'other';},'1':function(n){if((isBetween((n%100),3,10)))
return'few';if(n===0)
return'zero';if((isBetween((n%100),11,99)))
return'many';if(n==2)
return'two';if(n==1)
return'one';return'other';},'2':function(n){if(n!==0&&(n%10)===0)
return'many';if(n==2)
return'two';if(n==1)
return'one';return'other';},'3':function(n){if(n==1)
return'one';return'other';},'4':function(n){if((isBetween(n,0,1)))
return'one';return'other';},'5':function(n){if((isBetween(n,0,2))&&n!=2)
return'one';return'other';},'6':function(n){if(n===0)
return'zero';if((n%10)==1&&(n%100)!=11)
return'one';return'other';},'7':function(n){if(n==2)
return'two';if(n==1)
return'one';return'other';},'8':function(n){if((isBetween(n,3,6)))
return'few';if((isBetween(n,7,10)))
return'many';if(n==2)
return'two';if(n==1)
return'one';return'other';},'9':function(n){if(n===0||n!=1&&(isBetween((n%100),1,19)))
return'few';if(n==1)
return'one';return'other';},'10':function(n){if((isBetween((n%10),2,9))&&!(isBetween((n%100),11,19)))
return'few';if((n%10)==1&&!(isBetween((n%100),11,19)))
return'one';return'other';},'11':function(n){if((isBetween((n%10),2,4))&&!(isBetween((n%100),12,14)))
return'few';if((n%10)===0||(isBetween((n%10),5,9))||(isBetween((n%100),11,14)))
return'many';if((n%10)==1&&(n%100)!=11)
return'one';return'other';},'12':function(n){if((isBetween(n,2,4)))
return'few';if(n==1)
return'one';return'other';},'13':function(n){if((isBetween((n%10),2,4))&&!(isBetween((n%100),12,14)))
return'few';if(n!=1&&(isBetween((n%10),0,1))||(isBetween((n%10),5,9))||(isBetween((n%100),12,14)))
return'many';if(n==1)
return'one';return'other';},'14':function(n){if((isBetween((n%100),3,4)))
return'few';if((n%100)==2)
return'two';if((n%100)==1)
return'one';return'other';},'15':function(n){if(n===0||(isBetween((n%100),2,10)))
return'few';if((isBetween((n%100),11,19)))
return'many';if(n==1)
return'one';return'other';},'16':function(n){if((n%10)==1&&n!=11)
return'one';return'other';},'17':function(n){if(n==3)
return'few';if(n===0)
return'zero';if(n==6)
return'many';if(n==2)
return'two';if(n==1)
return'one';return'other';},'18':function(n){if(n===0)
return'zero';if((isBetween(n,0,2))&&n!==0&&n!=2)
return'one';return'other';},'19':function(n){if((isBetween(n,2,10)))
return'few';if((isBetween(n,0,1)))
return'one';return'other';},'20':function(n){if((isBetween((n%10),3,4)||((n%10)==9))&&!(isBetween((n%100),10,19)||isBetween((n%100),70,79)||isBetween((n%100),90,99)))
return'few';if((n%1000000)===0&&n!==0)
return'many';if((n%10)==2&&!isIn((n%100),[12,72,92]))
return'two';if((n%10)==1&&!isIn((n%100),[11,71,91]))
return'one';return'other';},'21':function(n){if(n===0)
return'zero';if(n==1)
return'one';return'other';},'22':function(n){if((isBetween(n,0,1))||(isBetween(n,11,99)))
return'one';return'other';},'23':function(n){if((isBetween((n%10),1,2))||(n%20)===0)
return'one';return'other';},'24':function(n){if((isBetween(n,3,10)||isBetween(n,13,19)))
return'few';if(isIn(n,[2,12]))
return'two';if(isIn(n,[1,11]))
return'one';return'other';}};var index=locales2rules[lang.replace(/-.*$/,'')];if(!(index in pluralRules)){consoleWarn('plural form unknown for ['+lang+']');return function(){return'other';};}
return pluralRules[index];}
gMacros.plural=function(str,param,key,prop){var n=parseFloat(param);if(isNaN(n)){return str;}
var data=gL10nData[key];if(!data){return str;}
if(!gMacros._pluralRules){gMacros._pluralRules=getPluralRules(gLanguage);}
var index='['+gMacros._pluralRules(n)+']';if(n===0&&(prop+'[zero]')in data){str=data[prop+'[zero]'];}else if(n==1&&(prop+'[one]')in data){str=data[prop+'[one]'];}else if(n==2&&(prop+'[two]')in data){str=data[prop+'[two]'];}else if((prop+index)in data){str=data[prop+index];}else if((prop+'[other]')in data){str=data[prop+'[other]'];}
return str;};var reArgs=/\{\{\s*(.+?)\s*\}\}/;var reIndex=/\{\[\s*([a-zA-Z]+)\(([a-zA-Z]+)\)\s*\]\}/;function getL10nData(key,args){var data=gL10nData[key];if(!data){return null;}
var rv={};for(var prop in data){var str=data[prop];str=substIndexes(str,args,key,prop);str=substArguments(str,args,key);rv[prop]=str;}
return rv;}
function getL10nArgs(str){var args=[];var match=reArgs.exec(str);while(match&&match.length>=2){args.push({name:match[1],subst:match[0]});str=str.substr(match.index+match[0].length);match=reArgs.exec(str);}
return args;}
function getSubDictionary(fragment){if(!fragment){return JSON.parse(JSON.stringify(gL10nData));}
var dict={};var elements=getTranslatableChildren(fragment);function checkGlobalArguments(str){var match=getL10nArgs(str);for(var i=0;i<match.length;i++){var arg=match[i].name;if(arg in gL10nData){dict[arg]=gL10nData[arg];}}}
for(var i=0,l=elements.length;i<l;i++){var id=getL10nAttributes(elements[i]).id;var data=gL10nData[id];if(!id||!data){continue;}
dict[id]=data;for(var prop in data){var str=data[prop];checkGlobalArguments(str);if(reIndex.test(str)){for(var j=0;j<kPluralForms.length;j++){var key=id+'['+kPluralForms[j]+']';if(key in gL10nData){dict[key]=gL10nData[key];checkGlobalArguments(gL10nData[key]);}}}}}
return dict;}
function substIndexes(str,args,key,prop){var reMatch=reIndex.exec(str);if(!reMatch||!reMatch.length){return str;}
var macroName=reMatch[1];var paramName=reMatch[2];var param;if(args&&paramName in args){param=args[paramName];}else if(paramName in gL10nData){param=gL10nData[paramName];}
if(macroName in gMacros){var macro=gMacros[macroName];str=macro(str,param,key,prop);}
return str;}
function substArguments(str,args,key){var match=getL10nArgs(str);for(var i=0;i<match.length;i++){var sub,arg=match[i].name;if(args&&arg in args){sub=args[arg];}else if(arg in gL10nData){sub=gL10nData[arg]['_'];}else{consoleLog('argument {{'+arg+'}} for #'+key+' is undefined.');return str;}
str=str.replace(match[i].subst,sub);}
return str;}
function translateElement(element){var l10n=getL10nAttributes(element);if(!l10n.id){return true;}
var data=getL10nData(l10n.id,l10n.args);if(!data){return false;}
for(var k in data){if(k==='_'){setTextContent(element,data._);}else{var idx=k.lastIndexOf('.');var nestedProp=k.substr(0,idx);if(gNestedProps.indexOf(nestedProp)>-1){element[nestedProp][k.substr(idx+1)]=data[k];}else if(k==='ariaLabel'){element.setAttribute('aria-label',data[k]);}else{element[k]=data[k];}}}
return true;}
function translateElements(elements){var untranslated=[];for(var i=0,l=elements.length;i<l;i++){if(!translateElement(elements[i])){untranslated.push(elements[i]);}}
return untranslated;}
function translateFragment(element){element=element||document.documentElement;var untranslated=translateElements(getTranslatableChildren(element));if(!translateElement(element)){untranslated.push(element);}
return untranslated;}
function localizeElement(element,id,args){if(!element){return;}
if(!id){element.removeAttribute('data-l10n-id');element.removeAttribute('data-l10n-args');setTextContent(element,'');return;}
element.setAttribute('data-l10n-id',id);if(args&&typeof args==='object'){element.setAttribute('data-l10n-args',JSON.stringify(args));}else{element.removeAttribute('data-l10n-args');}
if(gReadyState==='complete'){translateElement(element);}}
function l10nStartup(){gDefaultLocale=document.documentElement.lang||gDefaultLocale;gReadyState='interactive';consoleLog('loading ['+navigator.language+'] resources, '+
(gAsyncResourceLoading?'asynchronously.':'synchronously.'));var translationRequired=(document.documentElement.lang!==navigator.language);loadLocale(navigator.language,translationRequired);}
if(typeof(document)!=='undefined'){if(document.readyState==='complete'||document.readyState==='interactive'){window.setTimeout(l10nStartup);}else{document.addEventListener('DOMContentLoaded',l10nStartup);}}
if('mozSettings'in navigator&&navigator.mozSettings){navigator.mozSettings.addObserver('language.current',function(event){loadLocale(event.settingValue,true);});}
navigator.mozL10n={get:function l10n_get(key,args){var data=getL10nData(key,args);if(!data){consoleWarn('#'+key+' is undefined.');return'';}else{return data._;}},get language(){return{get code(){return gLanguage;},set code(lang){loadLocale(lang,true);},get direction(){var rtlList=['ar','he','fa','ps','ur'];return(rtlList.indexOf(gLanguage)>=0)?'rtl':'ltr';}};},translate:translateFragment,localize:localizeElement,getDictionary:getSubDictionary,get readyState(){return gReadyState;},ready:function l10n_ready(callback){if(!callback){return;}
if(gReadyState=='complete'){window.setTimeout(callback);}else{window.addEventListener('localized',callback);}}};consoleLog('library loaded.');})(this);;'use strict';navigator.mozL10n.DateTimeFormat=function(locales,options){var _=navigator.mozL10n.get;function localeFormat(d,format){var tokens=format.match(/(%E.|%O.|%.)/g);for(var i=0;tokens&&i<tokens.length;i++){var value='';switch(tokens[i]){case'%a':value=_('weekday-'+d.getDay()+'-short');break;case'%A':value=_('weekday-'+d.getDay()+'-long');break;case'%b':case'%h':value=_('month-'+d.getMonth()+'-short');break;case'%B':value=_('month-'+d.getMonth()+'-long');break;case'%Eb':value=_('month-'+d.getMonth()+'-genitive');break;case'%I':value=d.getHours()%12||12;break;case'%e':value=d.getDate();break;case'%p':value=d.getHours()<12?'AM':'PM';break;case'%c':case'%x':case'%X':var tmp=_('dateTimeFormat_'+tokens[i]);if(tmp&&!(/(%c|%x|%X)/).test(tmp)){value=localeFormat(d,tmp);}
break;}
format=format.replace(tokens[i],value||d.toLocaleFormat(tokens[i]));}
return format;}
function relativeParts(seconds){seconds=Math.abs(seconds);var descriptors={};var units=['years',86400*365,'months',86400*30,'weeks',86400*7,'days',86400,'hours',3600,'minutes',60];if(seconds<60){return{minutes:Math.round(seconds/60)};}
for(var i=0,uLen=units.length;i<uLen;i+=2){var value=units[i+1];if(seconds>=value){descriptors[units[i]]=Math.floor(seconds/value);seconds-=descriptors[units[i]]*value;}}
return descriptors;}
function prettyDate(time,useCompactFormat,maxDiff){maxDiff=maxDiff||86400*10;switch(time.constructor){case String:time=parseInt(time);break;case Date:time=time.getTime();break;}
var secDiff=(Date.now()-time)/1000;if(isNaN(secDiff)){return _('incorrectDate');}
if(secDiff>maxDiff){return localeFormat(new Date(time),'%x');}
var f=useCompactFormat?'-short':'-long';var parts=relativeParts(secDiff);var affix=secDiff>=0?'-ago':'-until';for(var i in parts){return _(i+affix+f,{value:parts[i]});}}
return{localeDateString:function localeDateString(d){return localeFormat(d,'%x');},localeTimeString:function localeTimeString(d){return localeFormat(d,'%X');},localeString:function localeString(d){return localeFormat(d,'%c');},localeFormat:localeFormat,fromNow:prettyDate,relativeParts:relativeParts};};;'use strict';var Message=function Message(type,data){this.type=type;this.data=data;};Message.Type={'ADD_BOOKMARK':0};;'use strict';var GridItemsFactory={TYPE:{APP:'app',BOOKMARK:'bookmark',COLLECTION:'collection'},create:function gif_create(params){var item=Bookmark;if(params.type===GridItemsFactory.TYPE.COLLECTION){item=Collection;}
return new item(params);}};var GridItem=function GridItem(params){this.type=GridItemsFactory.TYPE.APP;this.removable=true;this.iconable='iconable'in params?params.iconable:true;this.id=params.id||'';this.url=this.origin=this.bookmarkURL=params.bookmarkURL;this.features=params.features||'';this.manifest={name:params.name,default_locale:'en-US'};if(params.icon){this.manifest.icons={60:params.icon};}
if(params.apps){this.manifest.apps=params.apps;}
this.useAsyncPanZoom='useAsyncPanZoom'in params&&params.useAsyncPanZoom;};GridItem.prototype={launch:function gc_launch(){},uninstall:function gc_uninstall(){GridManager.uninstall(this);},getFeatures:function gc_getFeatures(){return{id:this.id,name:this.manifest.name,icon:this.manifest.icons&&this.manifest.icons['60'],remote:true,useAsyncPanZoom:this.useAsyncPanZoom,features:this.features};}};var Collection=function Collection(params,cb){GridItem.call(this,params);this.iconable=false;this.type=GridItemsFactory.TYPE.COLLECTION;this.hideFromGrid=!!params.hideFromGrid;this.providerId=params.provider_id||params.id;};Collection.prototype={__proto__:GridItem.prototype,launch:function sc_launch(){var features=this.getFeatures();features.id=this.id;window.dispatchEvent(new CustomEvent('collectionlaunch',{'detail':features}));}};;'use strict';var Bookmark=function Bookmark(params){GridItem.call(this,params);this.url=this.origin=this.sanitizeURL(params.bookmarkURL);this.bookmarkURL=this.generateIndex(this.url);this.type=GridItemsFactory.TYPE.BOOKMARK;};Bookmark.prototype={__proto__:GridItem.prototype,_INDEX_PREFIX:'bookmark:',sanitizeURL:function bookmark_sanitizeURL(url){url=url.trim();var prefix=this._INDEX_PREFIX;return url.startsWith(prefix)?url.substr(prefix.length):url;},generateIndex:function bookmark_generateIndex(url){var prefix=this._INDEX_PREFIX;return url.startsWith(prefix)?url:prefix+url;},launch:function bookmark_launch(){var features=this.getFeatures();window.open(this.url,'_blank',Object.keys(features).map(function(key){return encodeURIComponent(key)+'='+encodeURIComponent(features[key]);}).join(','));}};;'use strict';var BookmarkEditor={init:function bookmarkEditor_show(options){this.data=options.data;this.onsaved=options.onsaved;this.oncancelled=options.oncancelled;this.origin=document.location.protocol+'//homescreen.'+
document.location.host.replace(/(^[\w\d]+.)?([\w\d]+.[a-z]+)/,'$2');if(document.readyState==='complete'||document.readyState==='interactive'){this._init();}else{var self=this;document.addEventListener('DOMContentLoaded',function loaded(){document.removeEventListener('DOMContentLoaded',loaded);self._init();});}},_init:function bookmarkEditor_init(){document.getElementById('bookmark-form').onsubmit=function(){return false;};this.bookmarkEntrySheet=document.getElementById('bookmark-entry-sheet');this.bookmarkTitle=document.getElementById('bookmark-title');this.bookmarkUrl=document.getElementById('bookmark-url');this.cancelButton=document.getElementById('button-bookmark-cancel');this.addButton=document.getElementById('button-bookmark-add');this.cancelButton.addEventListener('click',this.close.bind(this));this.saveListener=this.save.bind(this);this.addButton.addEventListener('click',this.saveListener);this.addButton.removeAttribute('disabled');this.bookmarkTitle.value=this.data.name||'';this.bookmarkUrl.value=this.data.url||'';if(this.bookmarkTitle.value.trim()===''){this.addButton.setAttribute('disabled','disabled');}
this.bookmarkTitle.addEventListener('input',this.addRemoveDisabled.bind(this));},addRemoveDisabled:function bookmarkEditor_addRemoveDisabled(){if(this.bookmarkTitle.value.trim()===''){this.addButton.setAttribute('disabled','disabled');}else{this.addButton.removeAttribute('disabled');}},close:function bookmarkEditor_close(){this.oncancelled();},save:function bookmarkEditor_save(evt){if(/^https?:/.test(this.bookmarkUrl.value)==false)
return;this.data.name=this.bookmarkTitle.value;this.data.bookmarkURL=this.bookmarkUrl.value;var homeScreenWindow=window.open('','main');if(!homeScreenWindow)
this.close();else{homeScreenWindow.postMessage(new Message(Message.Type.ADD_BOOKMARK,this.data),this.origin);this.onsaved();}}};;'use strict';var utils=this.utils||{};utils.status=(function(){var FILE_NAME='status';var DISPLAYED_TIME=1500;var section,content;var timeoutID;function clearHideTimeout(){if(timeoutID===null){return;}
window.clearTimeout(timeoutID);timeoutID=null;}
function show(message,duration){clearHideTimeout();content.innerHTML='';if(typeof message==='string'){content.textContent=message;}else{try{content.appendChild(message);}catch(ex){console.error('DOMException: '+ex.message);}}
section.classList.remove('hidden');section.classList.add('onviewport');timeoutID=window.setTimeout(hide,duration||DISPLAYED_TIME);}
function animationEnd(evt){var eventName='status-showed';if(evt.animationName==='hide'){clearHideTimeout();section.classList.add('hidden');eventName='status-hidden';}
window.dispatchEvent(new CustomEvent(eventName));}
function hide(){section.classList.remove('onviewport');}
function destroy(){section.removeEventListener('animationend',animationEnd);document.body.removeChild(section);clearHideTimeout();section=content=null;}
function getPath(){return'/js/components/';}
function initialize(){if(section){return;}
section=document.createElement('section');var link=document.createElement('link');link.type='text/css';link.rel='stylesheet';link.href=getPath()+'status-behavior.css';document.head.appendChild(link);section.setAttribute('role','status');section.classList.add('hidden');content=document.createElement('p');section.appendChild(content);section.addEventListener('animationend',animationEnd);setTimeout(function append(){document.body.appendChild(section);});}
if(document.readyState==='complete'){initialize();}else{document.addEventListener('DOMContentLoaded',function loaded(){document.removeEventListener('DOMContentLoaded',loaded);initialize();});}
return{init:initialize,show:show,hide:hide,destroy:destroy,setDuration:function setDuration(time){DISPLAYED_TIME=time||DISPLAYED_TIME;}};})();;'use strict';if(navigator.mozSetMessageHandler){navigator.mozSetMessageHandler('activity',function onActivity(activity){switch(activity.source.name){case'save-bookmark':var bookmarkSaved=function sb_bookmarkSaved(){window.addEventListener('status-hidden',function hidden(){window.removeEventListener('status-hidden',hidden);activity.postResult('saved');});utils.status.show(navigator.mozL10n.get('added-to-home-screen'));};var addBookmarkCancelled=function sb_addBookmarkCancelled(){activity.postError('cancelled');};var data=activity.source.data;if(data.type==='url'){var options={data:data,onsaved:bookmarkSaved,oncancelled:addBookmarkCancelled};BookmarkEditor.init(options);document.addEventListener('visibilitychange',function changed(){if(document.hidden){BookmarkEditor.close();}});}else{activity.postError('type not supported');}
break;default:activity.postError('name not supported');}});}