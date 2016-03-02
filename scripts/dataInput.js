/**
 * Created by Patrick on 14.06.2015.
 *
 * This Script handles user input.
 */

/**
 * Possible TODOS:
 * improve the selection process (clicking istead of typing)
 * mzTab fold ratio?
 */


//allows to create the fold ratio (express to log2)
Math.log = (function() {
    var log = Math.log;
    return function(n, base) {
        return log(n)/(base ? log(base) : 1);
    };
})();




var activeTab;//saves the tab which is currently being modified
var fileSettings={};//object to save the settings made by the user for the different files

/*
fileSettings={
    id={
        accession_header="";
        peptide_header="";
        press_header="";
        tab_separation=true;
        protein_format_long=true;
        file=file;
    }
}
 */


//keeps track of the filenames  for removing the fileSettings data for the missing ones
var filesNameList={};

var noCustomInputNeeded=false;//determines whether to open up the table or directly start analyzing (if only .mzTab-Files present)

//called by onchange on the input[type=file] buttons
function getInput(){
    var allInputs = d3.select("#inputholder").selectAll("input");
    var inputNumber = allInputs[0].length;
    var filledInputs=0;

    for(var i=0;i<inputNumber;i++){
        var singleInput = allInputs[0][i];
        var files=singleInput.files;

        //counts how many inputs have an active file
        if(files.length>0){//file selected
            console.log("File "+i+" Name: "+files[0].name);
            filledInputs++;
        } else{
            console.log("File "+i+" EMPTY");
            //removes empty inputs
            d3.select(singleInput).remove();
        }
    }

    if(filledInputs>0){//at least one file is selected -> enable clicking on the button
        d3.select("#customInput_button").attr("class","pButton");
    }
    else{
        d3.select("#customInput_button").attr("class","pButton_inactive");
    }
    d3.select("#inputholder").append("input").property("type","file").property("accept",".txt,.mztab,.csv");


    //create the event handler
    //TODO: move away -> prevent calling this every time, instead only on start; Problem: don't know how to apply it only to tds
    $('#customInput_tabs').on('click', 'td', function() {
        setActiveTab(this);
    });

    //update the visuals in the pop-up menu: create one tab for each file
    d3.select("#customInput_tabs").selectAll("*").remove();//remove everything
    //create new tabs
    var tabnumber=0;

    var currentIds={};//saves all currentIds to remove previous entries from the settingsList.
    for(var i=0;i<inputNumber;i++){
        var singleInput = allInputs[0][i];
        var files=singleInput.files;

        //new

        //fileSettings necessary in any case (for extractData function)
            if(files.length>0){//file selected
                var name = files[0].name;
                var type = name.substring(name.lastIndexOf(".")+1);

                var tab_id="customInput_tab_"+files[0].name;
                currentIds[tab_id]="";
                if(fileSettings[tab_id]==undefined){
                    createDefaultSettings(tab_id, files[0]);
                }


                //older version: for mzTab: don't create a visible entry
                //if(type.toLowerCase()!="mztab"){
                if(true){
                    var tab=d3.select("#customInput_tabs").append("td").text(files[0].name).attr("id",tab_id);

                    if(tabnumber==0){
                        tab.attr("class","td_active");
                        setActiveTab(tab[0][0])
                    }
                    else{
                        tab.attr("class","td_inactive");
                    }
                    tabnumber++;
                }
            }
        //old
        /*
        if(files.length>0){//file selected
            var type = files[0].name.substring(name.lastIndexOf(".")+1);

            var tab_id="customInput_tab_"+files[0].name;
            currentIds[tab_id]="";

            var tab=d3.select("#customInput_tabs").append("td").text(files[0].name).attr("id",tab_id);

            if(fileSettings[tab_id]==undefined){
                createDefaultSettings(tab_id, files[0]);
            }
            if(tabnumber==0){
                tab.attr("class","td_active");
                setActiveTab(tab[0][0])
            }
            else{
                tab.attr("class","td_inactive");
            }
            tabnumber++;
        }*/
    }

    //keep fileSettings clean of old entries
    for(entry in fileSettings){
        if(entry in currentIds){
            //aok
        }
        else{
            delete fileSettings[entry];
        }
    }

    //all files are of type mzTab -> extractData
    if(tabnumber==0){
        noCustomInputNeeded=true;
    }
    else{
        noCustomInputNeeded=false;
    }
}

//called if one of the tabs is clicked
function setActiveTab(td){
    activeTab=td;

    var id=td.id;
    setSettings(id);

    //set all tabs inactive
    d3.select("#customInput_tabs").selectAll("td").attr("class","td_inactive");
    //set the clicked tab as active
    d3.select(td).attr("class","td_active");
}

