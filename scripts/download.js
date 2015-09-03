//task for this file:
    //download sequence data, topological data (X)
    //find equivalent ids and unify those entries (X)
    //create from this information an object that will be used for visualization (X)
    //allow the user to download a modified interact.prot file (with foldRatio and unq stripped peptides)
    //or a proteator-specific JSON file that contains the downloaded information (X)
    //for the visualization: also display peptides that could not be aligned

//only for development purposes
var cancelDownload=false;
function function_cancelDownload(){
    cancelDownload=true;
}


function downloadData(){
    console.log("Download process started");

    var gradientsize=0;
    $(".loadingbar").css("display","block");
    //apply the gradient
    $(".loadingbar").css("background","linear-gradient(to right, #2672EC 0%, white "+gradientsize+"%)");
    $(".loadingbar").css("background","-moz-linear-gradient(right, #2672EC 0%, white "+gradientsize+"%)");
    $(".loadingbar").css("background","-o-linear-gradient(right, #2672EC 0%, white "+gradientsize+"%)");
    $(".loadingbar").css("background","-webkit-linear-gradient(left, #2672EC 0%, white "+gradientsize+"%)");

    //count proteins and create array of the ids in order to allow for setTimout loading
    var idArray=[];
    var proteinnumber=0;
    for(id in proteins){
        proteinnumber++;
        idArray.push(id);
    }
    console.log("Proteins before download2:");
    console.log(proteins);
    console.log("idArray");
    console.log(idArray);

    //TODO: adjust proteinnumber if ids are removed from the list as they are double
    proteins2={};
    var downloadcounter=0;
    $("#loadingtext").text("Downloading proteins: "+downloadcounter+"/"+proteinnumber);
    setTimeout(downloadProteinById(),0);


    function downloadProteinById(){

        var id = idArray[downloadcounter];
        //prevents double downloading if different ids for the same protein were listed
        if(id in proteins && id!="" && id !="undefined"){

        $("#loadingtext").text("Downloading proteins: "+downloadcounter+"/"+proteinnumber);
            //update the loading bar
            var percent=((downloadcounter/proteinnumber)*100);
            var percent2=percent+gradientsize+"%";
            percent+="%";
            $(".loadingbar").css("background","linear-gradient(to right, #2672EC "+percent+", white "+percent2+")");
            $(".loadingbar").css("background","-moz-linear-gradient(right, #2672EC "+percent+", white "+percent2+")");
            $(".loadingbar").css("background","-o-linear-gradient(right, #2672EC "+percent+", white "+percent2+")");
            $(".loadingbar").css("background","-webkit-linear-gradient(left, #2672EC "+percent+", white "+percent2+")");

        console.log(downloadcounter+"/"+proteinnumber);
        try {
            var url = "http://www.uniprot.org/uniprot/" + id + ".xml";

            if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            } else {// code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xmlhttp.open("GET", url, false);
            xmlhttp.send();

            //catches 404 and other errors
            if (xmlhttp.status === 200 || xhttp.status === 304) {
                xmlDoc=xmlhttp.responseXML;
                readXml(xmlDoc, id);
            }
            else{//if error occurs, this protein can't be displayed
                delete proteins[id];
            }

        } catch (e) {
            // console.log("Download failed "+e);
        }
        }
        downloadcounter++;

        if(downloadcounter<proteinnumber&!cancelDownload){
            setTimeout(function() {
                downloadProteinById();
            }, 0);
        }
        else{
            //finished downloading, continue
            $(".loadingbar").css("display","none");//hide loadingbar

            proteins=proteins2;//transfer to old list; from now on, proteins and proteins 2 are equivalent

            d3.select("#json_download").attr("class","pButton");//allow download of the data

            console.log("Proteins after download:");
            console.log(proteins);

            visualize();//display
        }

    }


}



var proteins2={};//create new object as there seem to be problems with only using a single one

