/**
 * Created by Patrick on 20.06.2015.
 * This script contains all available filters and tools:
 * Filtering for topological information - TODO: simplify addition of new topological info in script
 * Inversion of fold ratios
 * Calculation of coverage - TODO: final touches, reenable
 * TODO: function for sorting proteins by coverage, size, etc.
 */

var proteinData={};//object to save additional data for the proteins while keeping the information separate from the main "protein" object

var domains =["Extracellular", "Transmembrane", "Cytoplasmic"];//domain names as in description of the protein that should be filtered for

function createFilterData(){
    for(id in proteins){
        proteinData[id]=proteinData[id]||{};//if no info yet -> create new object

        //create all the entries the bools for topological information that should be filtered for
        proteinData[id].has={};
        proteinData[id].visible=true;//create visibility entry and set it to true (default)
        for(var i in domains){
            proteinData[id].has[domains[i]]=false;
        }

        //now read the data of the proteins
        var topology = proteins[id].topology;//as array

        for(var i in topology){
            var entry = topology[i];
            var type = entry[3];//= Extracellular, Transmembrane, Cytoplasmic
            if(domains.indexOf(type)!=-1){//-1 would mean, that it's not in the array
                proteinData[id].has[type]=true;
            }
        }
    }
    d3.select("#filter_button_apply").property("disabled",false);
}

//TODO: fix filter buttons so that this function makes sense
//at first: only static buttons, dynamic generation comes later
//called by pressing the button
function applyFilter(){
    //TODO: replace the button names
    var intracellular=document.getElementById("filter_button_intracellular").checked;
    var extracellular=document.getElementById("filter_button_extracellular").checked;
    var transmembrane=document.getElementById("filter_button_transmembrane").checked;
    var and=document.getElementById("filter_button_and").checked;
    var or=document.getElementById("filter_button_or").checked;
    var all=document.getElementById("filter_button_all").checked;

    console.log("---------------Filter data-----------------");
    console.log("Filter data:");
    console.log("Intracellular: "+intracellular);
    console.log("Extracellular: "+extracellular);
    console.log("Transmembrane: "+transmembrane);
    console.log("Filter types:");
    console.log("And: "+and);
    console.log("Or: "+or);
    console.log("All: "+all);
    console.log("---------------Filter data-----------------");

    if(all){//turn all proteins that have been downloaded on
        console.log("Displaying all proteins.");
        for(id in proteins){
            if(proteins[id].sequence!=""){
                proteinData[id].visible=true;}
        }
    }
    else{
        console.log("Applying filter.");
        for(id in proteins){
            var hasTrans=proteinData[id].has["Transmembrane"];
            var hasIntrac=proteinData[id].has["Cytoplasmic"];
            var hasExtrac=proteinData[id].has["Extracellular"];


            if(and){//failure to meet any of the selected conditions will result in elimination
                var display=true;
                if(intracellular&!hasIntrac){
                    display=false;
                }
                if(extracellular&!hasExtrac){
                    display=false;
                }
                if(transmembrane&!hasTrans){
                    display=false;
                }
                proteinData[id].visible=display;
            }
            else if(or){//meeting any of the conditions will enable this protein
                var display=false;
                if(intracellular&&hasIntrac){
                    display=true;
                }
                if(extracellular&&hasExtrac){
                    display=true;
                }
                if(transmembrane&&hasTrans){
                    display=true;
                }
                proteinData[id].visible=display;
                if(display){
                    console.log("Display: "+id);
                }
            }
        }
    }

    visualize();//TODO: prevent calling the createFilterData function again to save time and processing power
}

function invertFoldRatios(){
    if(d3.select("#tools_invertFoldRatios").attr("class")=="pButton") {//active
        invertFoldRatios_execute();
    }else{
        //alert("don't download");
    }

    function invertFoldRatios_execute(){
        for(id in proteins){
            for(peptide in proteins[id].peptides){
                var ratio = proteins[id].peptides[peptide].foldRatio;
                try{
                    ratio*=-1;
                }
                catch(e){}
                proteins[id].peptides[peptide].foldRatio=ratio;
            }
        }
        visualize();
    }
}