//default settings what strings are input in the custom settings (none) and which separation types, etc. are selected
//use this to create the
function createDefaultSettings(tab_id,file){
    fileSettings[tab_id]={};
    fileSettings[tab_id].accession_header="";
    fileSettings[tab_id].peptide_header="";
    fileSettings[tab_id].xpress_header="";
    fileSettings[tab_id].tab_separation=true;
    fileSettings[tab_id].protein_format_long=true;
    fileSettings[tab_id]["file"]=file;
    fileSettings[tab_id]["onlyUseRatio"]=false;

    //for mztab files:
    fileSettings[tab_id]["treatment"]="";
    fileSettings[tab_id]["control"]="";
}

//visualize the settings
function setSettings(tab_id){
    //also display the correct div for the file type

    var settings = fileSettings[tab_id];
    d3.select("#customInput_proteinLabel").property("value",settings.accession_header);
    d3.select("#customInput_peptideLabel").property("value",settings.peptide_header);
    d3.select("#customInput_xpressLabel").property("value",settings.xpress_header);

    if(settings.tab_separation){
        d3.select("#customInput_separation_tab").property("checked",true);
        d3.select("#customInput_separation_komma").property("checked",false);
    }
    else{
        d3.select("#customInput_separation_tab").property("checked",false);
        d3.select("#customInput_separation_komma").property("checked",true);
    }

    if(settings.protein_format_long){
        d3.select("#customInput_proteinformat_long").property("checked",true);
        d3.select("#customInput_proteinformat_short").property("checked",false);
    }
    else{
        d3.select("#customInput_proteinformat_long").property("checked",false);
        d3.select("#customInput_proteinformat_short").property("checked",true);
    }
    if(settings["onlyUseRatio"]){
        d3.select("#checkbox_onlyUseRatio").property("checked",true);
    }
    else{
        d3.select("#checkbox_onlyUseRatio").property("checked",false);
    }



    var file = fileSettings[tab_id]["file"];
    var name = file.name;
    var type = name.substring(name.lastIndexOf(".")+1);

    if(type.toLowerCase()=="mztab"){
        //display mztab div
        $("#customInput_textfiles").css("display","none");
        $("#customInput_mztab_files").css("display","block");
    }
    else{
        //display other div
        $("#customInput_textfiles").css("display","block");
        $("#customInput_mztab_files").css("display","none");
        //TODO: update select dropdown (#select_mztab_treatment, #select_mztab_control)
    }

    //preview file
    customInput_fileChanged(tab_id);//loading mztab values here


}

//called by onchange in the text fields
function saveSettings(){
    console.log("saving settings");

    var tab_id = activeTab.id;
    //labels are transformed to lower case in order to ease input
    fileSettings[tab_id].accession_header=d3.select("#customInput_proteinLabel").property("value").toLowerCase();
    fileSettings[tab_id].peptide_header=d3.select("#customInput_peptideLabel").property("value").toLowerCase();
    fileSettings[tab_id].xpress_header=d3.select("#customInput_xpressLabel").property("value").toLowerCase();
    fileSettings[tab_id].tab_separation=d3.select("#customInput_separation_tab").property("checked");
    fileSettings[tab_id].protein_format_long=d3.select("#customInput_proteinformat_long").property("checked");
    fileSettings[tab_id]["onlyUseRatio"]=d3.select("#checkbox_onlyUseRatio").property("checked");

    //for mztab files:
    fileSettings[tab_id]["treatment"]=$("#select_mztab_treatment").val();
    fileSettings[tab_id]["control"]=$("#select_mztab_control").val();

    colorize();//marks the corresponding table cells
}

//TODO: in future releases, the table cells will be colored if the input matches their content
function colorize(){

}

//custom input - functions for the buttons
var customInput={};
function customInput_open(b){
    if(b.className=="pButton") {
        //only .mzTab files
        if(noCustomInputNeeded){
            customInput_start();
        }
        //other files present -> requires user input
        else{
            $("#customContainer").css("display", "block");
        }

    }
}
function customInput_cancel(){
    $("#customContainer").css("display","none");
}
function customInput_start(){
    extractData();
    //parseCustomInput();
}