function readXml(xml,currentId) {

    //here: combine the ids and the respective sequences
    var ids2 = xml.getElementsByTagName("accession");//temporary collection
    var mainId;

    var ids=[];//final array
    for(var j=0;j<ids2.length;j++){
        ids.push(ids2[j].childNodes[0].nodeValue);
    }

    for (var i = 0; i < ids.length; i++) {
        //var id = ids[i].childNodes[0].nodeValue;
        var id = ids[i];
        //the first id in the xml document is treated as main id under which all peptides are saved in the proteins object
        if(i == 0) {
            mainId = id;

            //create objectM
            proteins2[mainId]={};
            proteins2[mainId]["peptides"]={};
            proteins2[mainId]["name"]=xml.getElementsByTagName("fullName")[0].childNodes[0].nodeValue;
            proteins2[mainId]["topology"]=[];
            proteins2[mainId]["sequence"]="";

            //only proteins that are really defined
            if (currentId in proteins) {
            //transfer all the peptides if they aren't present yet
            for (peptide in proteins[currentId].peptides) {

                //if undefined, add it; if already defined, only if probability is higher
                if (proteins2[mainId].peptides[peptide] == undefined) {
                    //transferred the peptide
                    proteins2[mainId].peptides[peptide] = proteins[currentId].peptides[peptide];
                } else {
                    var oldProb = proteins2[mainId].peptides[peptide].probability;
                    var newProb = proteins[currentId].peptides[peptide].probability;
                    if (newProb > oldProb) {
                        proteins2[mainId].peptides[peptide] = proteins[currentId].peptides[peptide];
                    }
                }
            }
                delete proteins[currentId];
            }

        }
        else{
            //now loop trough the remaining proteins by their ids and save their content to the main protein
            if(id in proteins){
            for(peptide in proteins[id].peptides){

                //if undefined, add it; if already defined, only if probability is higher
                if(proteins2[mainId].peptides[peptide]==undefined){

                    //transferred the peptide
                    proteins2[mainId].peptides[peptide]=proteins[id].peptides[peptide];
                }else{
                    var oldProb = proteins2[mainId].peptides[peptide].probability;
                    var newProb = proteins[id].peptides[peptide].probability;
                    if(newProb>oldProb){
                        proteins2[mainId].peptides[peptide]=proteins[id].peptides[peptide];
                    }
                }
            }
            delete proteins[id];
            }
        }
    }


    //here: download sequence, topological data, add it to the list



    //display sequence
    var index = xml.getElementsByTagName("sequence").length - 1;
    var sequence = xml.getElementsByTagName("sequence")[index].firstChild.nodeValue;

    //alternative name:
    proteins2[mainId].name = xml.getElementsByTagName("fullName")[0].childNodes[0].nodeValue;
    proteins2[mainId].sequence = sequence.replace(/(\r\n|\n|\r)/gm,"");

    //here: specify which features should be downloaded
    //display features
    var featurelist = xml.getElementsByTagName("feature");
    for (i = 0; i < featurelist.length; i++) {
        var type = featurelist[i].getAttribute("type");
        if (type == "topological domain") {
            //TODO: check whether correct or not
            var begin = featurelist[i].getElementsByTagName("begin")[0].getAttribute("position");
            var end = featurelist[i].getElementsByTagName("end")[0].getAttribute("position");
            var description = featurelist[i].getAttribute("description");
            var transfer = [type, begin, end, description];
            proteins2[mainId].topology.push(transfer);
        }
        else if (type == "transmembrane region") {//here the description is in most cases "helical" or so. I don't need this.
            var begin = featurelist[i].getElementsByTagName("begin")[0].getAttribute("position");
            var end = featurelist[i].getElementsByTagName("end")[0].getAttribute("position");
            var description = "Transmembrane";
            var transfer = [type, begin, end, description];
            proteins2[mainId].topology.push(transfer);
        }
        else if (type == "signal peptide") {//here the description is in most cases "helical" or so. I don't need this.
            var begin = featurelist[i].getElementsByTagName("begin")[0].getAttribute("position");
            var end = featurelist[i].getElementsByTagName("end")[0].getAttribute("position");
            var description = "Signal peptide";
            var transfer = [type, begin, end, description];
            proteins2[mainId].topology.push(transfer);
        }
    }
}



