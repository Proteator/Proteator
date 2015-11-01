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