//calculates the coverage and saves it in the proteinData
function calculateCoverage(){
    if(d3.select("#tools_calculateCoverage").attr("class")=="pButton") {//active
        calculateCoverage_execute();
    }else{
        //alert("don't download");
    }

    function calculateCoverage_execute(){

        for(id in proteins){
            var sequence = proteins[id].sequence;
            var indexes=[];

            //save all indices
            for(peptide in proteins[id].peptides){
                var start=sequence.indexOf(peptide);
                if(start!=-1){
                    var index={};
                    index["start"]=start;
                    index["end"]=start+peptide.length;
                    indexes.push(index);
                }
            }

            //loop through them to see if they overlap
            for(var i=0; i<indexes.length;i++){
                var index1 = indexes[i];

                //loop through all the following indices
                for(var j=i;j<indexes.length;j++){
                    var index2 = indexes[j];
                    var overlap = false;
                    if(index2.start>=index1.start&&index2.start<=index1.end){
                        overlap=true;
                    }
                    else if(index2.end<=index1.end&&index2.end>=index1.start){
                        overlap=true;
                    }

                    if(overlap){
                        if(index2.start<index1.start){
                            index1.start=index2.start;
                        }
                        if(index2.end>index1.end){
                            index1.end=index2.end;
                        }
                        indexes[i]=index1;
                        //remove index2 as its info is now in index1
                        indexes = indexes.splice(j,1);
                    }
                }
            }
            //now we have an array of indexes that don't overlap -> use this to calculate coverage
            var coveredSpace=0;
            for(i in indexes){

                coveredSpace+=(indexes[i].end-indexes[i].start);
            }

            //+++++++ the end result ++++++++++
            var coverage = coveredSpace/sequence.length;
            proteinData[id]["coverage"]=coverage;
            console.log(coverage);

        }

        //display the information
        for(id in proteins){
            if(proteinData[id].visible){
                var div=d3.select("#div_"+id);
                div.append("p").text("Coverage: "+proteinData[id].coverage);
            }
        }
    }
}


//TODO: does the extra code for this tool lead to significantly longer loading times? if yes: improve
//some search engines don't differentiate between I and L. This options treats I and L as the same when mapping
var IL_nondifferentiation=false;
function IL_nondif_clicked(){
    var checked = d3.select("#IL_nondif").property("checked");
    if(checked){
        IL_nondifferentiation=true;
        //if data is already loaded: reload via visualize(); here: also apply the changes

        if(!$.isEmptyObject(proteins)){
            visualize();
        }
    }
    else{
        IL_nondifferentiation=false;
        if(!$.isEmptyObject(proteins)){
            visualize();
        }
    }
}
/**IL_nondif leads to the following changes in visualization():
 * a modified protein sequence with 1s instead of Is and Ls is created and saved in protein data
 * for peptides the same
 * in peptides, the modified version is also the one displayed
**/