//export function to download the JSON file upon download
function downloadJSON(){
    if(d3.select("#json_download").attr("class")=="pButton") {//=active
        var content = JSON.stringify(proteins);
        //download file to user
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([ content ], {
            type : 'text/txt'
        }));
        var date = new Date();
        a.download = 'proteator_'+date.getDate()+'_'+date.getMonth()+'_'+date.getFullYear()+'.json';

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();
        // Remove anchor from body
        document.body.removeChild(a);
    }
}

function downloadHTML(){
    if(d3.select("#html_download").attr("class")=="pButton") {//active
        downloadHTML_execute();
    }else{
    }

    function downloadHTML_execute(){
        //save protein data in the html file:
        d3.select("#dataContainer").text(JSON.stringify(proteins));

        //create content
        htmlContent="<html>";//opening

        //head with css and scripts
        htmlContent+="<head>";

        //get css contents
        var cssContent;
        $.ajax({
            url: "style/main.css",
            dataType: "text",
            success: function(content) {
                cssContent=content;
                htmlContent+="<style type='text/css'>"+cssContent+"</style>";
            }
        });

        //javascript files
        var path="scripts/";
        //TODO: new .js files need to be added here
        //the boll value tells wether the file has been succesfully retrieved
        //NOTE: booleans obsolet
        var filenames={"biojs-combined.js":false,"d3.v3.min.js":false,"jquery-1.7.2.min.js":false,"jquery-ui-1.8.2.custom.min.js":false,"dataInput.js":false,
            "download.js":false,"visualization.js":false,"filtersAndTools.js":false,"onlyForHtmlDownload.js":false};
        var scriptcontent="";//all scripts are collected in this object
        var filenumber=0;//counts how many files needed to be fused;
        for(name in filenames){
            filenumber++;
        }
        var filecounter=0;

        for(file in filenames){
            $.ajax({
                url: path+file,
                dataType: "text",
                success: function(content) {
                    scriptcontent+=content;
                    filecounter++;
                    if(filecounter>=filenumber){//all files have been downloaded -> proceed
                        htmlContent+="<scr"+"ipt type='text/javascript'>"+scriptcontent+"</sc" +"ript>";//script command needs to be broken up for some reason I forgot
                        htmlContent+="</head>";
                        addBodyAndDownload();
                    }
                }
            });
        }


        function addBodyAndDownload(){
            //body
            htmlContent+="<body>"
            htmlContent+=$("body").html();
            htmlContent+="</body></html>";//end

            //download everything
            var a = window.document.createElement('a');
            a.href = window.URL.createObjectURL(new Blob([ htmlContent ], {
                type : 'text/txt'
            }));
            var date = new Date();
            a.download = 'proteator_'+date.getDate()+'_'+date.getMonth()+'_'+date.getFullYear()+'.html';

            // Append anchor to body.
            document.body.appendChild(a);
            a.click();
            // Remove anchor from body
            document.body.removeChild(a);
        }
    }

}

function downloadCSV(){
    if(d3.select("#csv_download").attr("class")=="pButton") {//active
        downloadCSV_execute();
    }else{

    }
    function downloadCSV_execute(){
        //TODO: add probability + whole protein name
        var entryNo=0;
        //content
        var content = "";
        var firstline="entry no.,protein,description,peptide,xpress,foldRatio\n";
        content+=firstline;
        for(id in proteins){
            var line="";
            //entry no.
            line+=entryNo+",";
            entryNo++;
            //protein
            line+=id+",";
            //description
            line+=proteins[id].name+",";
            //peptides
            for(peptide in proteins[id].peptides){
                var line2=line+peptide+",";//seqeuence
                line2+=proteins[id].peptides[peptide].ratio+",";
                line2+=proteins[id].peptides[peptide].foldRatio+"\n";
                content+=line2;
            }
        }

        //download file to user
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([ content ], {
            type : 'text/txt'
        }));
        var date = new Date();
        a.download = 'proteator_'+date.getDate()+'_'+date.getMonth()+'_'+date.getFullYear()+'.csv';

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();
        // Remove anchor from body
        document.body.removeChild(a);
    }
}