function customInput_fileChanged(tab_id){
    //read first ten lines of the new file and display it in the table
    customInput.previewLines=10;
    var file=fileSettings[tab_id]["file"];

    var name = file.name;
    var type = name.substring(name.lastIndexOf(".")+1);

    if(type.toLowerCase()=="mztab"){
        //remove old entries
        var selectTreatment = d3.select("#select_mztab_treatment");
        var selectControl = d3.select("#select_mztab_control");
        selectTreatment.selectAll("*").remove();
        selectControl.selectAll("*").remove();

        //count how many peptide_study_variable lines are here:
        var code_peptideheader="PEH";
        var headerline=[];


        var reader = new FileReader();
        reader.onload = function(e) {
            var result = reader.result;
            var lines = result.split("\n");
            for(line in lines){
                var line_splitted=lines[line].split("\t");
                if(line_splitted[0]==code_peptideheader){
                    headerline=line_splitted;
                }
            }

            //find study variables + create options
            var targetstring = "peptide_abundance_study_variable";
            var counter=0;
            if(headerline!=undefined){
                for(i in headerline){
                    var string = headerline[i];
                    var index = string.indexOf(targetstring);
                    if(index!=-1){
                        counter++;
                    }
                }
            }



            //create entries
            selectTreatment.append("option").text("");
            selectControl.append("option").text("");
            for(var i=1;i<=counter;i++){
                selectTreatment.append("option").text(i).attr("value",i);
                selectControl.append("option").text(i).attr("value",i);
            }

            //set values:
            //for mztab files:
            console.log("load values");
            console.log("treatment: "+fileSettings[tab_id]["treatment"]);
            $("#select_mztab_treatment").val(fileSettings[tab_id]["treatment"]);
            $("#select_mztab_control").val(fileSettings[tab_id]["control"]);

        }

        //call reader
        if(file!=undefined){
            reader.readAsText(file);
        }

    }
    else{
        //TODO: create stream to read the file line by line and save resources
        var reader = new FileReader();
        reader.onload = function(e) {
            var result = reader.result;
            var lines = result.split("\n");
            try{
                customInput.lines=lines.splice(0,customInput.previewLines);//save only the lines specified previously as array
            }
            catch(e){
                customInput.lines=lines;
            }
            displayLines(customInput.lines);
        }

        //call reader
        if(file!=undefined){
            reader.readAsText(file);
        }
    }


}

//display results in a preview table
function displayLines(lines){
    var table = d3.select("#customInput_previewTableBody");
    table.selectAll("*").remove();
    customInput.splitByTab=false;
    if(d3.select("#customInput_separation_tab").property("checked")){
        customInput.splitByTab=true;
    }
    //otherwise split by komma
    for(line in lines){
        var tempArray;
        //split by tab
        if(customInput.splitByTab){
            tempArray=lines[line].split("\t");
        }
        else{
            //split by komma
            tempArray=lines[line].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        }

        var row=table.append("tr");
        for(entry in tempArray){
            row.append("td").text(tempArray[entry]);
        }
    }
}



//----------------main functions-----------------------

var proteins={};//save and download all data
var ratioData={};//if "onlyUseRatios" was selected, the peptides will be saved in this object along with the ratio. Later, the ratios will be applied to the peptides from the protein object
var ratioDataContainsInput=true;//bool to save wether data from in there should be copied or not
/*form:
ratioData={
    [peptideSequence]ATRBASDAD:
        "ratio":[array with all ratios for the unique stripped peptide][1.5,1.2,...]
}

 */

var splitbytab;

//TODO: filter for probability
//var minProb = 0.9;

var filetest;

//allows to follow how many files have been finished and how many still need to be finished
var fileCounter=0;
var fileNumber=0;
//extract the data from all the files by calling the respective methods
function extractData(){
    console.log("Input settings:");
    console.log(JSON.stringify(fileSettings));
    proteinData={};//reset protein data
    proteins={};//clear object
    ratioData={};
    ratioDataContainsInput = false;

    displayLoading(true);


    //got all necessary information -> hide window again
    $("#customContainer").css("display","none");

    //TODO: test whether safe or if I should additionally check for listed files
    //count files
    fileCounter=0;
    fileNumber=0;
    for(data in fileSettings){
        fileNumber++;
    }


    for(data in fileSettings){
       var file = fileSettings[data]["file"];
        var name = file.name;
        var type = name.substring(name.lastIndexOf(".")+1);

        console.log("File name: "+name);
        if(type.toLowerCase()=="mztab"){
            read_mztab(data);
        }
        else{
            parseCustomInput(data);
        }
    }
}

//------------------custom input---------------------
function parseCustomInput(data){
        try {
            read_customInput(data);//prot Data must be read from within pep or simultaneous function won't be achieved
        } catch (e) {
            console.log("Error when reading custom input: "+e);
        }
}