//create a histogram for the peptide data
//in addition to this function, the file onlyForHistograms.js is necessary
function createHistogram(){
    //save all foldratios as array:
    var dataArray=[];
    for(id in proteins){
        var peptides = proteins[id]["peptides"];
        for(sequence in peptides){
            var foldRatio = peptides[sequence]["foldRatio"];
            if(!isNaN(foldRatio)){
                dataArray.push(foldRatio);
            }
        }
    }

    //create the new window and load the necessary script
    var histogram = window.open ('', 'histogram', "height=650,width=650, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no");
    if (window.focus) {histogram.focus();}
    histogram.document.write('<html><head><title>Histogram</title>');
    //here: this function will create the histogram
    histogram.document.write('<scr'+'ipt src="scripts/onlyForHistogram.js"></scr'+'ipt>');
    //dependencies:
    histogram.document.write('<scr'+'ipt src="scripts/plotly.min.js"></scr'+'ipt>');
    histogram.document.write('<scr'+'ipt src="scripts/jquery-1.7.2.min.js"></scr'+'ipt>');
    histogram.document.write('<scr'+'ipt src="scripts/typedarray.js"></scr'+'ipt>');
    histogram.document.write('<scr'+'ipt src="scripts/d3.v3.min.js"></scr'+'ipt>');

    histogram.document.write('</head><body>');
    //this container will hold the histogram
    histogram.document.write('<div id="container" style="width:600px;height:600px;"></div>');
    //data container: here save all peptide foldratios:
    histogram.document.write('<div id="dataContainer" style="display:none;">');
    histogram.document.write(JSON.stringify(dataArray));
    histogram.document.write('</div>');

    histogram.document.write('</body></html>');
    histogram.document.close();
}


//download the log file of all errors, etc. as txt
var logcontent="";
function exportLog(){
    //download file to user
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([ logcontent ], {
        type : 'text/txt'
    }));
    var date = new Date();
    a.download = 'proteator_'+date.getDate()+'_'+(date.getMonth()+1)+'_'+date.getFullYear()+'.txt';

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();
    // Remove anchor from body
    document.body.removeChild(a);
}


