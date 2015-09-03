var Biojs=function(){};Biojs.EventHandler=function(t){this.eventType=t,this.listeners=[],this.addListener=function(t){"function"==typeof t&&this.listeners.push(t)},this.removeListener=function(t){if("function"==typeof t){var e=Biojs.Utils.indexOf(this.listeners,t);-1!=e&&this.listeners.splice(e,1)}},this.triggerEvent=function(t){for(var e in this.listeners)this.listeners[e](t)}},Biojs.Event=function(t,e,o){this.source=o,this.type=t;for(var i in e)this[i]=e[i]},Biojs.Utils={clone:function(t){var e=t instanceof Array?[]:{};for(i in t)e[i]=t[i]&&"object"==typeof t[i]?Biojs.Utils.clone(t[i]):t[i];return e},isEmpty:function(t){if(t instanceof Array)return t.length<=0;for(var e in t)if(t.hasOwnProperty(e))return!1;return!0},indexOf:function(t,e,o){var i;if(e){if(indexOf)return indexOf.call(e,t,o);for(i=e.length,o=o?0>o?Math.max(0,i+o):o:0;i>o;o++)if(o in e&&e[o]===t)return o}return-1},console:{enable:function(){if(window.console)this.log=function(t){console.log(t)};else if(window.opera)this.log=function(t){window.opera.postError(t)};else{var t=window.open("","myconsole","width=350,height=250,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1");t?(t.document.writeln('<html><head><title>BioJS Console</title></head><body bgcolor=white onLoad="self.focus()"><div id="Biojs.console"></div></body></html>'),t.document.close(),Biojs.console.domDocument=t.document,Biojs.console.domDivNode=t.document.getElementById("Biojs.console"),this.log=function(t){var e="";if(t instanceof Array)for(o=0;o<t.length;o++)e+="["+o+"]="+t[o]+" ";else if(t instanceof String||"string"==typeof t)e=t;else for(var o in t)e+="["+o+"]="+t[o]+" ";textNode=Biojs.console.domDocument.createTextNode(e),line=Biojs.console.domDocument.createElement("pre"),line.appendChild(textNode),Biojs.console.domDivNode.appendChild(line)}):alert("Please activate the pop-up window in this page in order to enable the BioJS console")}},log:function(){}}},Biojs.extend=function(t,e){var o=Biojs.prototype.extend;Biojs._prototyping=!0;var i=new this;if(i.eventTypes instanceof Array)for(var n in i.eventTypes)t.eventTypes.push(i.eventTypes[n]);if(i.opt instanceof Object)for(var s in i.opt)t.opt[s]=i.opt[s];o.call(i,t),i.base=function(){},delete Biojs._prototyping;var r=i.constructor,a=i.constructor=function(){function t(){}if(!Biojs._prototyping){if(this.constructor==a){t.prototype=i;var e=new t;return e.setOptions(arguments[0]),e.setEventHandlers(e.eventTypes),e.biojsObjectId=Biojs.uniqueId(),Biojs.addInstance(e),r.apply(e,arguments),e}r.apply(this,arguments)}};return a.ancestor=this,a.extend=this.extend,a.forEach=this.forEach,a.implement=this.implement,a.prototype=i,a.valueOf=function(t){return"object"==t?a:r.valueOf()},a.toString=this.toString,o.call(a,e),"function"==typeof a.init&&a.init(),a},Biojs.prototype={extend:function(t,e){if(arguments.length>1){var o=this[t];if(o&&"function"==typeof e&&(!o.valueOf||o.valueOf()!=e.valueOf())&&/\bbase\b/.test(e)){var i=e.valueOf();e=function(){var t=this.base||Biojs.prototype.base;this.base=o;var e=i.apply(this,arguments);return this.base=t,e},e.valueOf=function(t){return"object"==t?e:i},e.toString=Biojs.toString}this[t]=e}else if(t){var n=Biojs.prototype.extend;Biojs._prototyping||"function"==typeof this||(n=this.extend||n);for(var s={toSource:null},r=["constructor","toString","valueOf"],a=Biojs._prototyping?0:1;h=r[a++];)t[h]!=s[h]&&n.call(this,h,t[h]);for(var h in t)s[h]||n.call(this,h,t[h])}return this},addListener:function(t,e){if(this._eventHandlers)for(var o in this._eventHandlers)if(t==this._eventHandlers[o].eventType)return void this._eventHandlers[o].addListener(e)},removeListener:function(t,e){if(this._eventHandlers)for(var o in this._eventHandlers)if(t==this._eventHandlers[o].eventType)return void this._eventHandlers[o].removeListener(e)},setEventHandlers:function(t){this._eventHandlers=[];var e=function(t){return function(e){t.listeners.push(e)}};if("object"==typeof t)for(var o=0;o<t.length;o++){var i=new Biojs.EventHandler(t[o]);this._eventHandlers.push(i),this[t[o]]=new e(i)}},raiseEvent:function(t,e){for(var o in this._eventHandlers)if(t==this._eventHandlers[o].eventType)return void this._eventHandlers[o].triggerEvent(e)},setOptions:function(t){if(this.opt instanceof Object){this.opt=Biojs.Utils.clone(this.opt);for(var e in t)this.opt[e]=t[e]}},listen:function(t,e,o){t instanceof Biojs&&"function"==typeof o&&t.addListener(e,o)},getId:function(){return this.biojsObjectId}},Biojs=Biojs.extend({constructor:function(){this.extend(arguments[0])},vaueOf:function(){return"Biojs"}},{ancestor:Object,version:"1.0",forEach:function(t,e,o){for(var i in t)void 0===this.prototype[i]&&e.call(o,t[i],i,t)},implement:function(){for(var t=0;t<arguments.length;t++)"function"==typeof arguments[t]?arguments[t](this.prototype):this.prototype.extend(arguments[t]);return this},toString:function(){return String(this.valueOf())},uniqueId:function(){return"undefined"==typeof Biojs.prototype.__uniqueid&&(Biojs.prototype.__uniqueid=0),Biojs.prototype.__uniqueid++},addInstance:function(t){return"undefined"==typeof Biojs.prototype.__instances&&(Biojs.prototype.__instances={}),Biojs.prototype.__instances[t.biojsObjectId]=t},getInstance:function(t){return Biojs.prototype.__instances[t]},registerGlobal:function(t,e){window[t]=e},getGlobal:function(t){return window[t]},console:Biojs.Utils.console,EventHandler:Biojs.EventHandler,Event:Biojs.Event,Utils:Biojs.Utils}),Biojs.Sequence=Biojs.extend({constructor:function(){var t=this;this._container=jQuery("#"+this.opt.target),this._container.ready(function(){t._initialize()})},opt:{sequence:"",id:"",target:"",format:"FASTA",selection:{start:0,end:0},columns:{size:35,spacedEach:10},highlights:[],annotations:[],sequenceUrl:"http://www.ebi.ac.uk/das-srv/uniprot/das/uniprot/sequence",selectionColor:"Yellow",selectionFontColor:"black",highlightFontColor:"red",highlightBackgroundColor:"white",fontFamily:'"Andale mono", courier, monospace',fontSize:"12px",fontColor:"inherit",backgroundColor:"inherit",width:void 0,height:void 0,formatSelectorVisible:!0},eventTypes:["onSelectionChanged","onSelectionChange","onAnnotationClicked"],_headerDiv:null,_contentDiv:null,_initialize:function(){void 0!==this.opt.width&&this._container.width(this.opt.width),void 0!==this.opt.height&&this._container.height(this.opt.height),this._container.css({"-moz-user-select":"none","-webkit-user-select":"none","user-select":"none"}),this._buildFormatSelector(),this._contentDiv=jQuery("<div></div>").appendTo(this._container),this._contentDiv.css({"font-family":this.opt.fontFamily,"font-size":this.opt.fontSize,"text-align":"left"}),this._highlights=this.opt.highlights,this._annotations=this.opt.annotations,jQuery('<div id="sequenceTip'+this.getId()+'"></div>').css({position:"absolute","z-index":"999999",color:"#fff","font-size":"12px",width:"auto",display:"none"}).addClass("tooltip").appendTo("body").hide(),Biojs.Utils.isEmpty(this.opt.sequence)?Biojs.Utils.isEmpty(this.opt.id)?this.clearSequence("No sequence available","../biojs/css/images/warning_icon.png"):this._requestSequence(this.opt.id):this._redraw()},setSequence:function(t,e){t.match(/^([A-N,R-Z][0-9][A-Z][A-Z, 0-9][A-Z, 0-9][0-9])|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$/i)?this._requestSequence(arguments[0]):(this.opt.sequence=t,this.opt.id=e,this._highlights=[],this._highlightsCount=0,this.opt.selection={start:0,end:0},this._annotations=[],this._contentDiv.children().remove(),this._redraw())},_requestSequence:function(t){var e=this;Biojs.console.log("Requesting sequence for: "+t),jQuery.ajax({url:e.opt.sequenceUrl,dataType:"xml",data:{segment:t},success:function(t){try{var o=jQuery(t).find("SEQUENCE:first");e.setSequence(o.text(),o.attr("id"),o.attr("label"))}catch(i){Biojs.console.log("Error decoding response data: "+i.message),e.clearSequence("No sequence available","../biojs/css/images/warning_icon.png")}},error:function(t,o){Biojs.console.log("Error decoding response data: "+o),e.clearSequence("Error requesting the sequence to the server "+this.url,"../biojs/css/images/warning_icon.png")}})},clearSequence:function(t,e){var o=void 0;this.opt.sequence="",this.opt.id="",this._highlights=[],this._highlightsCount=0,this.opt.selection={start:0,end:0},this._annotations=[],this._contentDiv.children().remove(),this._headerDiv.hide(),void 0!==t&&(o=jQuery("<div>"+t+"</div>").appendTo(this._contentDiv).addClass("message"),void 0!==e&&o.css({background:'transparent url("'+e+'") no-repeat center left',"padding-left":"20px"}))},setSelection:function(t,e){if(t>e){var o=e;e=t,t=o}(t!=this.opt.selection.start||e!=this.opt.selection.end)&&(this._setSelection(t,e),this.raiseEvent(Biojs.Sequence.EVT_ON_SELECTION_CHANGED,{start:t,end:e}))},_buildFormatSelector:function(){var t=this;this._headerDiv=jQuery("<div></div>").appendTo(this._container),this._headerDiv.css({"font-family":'"Heveltica Neue", Arial, "sans serif"',"font-size":"14px"}).append("Format: "),this._formatSelector=jQuery('<select> <option value="FASTA">FASTA</option><option value="CODATA">CODATA</option><option value="PRIDE">PRIDE</option><option value="RAW">RAW</option></select>').appendTo(t._headerDiv),this._formatSelector.change(function(){t.opt.format=jQuery(this).val(),t._redraw()}),this._formatSelector.val(t.opt.format),this.formatSelectorVisible(this.opt.formatSelectorVisible)},highlight:function(t,e,o,i,n){return this.addHighlight({start:t,end:e,color:o,background:i,id:n})},addHighlight:function(t){var e="-1",o="",i="",n={};return t instanceof Object&&t.start<=t.end&&(o="string"==typeof t.color?t.color:this.opt.highlightFontColor,i="string"==typeof t.background?t.background:this.opt.highlightBackgroundColor,e="string"==typeof t.id?t.id:new Number(this._highlightsCount++).toString(),n={start:t.start,end:t.end,color:o,background:i,id:e},this._highlights.push(n),this._applyHighlight(n),this._restoreSelection(t.start,t.end)),e},_applyHighlight:function(t){for(var e=this._contentDiv.find(".sequence"),i=t.start-1;i<t.end;i++)zindex=jQuery(e[i]).css("z-index"),"auto"==zindex?(z=1,o=1):(z=0,o=.5),jQuery(e[i]).css({color:t.color,"background-color":t.background,"z-index":z,opacity:o}).addClass("highlighted")},_applyHighlights:function(t){for(var e in t)this._applyHighlight(t[e])},_restoreHighlights:function(t,e){var o=this._highlights;this._applyHighlight({start:t,end:e,color:this.opt.fontColor,background:this.opt.backgroundColor});for(var i in o)o[i].start>e||o[i].end<t||(a=o[i].start<t?t:o[i].start,b=o[i].end>e?e:o[i].end,this._applyHighlight({start:a,end:b,color:o[i].color,background:o[i].background}))},_restoreSelection:function(t,e){var o=this.opt.selection;t>o.end||e<o.start||(a=t<o.start?o.start:t,b=e>o.end?o.end:e,this._applyHighlight({start:a,end:b,color:this.opt.selectionFontColor,background:this.opt.selectionColor}))},unHighlight:function(t){this.removeHighlight(t)},removeHighlight:function(t){var e=this._highlights;for(i in e)if(e[i].id==t){start=e[i].start,end=e[i].end,e.splice(i,1),this._restoreHighlights(start,end),this._restoreSelection(start,end);break}},unHighlightAll:function(){this.removeAllHighlights()},removeAllHighlights:function(){this._highlights=[],this._restoreHighlights(1,this.opt.sequence.length),this._restoreSelection(1,this.opt.sequence.length)},setFormat:function(t){this.opt.format!=t.toUpperCase()&&(this.opt.format=t.toUpperCase(),this._redraw());var e=this;this._headerDiv.find("option").each(function(){jQuery(this).val()==e.opt.format.toUpperCase()&&jQuery(this).attr("selected","selected")})},setNumCols:function(t){this.opt.columns.size=t,this._redraw()},formatSelectorVisible:function(t){t?this._headerDiv.show():this._headerDiv.hide()},showFormatSelector:function(){this._headerDiv.show()},hideFormatSelector:function(){this._headerDiv.hide()},hide:function(){this._headerDiv.hide(),this._contentDiv.hide()},show:function(){this._headerDiv.show(),this._contentDiv.show()},_setSelection:function(t,e){var o=this.opt.selection,i={};o.start==t?o.end<e?(i.start=o.end,i.end=e):this._restoreHighlights(e+1,o.end):o.end==e?o.start>t?(i.start=t,i.end=o.start):this._restoreHighlights(o.start,t-1):(this._restoreHighlights(o.start,o.end),i.start=t,i.end=e),o.start=t,o.end=e,void 0!=i.start&&this._applyHighlight({start:i.start,end:i.end,color:this.opt.selectionFontColor,background:this.opt.selectionColor})},_repaintSelection:function(){var t=Biojs.Utils.clone(this.opt.selection);this._setSelection(0,0),this._setSelection(t.start,t.end)},_redraw:function(){this._contentDiv.children().remove(),"RAW"==this.opt.format?this._drawRaw():"CODATA"==this.opt.format?this._drawCodata():"FASTA"==this.opt.format?this._drawFasta():(this.opt.format="PRIDE",this._drawPride()),this._applyHighlights(this._highlights),this._repaintSelection(),this._addSpanEvents()},_drawFasta:function(){var t=this.opt.sequence.toUpperCase().split(""),e=jQuery("<pre></pre>").appendTo(this._contentDiv),o=">"+this.opt.id+" "+t.length+" bp<br/>",i=this.opt.columns.size;this.opt.sequence.length<this.opt.columns.size&&(i=this.opt.sequence.length);var n={numCols:i,numColsForSpace:0};o+=this._drawSequence(t,n),e.html(o),this._drawAnnotations(n)},_drawCodata:function(){var t=this.opt.sequence.toUpperCase().split(""),e=jQuery('<pre style="white-space:pre"></pre>').appendTo(this._contentDiv),o="ENTRY           "+this.opt.id+"<br/>";o+="SEQUENCE<br/>",void 0!==this.opt.formatOptions&&void 0!==this.opt.formatOptions.title&&0==this.opt.formatOptions.title&&(o="");var i=this.opt.columns.size;this.opt.sequence.length<this.opt.columns.size&&(i=this.opt.sequence.length);var n={numLeft:!0,numLeftSize:7,numLeftPad:" ",numTop:!0,numTopEach:5,numCols:i,numColsForSpace:0,spaceBetweenChars:!0};o+=this._drawSequence(t,n);var s="<br/>///";void 0!==this.opt.formatOptions&&void 0!==this.opt.formatOptions.footer&&0==this.opt.formatOptions.footer&&(s=""),o+=s,e.html(o),this._drawAnnotations(n)},_drawAnnotations:function(t){var e=this,o=this.opt.sequence.toLowerCase().split(""),i=this._annotations,n="",s="",r="";t.numLeft&&(n+=this._formatIndex(" ",t.numLeftSize+2," "));for(var a=0;a<o.length;a+=t.numCols){s="";for(var h in i)i[h].id=this.getId()+"_"+h,r=this._getHTMLRowAnnot(a+1,i[h],t),r.length>0&&(s+="<br/>",s+=n,s+=r,s+="<br/>");var l=t.numCols,c=o.length-a;l>c&&(l=c),jQuery(s).insertAfter(t.numRight?"div#"+e.opt.target+" div pre span#numRight_"+this.getId()+"_"+(a+l):"div#"+e.opt.target+" div pre span#"+this.getId()+"_"+(a+l))}jQuery(this._contentDiv).find(".annotation").each(function(){e._addToolTip(this,function(){return e._getAnnotationString(jQuery(this).attr("id"))}),jQuery(this).mouseover(function(t){jQuery(".annotation."+jQuery(t.target).attr("id")).each(function(){jQuery(this).css("background-color",jQuery(this).attr("color"))})}).mouseout(function(){jQuery(".annotation").css("background-color","transparent")}).click(function(t){e.raiseEvent(Biojs.Sequence.EVT_ON_ANNOTATION_CLICKED,{name:e._annotations[jQuery(t.target).attr("id")].name,pos:parseInt(jQuery(t.target).attr("pos"))})})})},_getAnnotationString:function(t){var e=this._annotations[t.substr(t.indexOf("_")+1)];return e.name+"<br/>"+(e.html?e.html:"")},_getHTMLRowAnnot:function(t,e,o){for(var i="border-left:1px solid; border-bottom:1px solid; border-color:",n="border-bottom:1px solid; border-color:",s="border-bottom:1px solid; border-right:1px solid; border-color:",r="border-left:1px solid; border-right:1px solid; border-bottom:1px solid; border-color:",a=[],h=t+o.numCols,l=o.spaceBetweenChars?" ":"",c=e.color,d=e.id,p=t;h>p;p++)for(var u in e.regions)region=e.regions[u],spaceAfter="",spaceAfter+=p%o.numColsForSpace==0?" ":"",spaceAfter+=l,color=region.color?region.color:c,data='class="annotation '+d+'" id="'+d+'" color="'+color+'" pos="'+p+'"',p==region.start&&p==region.end?(a[p]='<span style="'+r+color+'" '+data+"> ",a[p]+=spaceAfter,a[p]+="</span>"):p==region.start?(a[p]='<span style="'+i+color+'" '+data+"> ",a[p]+=spaceAfter,a[p]+="</span>"):p==region.end?(a[p]='<span style="'+s+color+' " '+data+"> ",a[p]+="</span>"):p>region.start&&p<region.end?(a[p]='<span style="'+n+color+'" '+data+"> ",a[p]+=spaceAfter,a[p]+="</span>"):a[p]||(a[p]=" ",a[p]+=spaceAfter);var f=a.join("");return-1==f.indexOf("span")?"":f},_drawRaw:function(){var t=this.opt.sequence.toLowerCase().split(""),e=jQuery("<pre></pre>").appendTo(this._contentDiv),o=this.opt.columns.size;this.opt.sequence.length<this.opt.columns.size&&(o=this.opt.sequence.length);var i={numCols:o};e.html(this._drawSequence(t,i)),this._drawAnnotations(i)},_drawPride:function(){var t=this,e=this.opt.sequence.toUpperCase().split(""),o=jQuery("<pre></pre>").appendTo(this._contentDiv),i=this.opt.columns.size;this.opt.sequence.length<this.opt.columns.size&&(i=this.opt.sequence.length),opt={numLeft:!0,numLeftSize:5,numLeftPad:"0",numRight:!0,numRightSize:5,numRightPad:"0",numCols:i,numColsForSpace:t.opt.columns.spacedEach},o.html(this._drawSequence(e,opt)),this._drawAnnotations(opt)},_drawSequence:function(t,e){var o="",i="white-space: pre;";if(e.numTop){o+='<span style="'+i+'" class="numTop">';var n=e.spaceBetweenChars?2*e.numTopEach:e.numTopEach;e.numLeft&&(o+=this._formatIndex(" ",e.numLeftSize," ")),o+=this._formatIndex(" ",n," ");for(var s=e.numTopEach;s<e.numCols;s+=e.numTopEach)o+=this._formatIndex(s,n," ",!0);o+="</span><br/>"}e.numLeft&&(o+=this._formatIndex(1,e.numLeftSize,e.numLeftPad),o+="  ");for(var r=1,a=1;a<=t.length;a++)if(a%e.numCols==0){o+='<span class="sequence" id="'+this.getId()+"_"+a+'">'+t[a-1]+"</span>",e.numRight&&(o+='<span style="'+i+'" id="numRight_'+this.getId()+"_"+a+'">',o+="  ",o+=this._formatIndex(a,e.numRightSize,e.numRightPad),o+="</span>"),o+="<br/>";var h=t.length-a;e.numLeft&&h>0&&(o+='<span id="numLeft_'+this.getId()+"_"+a+'">',o+=this._formatIndex(a+1,e.numLeftSize,e.numLeftPad),o+="  ",o+="</span>"),r=1}else o+='<span class="sequence" style="'+i+'" id="'+this.getId()+"_"+a+'">'+t[a-1],o+=r%e.numColsForSpace==0?" ":"",o+=e.spaceBetweenChars?" ":"",o+="</span>",r++;return o+="<br/>",jQuery.browser.msie&&(o="<pre>"+o+"</pre>"),o},_formatIndex:function(t,e,o,i){var n=t.toString(),s="",r=e-n.length;if(r>0){for(;r-->0;)s+="<span>"+o+"</span>";n=i?t+s:s+t}return n},_addSpanEvents:function(){var t,e=this,o=!1;e._contentDiv.find(".sequence").each(function(){jQuery(this).mousedown(function(){var i=jQuery(this).attr("id");t=parseInt(i.substr(i.indexOf("_")+1)),clickPos=t,e._setSelection(clickPos,t),o=!0,e.raiseEvent(Biojs.Sequence.EVT_ON_SELECTION_CHANGE,{start:e.opt.selection.start,end:e.opt.selection.end})}).mouseover(function(){var i=jQuery(this).attr("id");t=parseInt(i.substr(i.indexOf("_")+1)),o&&(t>clickPos?e._setSelection(clickPos,t):e._setSelection(t,clickPos),e.raiseEvent(Biojs.Sequence.EVT_ON_SELECTION_CHANGE,{start:e.opt.selection.start,end:e.opt.selection.end}))}).mouseup(function(){o=!1,e.raiseEvent(Biojs.Sequence.EVT_ON_SELECTION_CHANGED,{start:e.opt.selection.start,end:e.opt.selection.end})}),e._addToolTip.call(e,this,function(){return o?"["+e.opt.selection.start+", "+e.opt.selection.end+"]":t})}).css("cursor","pointer")},_addToolTip:function(t,e){var o="#sequenceTip"+this.getId();jQuery(t).mouseover(function(i){var n=jQuery(i.target).offset();jQuery(o).is(":visible")||jQuery(o).css({"background-color":"#000",padding:"3px 10px 3px 10px",top:n.top+jQuery(i.target).height()+"px",left:n.left+jQuery(i.target).width()+"px"}).animate({opacity:"0.85"},10).html(e.call(t)).show()}).mouseout(function(){jQuery(o).hide()})},setAnnotation:function(t){this.addAnnotation(t)},addAnnotation:function(t){this._annotations.push(t),this._redraw()},removeAnnotation:function(t){for(var e=0;e<this._annotations.length;e++)if(t!=this._annotations[e].name){this._annotations.splice(e,1),this._redraw();break}},removeAllAnnotations:function(){this._annotations=[],this._redraw()}},{EVT_ON_SELECTION_CHANGE:"onSelectionChange",EVT_ON_SELECTION_CHANGED:"onSelectionChanged",EVT_ON_ANNOTATION_CLICKED:"onAnnotationClicked"}),Biojs.Tooltip=Biojs.extend({constructor:function(){{var t=this;this.opt.arrowType}this._container=jQuery('<div id="biojsTooltip'+t.getId()+'"></div>').addClass("Tooltip"),this._arrow=jQuery('<div class="arrow"></div>').appendTo(t._container),this._body=jQuery('<div class="body"></div>').appendTo(t._container),this._container.appendTo("body"),this._initialize()},opt:{targetSelector:"a",cbRender:void 0,arrowType:"left_top",position:2,delay:200},eventTypes:["onShowUp"],_initialize:function(){var t,e=this,o=0,i=this.opt.targetSelector,n=this.opt.cbRender,s=this.opt.position;"function"!=typeof n&&(n=function(t){return jQuery(t).attr("title")}),this.setArrowType(this.opt.arrowType),this._arrow.css({position:"absolute","z-index":"99999"}),this._body.css({position:"absolute","z-index":"99998",margin:"0px"}),s==Biojs.Tooltip.MOUSE_POSITION?jQuery(i).mousemove(function(i){t=jQuery(i.target),o&&clearTimeout(o),o=0,content=n.call(e,i.target),e._body.html(content),e._show(),e._setPosition({left:i.pageX-10,top:i.pageY-10},{width:20,height:20}),e.raiseEvent(Biojs.Tooltip.EVT_ON_SHOW_UP,{target:t})}).mouseout(function(){o=setTimeout("Biojs.getInstance("+e.getId()+")._hide()",e.opt.delay)}):jQuery(i).mouseover(function(i){t=jQuery(i.target),o&&clearTimeout(o),o=0,content=n.call(e,i.target),e._body.html(content),e._show(),e._setPosition(t.offset(),{width:t.width(),height:t.height()}),e.raiseEvent(Biojs.Tooltip.EVT_ON_SHOW_UP,{target:t})}).mouseout(function(){o=setTimeout("Biojs.getInstance("+e.getId()+")._hide()",e.opt.delay)}),e._container.mouseover(function(){clearTimeout(o),o=0,e._show()}).mouseout(function(){o=setTimeout("Biojs.getInstance("+e.getId()+")._hide()",e.opt.delay)}),this._hide()},_hide:function(){this._container.hide()},_show:function(){this._container.show()},_setPosition:function(t,e){var o=this._arrow,i=this.opt.arrowType,n={top:t.top,left:t.left},s=this._body,r={};o.removeClass(),o.addClass("arrow "+i.match(/^(left|top|right|bottom)/g)[0]),i==Biojs.Tooltip.ARROW_LEFT_TOP?(n.top+=Math.floor(e.height/2)-Math.floor(o.height()/2),n.left+=o.width()+e.width,r.left=n.left+o.width()-1,r.top=n.top+Math.floor(o.height()/2)-Math.floor(s.height()/4)):i==Biojs.Tooltip.ARROW_LEFT_MIDDLE?(n.top+=Math.floor(e.height/2)-Math.floor(o.height()/2),n.left+=o.width()+e.width,r.left=n.left+o.width()-1,r.top=n.top+Math.floor(o.height()/2)-Math.floor(s.height()/2)):i==Biojs.Tooltip.ARROW_LEFT_BOTTOM?(n.top+=Math.floor(e.height/2)-Math.floor(o.height()/2),n.left+=o.width()+e.width,r.left=n.left+o.width()-1,r.top=n.top+Math.floor(o.height()/2)-Math.floor(.75*s.height())):i==Biojs.Tooltip.ARROW_TOP_LEFT?(n.top+=e.height,n.left+=Math.floor(e.width/2)-Math.floor(o.width()/2),r.left=n.left+Math.floor(o.height()/2)-Math.floor(s.width()/4),r.top=n.top+o.height()-1):i==Biojs.Tooltip.ARROW_TOP_MIDDLE?(n.top+=e.height,n.left+=Math.floor(e.width/2)-Math.floor(o.width()/2),r.left=n.left+Math.floor(o.height()/2)-Math.floor(s.width()/2),r.top=n.top+o.height()-1):i==Biojs.Tooltip.ARROW_TOP_RIGHT?(n.top+=e.height,n.left+=Math.floor(e.width/2)-Math.floor(o.width()/2),r.left=n.left+Math.floor(o.height()/2)-Math.floor(.75*s.width()),r.top=n.top+o.height()-1):i==Biojs.Tooltip.ARROW_RIGHT_TOP?(n.top+=Math.floor(e.height/2)-Math.floor(o.height()/2),n.left-=o.width(),r.left=n.left-s.outerWidth()+1,r.top=n.top+Math.floor(o.height()/2)-Math.floor(s.height()/4)):i==Biojs.Tooltip.ARROW_RIGHT_MIDDLE?(n.top+=Math.floor(e.height/2)-Math.floor(o.height()/2),n.left-=o.width(),r.left=n.left-s.outerWidth()+1,r.top=n.top+Math.floor(o.height()/2)-Math.floor(s.height()/2)):i==Biojs.Tooltip.ARROW_RIGHT_BOTTOM?(n.top+=Math.floor(e.height/2)-Math.floor(o.height()/2),n.left-=o.width(),r.left=n.left-s.outerWidth()+1,r.top=n.top+Math.floor(o.height()/2)-Math.floor(.75*s.height())):i==Biojs.Tooltip.ARROW_BOTTOM_LEFT?(n.top-=o.height(),n.left+=Math.floor(e.width/2)+Math.floor(o.width()/2),r.left=n.left+Math.floor(o.width()/2)-Math.floor(s.width()/4),r.top=n.top-s.outerHeight()+1):i==Biojs.Tooltip.ARROW_BOTTOM_MIDDLE?(n.top-=o.height(),n.left+=Math.floor(e.width/2)-Math.floor(o.width()/2),r.left=n.left+Math.floor(o.width()/2)-Math.floor(s.width()/2),r.top=n.top-s.outerHeight()+1):i==Biojs.Tooltip.ARROW_BOTTOM_RIGHT&&(n.top-=o.height(),n.left+=Math.floor(e.width/2)-Math.floor(o.width()/2),r.left=n.left+Math.floor(o.width()/2)-Math.floor(.75*s.width()),r.top=n.top-s.outerHeight()+1),this._arrow.css(n),this._body.css(r)},setArrowType:function(t){var e=t.match(/^(left|top|right|bottom)/g)[0];void 0!==e&&(this.opt.arrowType=t)},getArrowType:function(){return this.opt.arrowType},getIdentifier:function(){return this._container.attr("id")},setIdentifier:function(t){return this._container.attr("id",t)}},{ARROW_LEFT_TOP:"left_top",ARROW_LEFT_MIDDLE:"left_middle",ARROW_LEFT_BOTTOM:"left_bottom",ARROW_TOP_LEFT:"top_left",ARROW_TOP_MIDDLE:"top_middle",ARROW_TOP_RIGHT:"top_right",ARROW_RIGHT_TOP:"right_top",ARROW_RIGHT_MIDDLE:"right_middle",ARROW_RIGHT_BOTTOM:"right_bottom",ARROW_BOTTOM_LEFT:"bottom_left",ARROW_BOTTOM_MIDDLE:"bottom_middle",ARROW_BOTTOM_RIGHT:"bottom_right",EVT_ON_SHOW_UP:"onShowUp",MOUSE_POSITION:1,ELEMENT_POSITION:2});