function read_customInput(data_access){
    var reader = new FileReader();

    reader.onload = function(e) {
        var data = reader.result;
        splitCustomInput(data, data_access);
    }

    var file = fileSettings[data_access].file;
    reader.readAsText(file);
}

function splitCustomInput(data, data_access) {
    var lines = data.split("\n");

    var settings = fileSettings[data_access];

    //for ease of selecting the lines
    var code_proteinheader = settings.accession_header;
    var code_peptideheader = settings.peptide_header;
    var code_xpressheader = settings.xpress_header;
    var proteinAccessionLong = settings.protein_format_long;
    var splitByTab = settings.tab_separation;

    //onlyUseRatio -> peptides are saved to ratioData
    var onlyUseRatio = settings["onlyUseRatio"];
    if(onlyUseRatio){
        //set this to true in order to add a step in which the data is transferred
        ratioDataContainsInput=true;
    }


    //find relevant lines + columns
    var headerline = [];
    var peptidelines = [];

    //TODO: function to search for the first line
    //TODO: search for xpress ratio

    for (line in lines) {
        var line2 = lines[line].replace("\r", "");
        var tempArray = [];
        if (splitByTab) {
            tempArray = line2.split("\t");
        }
        else {
            //split by komma
            tempArray = line2.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        }
        if (line == 0) {
            headerline = tempArray;
            for (entry in headerline) {
                headerline[entry] = headerline[entry].toLowerCase();//lower case necessary as input was also transformed to lower case
            }
        }
        else {
            peptidelines.push(tempArray);
        }
    }

    //find columns: sequence, accession
    var proteinColumnTitle = code_proteinheader;
    var peptideColumnTitle = code_peptideheader;
    var xpressColumnTitle = code_xpressheader;

    var peptidePosition = -1;
    var proteinPosition = -1;
    var xpressPosition = -1;

    for (var j = 0; j < headerline.length; j++) {
        if (headerline[j] == peptideColumnTitle) {
            peptidePosition = j;
        } else if (headerline[j] == proteinColumnTitle) {
            proteinPosition = j;
        }
        else if (xpressColumnTitle != "" && headerline[j] == xpressColumnTitle) {
            xpressPosition = j;
        }
    }

    //console alert if columns weren't found
    if (peptidePosition == -1) {
        console.log("custom input: " + code_peptideheader + ": no sequence column found");
    } else if (proteinPosition == -1) {
        console.log("custom input: " + code_proteinheader + ": no accession column found");
    }

    //transfer data to "proteins" object
    if (!onlyUseRatio){
        for (var i = 0; i < peptidelines.length; i++) {
            //check for empty entries
            var line = peptidelines[i];

            try {
                //prevent errors if lines are missing entries
                if (line.length >= proteinPosition && line != undefined&&line!="") {

                    //decide between different sorts of accession (long/short)
                    var ids = [];//TODO: handle multiple entrie

                    var entries = line[proteinPosition].split(",");

                    if (proteinAccessionLong) {//sp|P12830|someName
                        for (entry in entries) {
                            var id = entries[entry].split("|")[1];
                            ids.push(id);
                        }
                    }
                    else {
                        for (entry in entries) {
                            var id = entries[entry];
                            ids.push(id);
                        }

                    }

                    //TODO: display unaligned peptides
                    //remove everyhting but big letters and use this for all peptides
                    var sequence = line[peptidePosition].replace(/[^A-Z]/g, '');
                    for (idnumber in ids) {
                        var id = ids[idnumber];
                        //if the entry was undefined -> simply add new peptide
                        //TODO: if any new changes: combine the functions that save data in "proteins" as one function
                        if (proteins[id] == undefined) {
                            proteins[id] = {};
                            proteins[id].peptides = {};//peptides also saved as object to prevent duplicates
                            //in the peptides, also ratio and probability are saved;
                            //TODO: get name out of xml file
                            //proteins[id].name = name;//define name only if the protein was undefined until now

                            if (sequence != "") {
                                proteins[id].peptides[sequence] = {};
                                if (xpressPosition != -1) {
                                    proteins[id].peptides[sequence]["ratio"] = line[xpressPosition];
                                }
                                else {
                                    proteins[id].peptides[sequence]["ratio"] = "undefined";
                                }
                            }
                        } else {//add peptide to existing object
                            if (sequence != "") {
                                //only add if peptide not listed yet
                                if (proteins[id].peptides[sequence] == undefined) {
                                    proteins[id].peptides[sequence] = {};
                                    if (xpressPosition != -1) {
                                        proteins[id].peptides[sequence]["ratio"] = line[xpressPosition];
                                    }
                                    else {
                                        proteins[id].peptides[sequence]["ratio"] = "undefined";
                                    }
                                } else {
                                    //otherwise update the probability if it is higher or defined versus undefined
                                    var oldProb;
                                    try {
                                        oldProb = proteins[id].peptides[stripped]["probability"];
                                        if (oldProb == "undefined") {
                                            oldProb = 0;
                                        }
                                    } catch (e) {
                                        oldProb = 0;
                                    }
                                    //TODO: here: compare probability (or other value) with the old one
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                console.log("Error in data input: " + e);
            }
        }
    }
    else{
        for (var i = 0; i < peptidelines.length; i++) {
            //check for empty entries
            var line = peptidelines[i];

            try {
                //prevent errors if lines are missing entries
                if (line.length >= proteinPosition && line != undefined) {
                    //remove everyhting but big letters and use this for all peptides
                    var sequence = stripPeptide(line[peptidePosition]);
                    //initialize
                    if(ratioData[sequence]==undefined){
                        ratioData[sequence]={};
                        ratioData[sequence]["ratios"]=[];
                    }
                    if (xpressPosition != -1) {
                        //all ratios are saved; later the mean value is used
                        ratioData[sequence]["ratios"].push(line[xpressPosition]);
                    }
                }
            }
            catch (e) {
                console.log("Error in data input: " + e);
            }
        }
    }

    fileCounter++;
    //start only if every file processed:
    if(fileCounter>=fileNumber){
        if(ratioDataContainsInput){
            transferRatioData();
        }
        //add foldratio to every protein; remove proteins without peptides
        modifyProteins();
    }
}


//---------------------------.mzTab-------------------------------
function read_mztab(data_access) {
    var file = fileSettings[data_access].file;
    var treatmentNumber = fileSettings[data_access]["treatment"];
    var controlNumber = fileSettings[data_access]["control"];

    var reader = new FileReader();

    reader.onload = function(e) {
        var mztabData = reader.result;
        splitMzTabDataNew(mztabData, treatmentNumber, controlNumber);
    }

    reader.readAsText(file);
}

//updated: 28.02.15
function splitMzTabDataNew(data, treatmentNumber, controlNumber){

    //TODO: is there some sort of xpress ratio in those files? should other values be retrieved? probability?
    var lines = data.split("\n");

    //process:
    //1.: create protein entries + peptides from the PSM entries (sequence + accession relevant)
    //2.: in the PEP section: get those peptides + calculate ratio from the study variables

    //alle proteine
    var code_peptideheader0="PRH";
    var code_peptide0="PRT";

    //sequenz peptide
    var code_peptideheader="PSH";
    var code_peptide="PSM";

    //nur quantifizierbare peptide:
    var code_peptideheader2="PEH";
    var code_peptide2="PEP";


    //ACHTUNG: PSH und PEH können gleichzeitig in einer Datei vorkommen
    var headerdefined=false;//lets you switch between PSH/PEH

    //find relevant lines + columns
    //0:PRH
    var headerline0=[];
    var peptidelines0=[];

    //1: PSH
    var headerline1=[];//array of the tab separated values
    var peptidelines1=[];//array of the lines

    //2:PEH;
    var headerline2=[];
    var peptidelines2=[];

    for(line in lines){
        var line_splitted=lines[line].split("\t");

        switch(line_splitted[0]){
            case code_peptideheader0:
                headerline0=line_splitted;
                break;
            case code_peptideheader:
                headerline1=line_splitted;
                break;
            case code_peptideheader2:
                headerline2=line_splitted;
                break;
            case code_peptide0:
                peptidelines0.push(line_splitted);
                break;
            case code_peptide:
                peptidelines1.push(line_splitted);
                break;
            case code_peptide2:
                peptidelines2.push(line_splitted);
                break;
        }
    }

    analyzePRT(headerline0,peptidelines0);//PRT: create protein list; the others: add peptides
    analyzePSM(headerline1,peptidelines1);
    analyzePEP(headerline2,peptidelines2);

    //PSM is the list of all proteins
    function analyzePRT(headerline, infolines){
        //find columns: sequence, accession
        //Correct for both?
        var proteinColumnTitle="accession";

        var proteinPosition = -1;

        for (var j = 0; j < headerline.length; j++) {
            if (headerline[j] == proteinColumnTitle) {
                proteinPosition = j;
            }
        }

        if(proteinPosition==-1){
            //alert("mztab: "+code_peptideheader+": no accession column found");
            console.log("mztab: "+code_peptideheader+": no PSM accession column found");
        }

        //transfer data to "proteins" object
        for (var i = 0; i < infolines.length; i++) {
            //check for empty entries
            var line=infolines[i];

            //prevent errors if lines are missing entries
            if (line.length>proteinPosition) {
                //accession always this format: sp|id|name
                var accession = line[proteinPosition].split("|");
                var id = accession[1];
                var name = accession[2];

                //if the entry was undefined -> simply add new peptide
                if(proteins[id] == undefined){
                    proteins[id]={};
                    proteins[id].peptides={};//peptides also saved as object to prevent duplicates
                    //in the peptides, also ratio and probability are saved;
                    proteins[id].name=name;//define name only if the protein was undefined until now
                }
            }
        }}

    //PSM has no express info
    function analyzePSM(headerline, peptidelines){
        //find columns: sequence, accession
        //Correct for both?
        var proteinColumnTitle="accession";
        var peptideColumnTitle="sequence";

        var peptidePosition = -1;
        var proteinPosition = -1;

        for (var j = 0; j < headerline.length; j++) {
            if (headerline[j] == peptideColumnTitle) {
                peptidePosition = j;
            } else if (headerline[j] == proteinColumnTitle) {
                proteinPosition = j;
            }
        }

        //console alert if columns weren't found
        if(peptidePosition==-1){
            //alert("mztab: "+code_peptideheader+": no sequence column found");
            console.log("mztab: "+code_peptideheader+": no PSM sequence column found");
        } else if(proteinPosition==-1){
            //alert("mztab: "+code_peptideheader+": no accession column found");
            console.log("mztab: "+code_peptideheader+": no PSM accession column found");
        }

        //transfer data to "proteins" object
        for (var i = 0; i < peptidelines.length; i++) {
            //check for empty entries
            var line=peptidelines[i];

            //prevent errors if lines are missing entries
            if (line.length > peptidePosition && line.length>proteinPosition) {
                //accession always this format: sp|id|name
                var accession = line[proteinPosition].split("|");
                var id = accession[1];
                var name = accession[2];
                var sequence = line[peptidePosition];
                var xpress=undefined;

                //if the entry was undefined -> simply add new peptide
                if(proteins[id] == undefined){


                }else {//add peptide to existing object
                    if(sequence!=""){
                        //only add if peptide not listed yet
                        if(proteins[id].peptides[sequence]==undefined){
                            proteins[id].peptides[sequence]={};
                            //TODO:prob
                            proteins[id].peptides[sequence]["probability"]="undefined";
                            if(xpress!=undefined){
                                proteins[id].peptides[sequence]["ratio"]=xpress;
                            }
                        }
                    }
                }
            }
        }}

    //same as PSM + express info
    function analyzePEP(headerline, peptidelines){
        //find columns: sequence, accession
        //Correct for both?
        var proteinColumnTitle="accession";
        var peptideColumnTitle="sequence";



        var peptidePosition = -1;
        var proteinPosition = -1;
        var abundancePosition1= -1;
        var abundancePosition2= -1;

        //express has to be calculated from the abundances
        var abundanceColTitle1="NOTLISTED";
        var abundanceColTitle2="NOTLISTED";

        //TODO: set abundance positions by the file settings
        var number_treatments = parseFloat(treatmentNumber);
        var number_control = parseFloat(controlNumber);

        if(number_treatments!=NaN){
            abundanceColTitle1="peptide_abundance_study_variable["+number_treatments+"]";
        }
        if(number_control!=NaN){
            abundanceColTitle2="peptide_abundance_study_variable["+number_control+"]";
        }

        for (var j = 0; j < headerline.length; j++) {
            if (headerline[j] == peptideColumnTitle) {
                peptidePosition = j;
            } else if (headerline[j] == proteinColumnTitle) {
                proteinPosition = j;
            }
            else if (headerline[j] == abundanceColTitle1) {
                abundancePosition1 = j;
            }
            else if (headerline[j] == abundanceColTitle2) {
                abundancePosition2 = j;
            }
        }

        //console alert if columns weren't found
        if(peptidePosition==-1){
            //alert("mztab: "+code_peptideheader+": no sequence column found");
            console.log("mztab: "+code_peptideheader+": PEP - no sequence column found");
        } else if(proteinPosition==-1){
            //alert("mztab: "+code_peptideheader+": no accession column found");
            console.log("mztab: "+code_peptideheader+": PEP - no accession column found");
        }

        //transfer data to "proteins" object
        for (var i = 0; i < peptidelines.length; i++) {
            //check for empty entries
            var line=peptidelines[i];

            //prevent errors if lines are missing entries
            if (line.length > peptidePosition && line.length>proteinPosition) {
                //accession always this format: sp|id|name
                var accession = line[proteinPosition].split("|");
                var id = accession[1];
                var name = accession[2];
                var sequence = line[peptidePosition];

                //calculate xpress ratio:
                var abundance1= parseFloat(line[abundancePosition1]);
                var abundance2 = parseFloat(line[abundancePosition2]);

                var xpress=undefined;
                if(abundance1!=NaN&&abundance2!=NaN){
                    xpress=abundance1/abundance2;
                }

                //if the entry was undefined -> simply add new peptide
                //TODO: if any new changes: combine the functions that save data in "proteins" as one function
                if(proteins[id] == undefined){

                }else {//add peptide to existing object
                    if(sequence!=""){
                        //only add if peptide not listed yet
                        if(proteins[id].peptides[sequence]==undefined){
                            proteins[id].peptides[sequence]={};
                            proteins[id].peptides[sequence]["probability"]="undefined";
                            if(xpress!=undefined){
                                proteins[id].peptides[sequence]["ratio"]=xpress;
                            }
                        }else{
                            if(proteins[id].peptides[sequence]["ratio"]==undefined){
                                if(xpress!=undefined){
                                    proteins[id].peptides[sequence]["ratio"]=xpress;
                                }
                            }
                        }
                    }
                }
            }
        }}


    fileCounter++;
    //start only if every file processed:
    if(fileCounter>=fileNumber){
        //add foldratio to every peptide; remove proteins without peptides
        modifyProteins();
    }
}


//obsolete:
/*
function splitMzTabData(data) {

    //TODO: is there some sort of xpress ratio in those files? should other values be retrieved? probability?
    var lines = data.split("\n");

    //for ease of selecting the lines
    var code_peptideheader="PSH";
    var code_peptide="PSM";

    var code_peptideheader2="PEH";
    var code_peptide2="PEP";


    //ACHTUNG: PSH und PEH können gleichzeitig in einer Datei vorkommen
    var headerdefined=false;//lets you switch between PSH/PEH

    //find relevant lines + columns
    //1: PSH
    var headerline1=[];
    var peptidelines1=[];

    //2:PEH;
    var headerline2=[];
    var peptidelines2=[];

    for(line in lines){
        var line_splitted=lines[line].split("\t");

        switch(line_splitted[0]){
            case code_peptideheader:
                headerline1=line_splitted;
                break;
            case code_peptideheader2:
                headerline2=line_splitted;
                break;
            case code_peptide:
                peptidelines1.push(line_splitted);
                break;
            case code_peptide2:
                peptidelines2.push(line_splitted);
                break;
        }
    }

    getInfo(headerline1,peptidelines1);
    getInfo(headerline2,peptidelines2);


    function getInfo(headerline, peptidelines){
        //find columns: sequence, accession
        //Correct for both?
        var proteinColumnTitle="accession";
        var peptideColumnTitle="sequence";
        var xpressColumnTitle="PLACEHOLDERXY";

        var peptidePosition = -1;
        var proteinPosition = -1;
        var xpressPosition= -1;

    for (var j = 0; j < headerline.length; j++) {
        if (headerline[j] == peptideColumnTitle) {
            peptidePosition = j;
        } else if (headerline[j] == proteinColumnTitle) {
            proteinPosition = j;
        }
        else if (headerline[j] == xpressColumnTitle) {
            xpressPosition = j;
        }
    }

    //console alert if columns weren't found
    if(peptidePosition==-1){
        //alert("mztab: "+code_peptideheader+": no sequence column found");
        console.log("mztab: "+code_peptideheader+": no sequence column found");
    } else if(proteinPosition==-1){
        //alert("mztab: "+code_peptideheader+": no accession column found");
        console.log("mztab: "+code_peptideheader+": no accession column found");
    }

    //transfer data to "proteins" object
    for (var i = 0; i < peptidelines.length; i++) {
        //check for empty entries
        var line=peptidelines[i];

        //prevent errors if lines are missing entries
        if (line.length > peptidePosition && line.length>proteinPosition) {
            //accession always this format: sp|id|name
            var accession = line[proteinPosition].split("|");
            var id = accession[1];
            var name = accession[2];
            var sequence = line[peptidePosition];
            var xpress=undefined;
            if(xpressPosition!=-1){
                xpress=line[xpressPosition];
            }

            //if the entry was undefined -> simply add new peptide
            //TODO: if any new changes: combine the functions that save data in "proteins" as one function
            if(proteins[id] == undefined){
                proteins[id]={};
                proteins[id].peptides={};//peptides also saved as object to prevent duplicates
                //in the peptides, also ratio and probability are saved;
                proteins[id].name=name;//define name only if the protein was undefined until now

                if(sequence!=""){
                    proteins[id].peptides[sequence]={};
                    //TODO: probability or other values; now just undefined
                    proteins[id].peptides[sequence]["probability"]="undefined";
                    if(xpress!=undefined){
                        proteins[id].peptides[sequence]["ratio"]=xpress;
                    }
                }

            }else {//add peptide to existing object
                if(sequence!=""){
                    //only add if peptide not listed yet
                    if(proteins[id].peptides[sequence]==undefined){
                        proteins[id].peptides[sequence]={};
                        //TODO:prob
                        proteins[id].peptides[sequence]["probability"]="undefined";
                        if(xpress!=undefined){
                            proteins[id].peptides[sequence]["ratio"]=xpress;
                        }
                    }else{
                        //TODO: here: cprobability check (compare and overwrite if higher)
                        //otherwise update the probability if it is higher or defined versus undefined
                        var oldProb;
                        try{
                            oldProb = proteins[id].peptides[stripped]["probability"];
                            if(oldProb=="undefined"){
                                oldProb=0;
                            }
                        }catch(e){
                            oldProb=0;
                        }
                    }
                }
            }
        }
    }}

    fileCounter++;
    //start only if every file processed:
    if(fileCounter>=fileNumber){
        //add foldratio to every protein; remove proteins without peptides
        modifyProteins();
    }
}
*/

//-----------------------------etc.-----------------------------------------------
//indefinite loading thingy
function displayLoading(bool){
    if(bool){
        d3.select("#loading_holder").style("display","block");
    }else{
        d3.select("#loading_holder").style("display","none");
    }
}

//transfer ratio data from ratioData to proteins
function transferRatioData(){
    console.log("transferring ratios");
    //for all the peptides listed in the proteins object, get the ratio from the ratioData object
    for(id in proteins){
        var peptideList = proteins[id].peptides;//is an object
        for(entry in peptideList){
            var peptide=entry;
            if(ratioData[peptide]!=undefined){
                var ratios = ratioData[peptide].ratios;//array
                var ratio=0;//final ratio is mean value
                var counter=0;
                for(j in ratios){
                    ratio+=parseFloat(ratios[j]);//otherwise treated as string
                    counter++;
                }
                ratio=Math.round((ratio/counter)*100)/100;
                proteins[id]["peptides"][peptide]["ratio"]=ratio;
            }
            else{
                console.log("Ratio data for "+peptide+" not defined");
            }
        }
    }
    console.log("transferring ratios finished");
}

//TODO: are capital letters in all cases the only correct signs?
function stripPeptide(peptide){
    var strippedPeptide;
    strippedPeptide=peptide;
    //"n" (start) and "c" (end) mark the peptide I want. In between are brackets that need to be removed
    var n_index=strippedPeptide.indexOf('n');
    var c_index=strippedPeptide.indexOf('c');

    //if those are present, split in between
    if(n_index!=-1&&c_index!=-1){
        strippedPeptide = strippedPeptide.substring(n_index+1,c_index);
    }
    //rest: remove all symbols that are not capital letters
    strippedPeptide=strippedPeptide.replace(/[^A-Z]/g, '');

    return strippedPeptide;
}

//calculates foldratio and adds it to the peptides; removes entries if no peptide is present
function modifyProteins(){
    console.log("Calculating ratios.");

    for(protein in proteins){

        var currentProt = proteins[protein];

        //count peptides
        var numberOfPeptides=0;
        var peptideList = currentProt.peptides;
        for(peptide in peptideList){
            numberOfPeptides++;
            var express=peptideList[peptide].ratio;
            var foldRatio="N/A";
            try{
                foldRatio=Math.log(express,2);
            }
            catch(e){
                console.log(e);
            }

            //round to two decimal places
            peptideList[peptide].foldRatio=+(Math.round(foldRatio + "e+2")  + "e-2");
        }
        //remove protein just if no peptides were found
        if(currentProt.id==""||currentProt.id=="undefined"||protein==undefined){
            delete proteins[protein];
        }
        if(numberOfPeptides==0){
            delete proteins[protein];
        }
    }

    //everything finished
    displayLoading(false);

    //next step, new file: download proteins from uniprot
    downloadData();
    displayLoading(false);
}