//functions for the settings window
var settings = {
    open: function(){
        customInput_cancel();//close custom input window
        //settings.load();//load current values [don't use: would always require cookies)
        //apply current settings
        $("#settings_color_cutoff").val(color_upperBound);
        $("#settings_batchsize").val(batchsize);
        var buttonid_pos = "settings_foldchange_pos_"+color_foldchange_positive;
        var buttonid_neg = "settings_foldchange_neg_"+color_foldchange_negativ;
        $("#"+buttonid_pos).prop("checked",true);
        $("#"+buttonid_neg).prop("checked",true);

        $(".settings_window").css("display", "table");
    },
    close: function(){
        $(".settings_window").css("display", "none");
    },
    apply: function(){
        console.log("applied new settings")
        //get all values, apply them and save them in cookies
        //1.: get
        var settings_maxcolor=parseInt($("#settings_color_cutoff").val());
        var settings_foldchange_neg = $('input[name=foldchange_neg]:checked').val();
        var settings_foldchange_pos = $('input[name=foldchange_pos]:checked').val();
        var settings_batchsize = parseInt($("#settings_batchsize").val());

        console.log("maxcolor: "+settings_maxcolor);
        console.log("foldchange: "+settings_foldchange_neg+"-"+settings_foldchange_pos);
        console.log("batchsize: "+settings_batchsize);

        //2.: apply
        color_upperBound = settings_maxcolor;
        color_foldchange_negativ = settings_foldchange_neg;
        color_foldchange_positive = settings_foldchange_pos;
        batchsize=settings_batchsize;

        //3.: save as cookie
        console.log("saving cookies...");
        var cookie_string = "";
        expires_string = "; expires=Thu, 18 Dec 2099 12:00:00 UTC";

        document.cookie = "maxcolor="+settings_maxcolor+expires_string;
        document.cookie = "foldchange_neg="+settings_foldchange_neg+expires_string;
        document.cookie = "foldchange_pos="+settings_foldchange_pos+expires_string;
        document.cookie = "batchsize="+settings_batchsize+expires_string;

        //4.: close
        console.log("finished...")
        settings.close();
        

    },
    reset:function(){
        console.log("resetting settings")
        //reset all values to default, apply and save in cookies
        //1.: get
        var settings_maxcolor=settings.defaultValues.maxColor;
        var settings_foldchange_neg = settings.defaultValues.foldchange_neg;
        var settings_foldchange_pos = settings.defaultValues.foldchange_pos;
        var settings_batchsize = settings.defaultValues.batchsize;

        console.log("maxcolor: "+settings_maxcolor);
        console.log("foldchange: "+settings_foldchange_neg+"-"+settings_foldchange_pos);
        console.log("batchsize: "+settings_batchsize);

        //2.: apply
        color_upperBound = settings_maxcolor;
        color_foldchange_negativ = settings_foldchange_neg;
        color_foldchange_positive = settings_foldchange_pos;
        batchsize=settings_batchsize;

        //3.: set values
        $("#settings_color_cutoff").val(settings_maxcolor);
        $("#settings_batchsize").val(settings_batchsize);
        var buttonid_pos = "settings_foldchange_pos_"+settings_foldchange_pos;
        var buttonid_neg = "settings_foldchange_neg_"+settings_foldchange_neg;
        $("#"+buttonid_pos).prop("checked",true);
        $("#"+buttonid_neg).prop("checked",true);

        //4.: save as cookie
        console.log("saving as cookies");
        var cookie_string = "";
        expires_string = "; expires=Thu, 18 Dec 2099 12:00:00 UTC";

        document.cookie = "maxcolor="+settings_maxcolor+expires_string;
        document.cookie = "foldchange_neg="+settings_foldchange_neg+expires_string;
        document.cookie = "foldchange_pos="+settings_foldchange_pos+expires_string;
        document.cookie = "batchsize="+settings_batchsize+expires_string;

    },
    load:function(){
        console.log("loading cookies");
        //1. load settings from cookies
        var cookies = document.cookie;
        console.log("cookies");
        var cookie_array = cookies.split(";");
        var cookie_object = {};
        for(i in cookie_array){
            cookie = cookie_array[i];
            cookie = cookie.replace(/\s/g,'');//replace all whitespace
            cookie_split = cookie.split("=");
            if(cookie_split.length==2){
                key = cookie_split[0];
                val = cookie_split[1];
                cookie_object[key]=val
            }
        }
        console.log(cookie_object);

        //2. apply settings
        var temp_maxColor, temp_foldchange_pos, temp_foldchange_neg, temp_batchsize;

        //max color
        if(cookie_object["maxcolor"]==undefined){
            temp_maxColor = settings.defaultValues.maxColor;
        }else{
            temp_maxColor = parseInt(cookie_object["maxcolor"]);
        }
        color_upperBound=temp_maxColor;

        //foldchange color pos
        if(cookie_object["foldchange_pos"]==undefined){
            temp_foldchange_pos = settings.defaultValues.foldchange_pos;
        }else{
            temp_foldchange_pos = cookie_object["foldchange_pos"];
        }
        color_foldchange_positive = temp_foldchange_pos;

        //foldchange color neg
        if(cookie_object["foldchange_neg"]==undefined){
            temp_foldchange_neg = settings.defaultValues.foldchange_neg;
        }else{
            temp_foldchange_neg = cookie_object["foldchange_neg"];
        }
        color_foldchange_negativ = temp_foldchange_neg;

        //batchsize
        if(cookie_object["batchsize"]==undefined){
            temp_batchsize = settings.defaultValues.batchsize;
        }else{
            temp_batchsize = parseInt(cookie_object["batchsize"]);
        }
        batchsize = temp_batchsize;

        console.log("maxcolor: "+temp_maxColor);
        console.log("foldchange: "+temp_foldchange_neg+"-"+temp_foldchange_pos);
        console.log("batchsize: "+temp_batchsize);

        //3. set values of the input fields
        console.log("updating input fields");
        $("#settings_color_cutoff").val(temp_maxColor);
        $("#settings_batchsize").val(temp_batchsize);
        var buttonid_pos = "settings_foldchange_pos_"+temp_foldchange_pos;
        var buttonid_neg = "settings_foldchange_neg_"+temp_foldchange_neg;
        $("#"+buttonid_pos).prop("checked",true);
        $("#"+buttonid_neg).prop("checked",true);
        console.log("finished loading settings")
    },
    defaultValues:{
        maxColor:10,
        foldchange_neg:"red",
        foldchange_pos:"green",
        batchsize:50
    }
}