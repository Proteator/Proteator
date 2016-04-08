/**
 * this script is responsible for displaying proteins and mapping peptides
 *
 * possible TODOs:
 * dynamically display only the proteins currently on screen (reduces memory/CPU usage
 * provide the user with a button to cancel the download?
 * display unalignable peptides
 * create log with undownloaded peptides
 */


//colors:
var highest_foldRatio = 0;//saves the highest absolute foldratio
var maxColor = 4;//cutoff value for colorchange; dynamically calculated; 4=default
var color_upperBound=10;//max and lower possible values for the color
var color_lowerBound=1;




//save date at start and end of visualization to calculate runtime
var time_vis_start, time_vis_end;

//removes previous contents and visualizes EVERYTHING -> change soon to dynamic visualization
 function visualize(){
     time_vis_start=Date.now();

     //set colors
     if(highest_foldRatio>0){
         highest_foldRatio=Math.ceil(highest_foldRatio*2)/2;
         if(highest_foldRatio>color_upperBound){
             maxColor=color_upperBound;
         }
         else if(highest_foldRatio<color_lowerBound){
             maxColor=color_lowerBound;
         }
         else{
             maxColor=highest_foldRatio;
         }
     }



     //create legend
     var legendholder = d3.select("#legendHolder");
     legendholder.selectAll("*").remove();
     createLegend(legendholder);

     //disable buttons download until data is visualized
     d3.select("#html_download").attr("class","pButton_inactive");
     d3.select("#csv_download").attr("class","pButton_inactive");
     d3.select("#tools_invertFoldRatios").attr("class","pButton_inactive");


     if(proteinData==undefined||jQuery.isEmptyObject(proteinData)){//test wether the data is already defined
        createFilterData();//analyze the data for filter function; do this here as it also should be executed for uploaded JSON files
     }

     var graphicsDiv = d3.select("#graphics");
     //remove previous contents
     graphicsDiv.selectAll("*").remove();

     //create array of the proteins to be able to setTimeout
     var proteinIds=[];

     for(id in proteins){
         //only push the ids if the protein is set to be visible (filter)
         var visible = proteinData[id].visible||true;

         if(visible){
             proteinIds.push(id);
         }
     }
     var max=proteinIds.length;
     console.log("Length: "+max);


     //for updating the ui every so and so many proteins
     var updateInterval = 100;
     var firstend=updateInterval;
     if(firstend>max){
         firstend=max;
     }


     $(".loadingbar").css("display","block");

     var gradientsize=0;
     $(".loadingbar").css("background","linear-gradient(to right, #2672EC 0%, white "+gradientsize+"%)");
     $(".loadingbar").css("background","-moz-linear-gradient(right, #2672EC 0%, white "+gradientsize+"%)");
     $(".loadingbar").css("background","-o-linear-gradient(right, #2672EC 0%, white "+gradientsize+"%)");
     $(".loadingbar").css("background","-webkit-linear-gradient(left, #2672EC 0%, white "+gradientsize+"%)");
     $("#loadingtext").text("Visualizing: "+0+"/"+max);

     var proteinCheckboxes={};//allows identifying checkboxes

     setTimeout(function(){displayProtein(0,firstend);},0);

     function displayProtein(startline, stopline){

         //display progress
         $("#loadingtext").text("Visualizing: "+startline+"/"+max);
         var percent=((startline/max)*100);
         var percent2=percent+gradientsize+"%";
         percent+="%";
         $(".loadingbar").css("background","linear-gradient(to right, #2672EC "+percent+", white "+percent2+")");
         $(".loadingbar").css("background","-moz-linear-gradient(right, #2672EC "+percent+", white "+percent2+")");
         $(".loadingbar").css("background","-o-linear-gradient(right, #2672EC "+percent+", white "+percent2+")");
         $(".loadingbar").css("background","-webkit-linear-gradient(left, #2672EC "+percent+", white "+percent2+")");

         for(var i=startline; i<stopline; i++){
             var id=proteinIds[i];
             if(proteinData[id].visible){//add condition for a protein to be displayed

                 //create new div for every protein
                 var div=graphicsDiv.append("div").attr("class","proteinDiv").attr("id","div_"+id);


                 //create link to look it up on uniprot
                 div.append("a").text(" "+id+" ").attr("name",id).style("color","blue").on("click",function(){window.open("http://www.uniprot.org/uniprot/" + this.name)});
                 //display name beside checkbox
                 div.append("label").text("- "+proteins[id].name +" ("+proteins[id].name_short+") ");
                 div.append("br");

                 //if IL nondifferentiation is active, save a modified sequence in the proteinData
                 if(IL_nondifferentiation){
                     var sequence_mod=proteins[id].sequence;
                     //in  this sequence, Is and Ls will be replaced with 1s
                     sequence_mod = sequence_mod.replace(/I/g,"1");
                     sequence_mod = sequence_mod.replace(/L/g,"1")
                     proteinData[id]["modified"]=sequence_mod;
                 }

                 try{
                     //createLegend(div);
                     visualizeData(div, id);
                 }catch(e){
                     console.log(e);
                 }

                // div.append("br");
                 //create show/hide buttons for the biojs component and the respective div
                 var button=div.append("input").attr("type","button").attr("value", "+").attr("name",id).attr("id","button"+id);
                 button.on("click",function(){createBiojSequence(this)});

                 var divid="d3"+id;//for BioJ
                 var d3div=div.append("div").attr("id",divid);

             }
         }

         //set the new interval so that not more proteins than necessary
         startline=stopline;
         stopline=stopline+updateInterval;
         if(stopline>max){
             stopline=max;
         }
         if(startline<max){

             setTimeout(function(){displayProtein(startline,stopline);},0);//start new interval
         }
         else{//finished

            //hide loading bar again
             $(".loadingbar").css("display","none");
             //enable buttons for the functions that require finished visualization
             d3.select("#html_download").attr("class","pButton");
             d3.select("#csv_download").attr("class","pButton");
             d3.select("#tools_invertFoldRatios").attr("class","pButton");
             d3.select("#tools_calculateCoverage").attr("class","pButton");

             time_vis_end = Date.now();
             var runtime = time_vis_end-time_vis_start;
             console.log("Visualization time: "+runtime+"ms");//example.mzTab: 176ms
         }

     }
     
}


//old proteator functions

//buttonName = proteinID
//TODO: use for alignment saved alignment data from main function
function createBiojSequence(button){
    var id = button.name;
    var divname="d3"+id;
    //remove content
    var div=d3.select("#"+divname).html("");

    if(button.value=="+"){
        var data={};
        data.sequence=proteins[id].sequence;
        data.target=divname;
        data.format="CODATA";
        data.id=id;


        //add annotation:
        //first: topology as highlights;
        myHighlights=[];


        for(var i = 0; i < proteins[id].topology.length; i++) {
            var feature = proteins[id].topology[i];

            var content={};
            content.start=feature[1];//start
            content.end=feature[2];
            //TODO: change color depending on description
            content.color="black";
            if(feature[3]=="Extracellular"){
                content.background="#9D1309";
            }else if(feature[3]=="Transmembrane"){
                content.background="orange";
            }
            else if(feature[3]=="Cytoplasmic"||feature[3]=="Lumenal"){
                content.background="yellow";
            }
            else if(feature[3]=="Signal peptide"){
                content.background="cyan";
            }
            else if(feature[3]=="Mitochondrial intermembrane"){
                content.background="violet";
            }
            else if(feature[3]=="Mitochondrial intermembrane"){
                content.background="violet";
            }
            content.id="highlight"+i;
            myHighlights.push(content);}

        data.highlights=myHighlights;//add the highlights;

        //add peptides as annotations
        myAnnotations=[];

        for (peptide in proteins[id].peptides) {
            var pepseq;
            if(!IL_nondifferentiation){
                pepseq = peptide;
            }
            else{
                pepseq = proteinData[id].peptides_modified[peptide];
            }
            if(pepseq!="N/A"){
                var ratio = proteins[id].peptides[peptide].ratio;
                var foldRatio = proteins[id].peptides[peptide].foldRatio;

                //find where the sequence lies (check again whether code is correct)
                var seq;
                if(!IL_nondifferentiation){
                    seq = proteins[id].sequence;
                }
                else{
                    seq = proteinData[id].modified;
                }

                var index = seq.indexOf(pepseq);

                //failsafe-> prevents infinite loop:
                var runs = 0;
                var maxruns = 10;

                //loop to find multiple occurences
                while(index!=-1){
                    console.log("#looping");
                    var myStart = index+1;
                    var myEnd = myStart+pepseq.length-1;

                    var annotation={};
                    annotation.name=pepseq;

                    //calculate color
                    //TODO: make maxcolor global constant
                    var colorvalue=foldRatio;//=foldRatio
                    if(colorvalue>maxColor){
                        colorvalue=maxColor;
                    }
                    else if(colorvalue<-maxColor){
                        colorvalue=-maxColor;
                    }
                    var red=127;
                    var green=127;
                    var blue=127;

                    var colorChange=127*(colorvalue/maxColor);
                    red-=colorChange;
                    green+=colorChange;
                    blue-=Math.abs(colorChange);
                    annotation.color=d3.rgb(red,green,blue);

                    //annotation.color="#F0F020";
                    annotation.html="Ratio: "+ratio;

                    annotation.regions=[];//TODO: multiple regions possible, make use of this
                    var singleRegion={};
                    singleRegion.start=myStart;
                    singleRegion.end=myEnd;
                    annotation.regions.push(singleRegion);


                    myAnnotations.push(annotation);
                    var len = pepseq.length;
                    if(len<1){
                        len = 1;
                    }
                    index = seq.indexOf(pepseq,index+len);

                    runs++;
                    if(runs>maxruns){
                        break;
                    }
                }
            }
        }
        data.annotations=myAnnotations;

        //change size:
        data.columns={size:50,spacedEach:10};

        //create component
        var sequence= new Biojs.Sequence(data);

        //change button to minus
        button.value="-";
    }
    else{
        //switch again
        button.value="+";
    }
}

function createLegend(div){

    //1.: protein legend
    var entries={
        "Signal peptide":"cyan",
        "Extracellular":"#9D1309",
        "Transmembrane":"orange",
        "Cytoplasmic/Lumenal":"yellow",
        "Mit. Intermembrane":"violet",
        "Other":"blue"
    }

    var legendSvg = div.append("svg").attr("class","legendSvg");
    legendSvg.attr({
        width:200,
        height:200
    });

    //settings:
    var legendSettings={};
    legendSettings.blocksize=15;
    legendSettings.top_offset=5;
    legendSettings.y_distance=20;

    //header
    legendSvg.append("text").attr({
        y:legendSettings.top_offset+legendSettings.blocksize
    }).text("Protein:");

    var counter=1;
    for(descr in entries){
        legendSvg.append("rect").attr({
            fill: entries[descr],
            width:legendSettings.blocksize, height:legendSettings.blocksize,
            y:legendSettings.top_offset+counter*legendSettings.y_distance
        });
        legendSvg.append("text").attr({
            y:legendSettings.top_offset+counter*legendSettings.y_distance+legendSettings.blocksize, x:20
        }).text(descr);
        counter++;
    }


    //if a foldratio is present: create a ratio scale legend
    if(highest_foldRatio>0){
        var legendRatio1 = ">"+maxColor+" ";
        var legendRatio2 = (maxColor/2)+" ";
        var legendRatio3 = "-"+(maxColor/2)+" ";
        var legendRatio4 = "<-"+maxColor+" ";

        var entries2={};
        entries2[legendRatio1]="#00FF00";
        entries2[legendRatio2]="#44BB44";
        entries2['0 ']="#888";
        entries2[legendRatio3]="#BB4444";
        entries2[legendRatio4]="#FF0000";
        entries2['N/A']="#000";

        var ratioSvg = div.append("svg").attr("class","legendSvg");
        ratioSvg.attr({
            width:200,
            height:200
        });
        //header
        ratioSvg.append("text").attr({
            y:legendSettings.top_offset+legendSettings.blocksize
        }).text("log2(ratio):");

        counter=1;
        for(descr in entries2){
            ratioSvg.append("rect").attr({
                fill: entries2[descr],
                width:legendSettings.blocksize, height:legendSettings.blocksize,
                y:legendSettings.top_offset+counter*legendSettings.y_distance
            });
            ratioSvg.append("text").attr({
                y:legendSettings.top_offset+counter*legendSettings.y_distance+legendSettings.blocksize, x:20
            }).text(descr);
            counter++;
        }
    }


}

var x_offset=10;
var y_offset=45;
var maxwidth = 800;//the max width on the screen

var test;
function visualizeData(div, id) {

    var svg = div.append("svg");
    var graphSvg = div.append("svg").attr("class", "graphSvg");
    var infoDiv = div.append("div").attr("id", "info" + id).attr("class", "infoDiv");

    var sequence;
    if(!IL_nondifferentiation){
        sequence = proteins[id].sequence;
    }
    else{
        sequence = proteinData[id].modified;
    }


    var defaultMax = 10;//min size of the scale
    if (sequence.length > defaultMax) {
        defaultMax = sequence.length;
    }
    var scale = d3.scale.linear().domain([0, defaultMax]).range([0, maxwidth]).nice();

    var barheight = 20;

    //colors
    var mainBarColor = "#1515ff";

    //display protein
    var mainBar = svg.append("rect");
    mainBar.attr({
        x: x_offset,
        y: y_offset,
        height: barheight,
        width: function () {
            return scale(sequence.length);
        },
        fill: mainBarColor
    });

    //annotate topological information
    //first: create array with the necessary informations
    var topologyData = [];
    var annotationTooltip;//only a single one per time
    for (i = 0; i < proteins[id].topology.length; i++) {
        var feature = proteins[id].topology[i];
        var xPos = x_offset + scale(feature[1] - 1);
        var width_temp = scale(feature[2] - (feature[1] - 1));
        var color_temp;
        var descr = feature[3];

        //TODO: outsource to function (also for j3ds)
        if(feature[3]=="Extracellular"){
            color_temp="#9D1309";
        }else if(feature[3]=="Transmembrane"){
            color_temp="orange";
        }
        else if(feature[3]=="Cytoplasmic"||feature[3]=="Lumenal"){
            color_temp="yellow";
        }
        else if(feature[3]=="Signal peptide"){
            color_temp="cyan";
        }
        else if(feature[3]=="Mitochondrial intermembrane"){
            color_temp="violet";
        }
        else if(feature[3]=="Mitochondrial intermembrane"){
            color_temp="violet";
        }
        else{
            color_temp="blue";
        }

        var tempObject = {
            start: xPos,
            stop: y_offset,
            width: width_temp,
            color: color_temp,
            description: descr
        }
        topologyData.push(tempObject);
    }


    //only select topologyAnnotations
    svg.selectAll("topoAnnotation").data(topologyData).enter().append("rect").attr({
        x: function (d) {
            return d.start;
        },
        y: function (d) {
            return d.stop;
        },
        height: barheight,
        width: function (d) {
            return d.width;
        },
        fill: function (d) {
            return d.color;
        },
        class: "topoAnnotation"
    }).on("mouseover", function (d) {

        //TODO: improve this step: precise positions for tooltip
        annotationTooltip = d3.select("body").append("div").text(d.description).style({
            position: "absolute",
            left: function () {
                return d3.event.pageX + "px";
            },
            top: function () {
                return d3.event.pageY + "px";
            }
        });

    }).on("mouseout", function (d) {
        annotationTooltip.remove();
    });

    //create Object Array for each Peptide
    var mappingData = [];
    /**
     mappingData=[
     {
         sequence: "abcdefg",
         probability: 1337,
         ratio: 1,
         foldRatio: 0,
         red: 127,
         green: 127,
         blue: 127
     },
     {...next peptide...}
     ]
     **/

        //for handling multiple lines of peptides
    var peptidePositions = {};//array of positions
    var currentLane = 1;//different lanes for the peptides
    var occupiedLanes={};//saves lanes which are occupied for this position

    /*
    peptidePositions={
        '1':["s","1"],//"s"=="start","1"==current lane
        '15':["s","2"],
        '20':["e","1"]//"e"="end" -> lane 1 free again
    }
     */
    //old:
    /*peptidePositions=[]
        Sequence1:{
                start : 5,
                stop: 15
            }
    ]*/

    if(IL_nondifferentiation){
        //the the modified peptides (1 instead of I/L) will be saved in proteinData accessible by their normal peptides
        //after mapping is done, the changes are reverted
        proteinData[id].peptides_modified={};
        for (peptide in proteins[id].peptides){
            var modified_peptide = peptide;
            modified_peptide = modified_peptide.replace(/I/g,"1");
            modified_peptide = modified_peptide.replace(/L/g,"1");
            //save the normal peptides accessible by the modified peptides
            proteinData[id].peptides_modified[peptide]=modified_peptide;
        }
    }

    //create mappingData

    //step 1: create list of all the positions
    var totalLanes = 0;
    var mappingresult = {};
    var pdata = [];
    var lanes = {};

    for (peptide in proteins[id].peptides) {

        var pseq = peptide;
        mappingresult[pseq] = {
            "lane":[],
            "start":[],
        };

        var indexes = [];
        var currentPos = 0;

        if (pseq.length > 0) {//don't search for empty peptides
            while (true) {
                var index1;
                if (!IL_nondifferentiation) {
                    index1 = sequence.indexOf(pseq, currentPos);
                }
                else {
                    var mod_sequence = proteinData[id].modified;
                    var mod_peptide = proteinData[id].peptides_modified[pseq];
                    index1 = mod_sequence.indexOf(mod_peptide, currentPos);
                }

                if (index1 == -1) {
                    break;
                } else {
                    indexes.push(index1);
                    currentPos = index1 + 1;//search for multiple occurences of this peptide
                 }
             }
        }

        for (j in indexes) {
            var start = indexes[j];
            var end = start + pseq.length;
            pdata.push({"start": start, "end": end, "seq": pseq});
        }
    }

    pdata.sort(function (a, b) {
        return a.start - b.start;
    });

    for (i in pdata) {
        var lane = 1;

        var maxLanes = 10;//emergency cutoff
        var counter = 0;

        while (true) {
            counter++;
            if (counter > maxLanes) {
                break;
            }
            if (lanes[lane] == undefined) {
                break;
            }
            else if (pdata[i]["start"] > lanes[lane]["end"]) {
                break;
            }
            else {
                lane++;
            }
        }
        lanes[lane] = {"start": pdata[i]["start"], "end": pdata[i]["end"]};

        var pseq = pdata[i]["seq"];
        mappingresult[pseq]["lane"].push(lane);
        mappingresult[pseq]["start"].push(pdata[i]["start"]);
    }

    //count lanes
    for (i in lanes) {
        totalLanes++;
    }

    //step 2: create other information + import position

    for (peptide in proteins[id].peptides) {

        var probability = proteins[id].peptides[peptide].probability;
        var ratio = proteins[id].peptides[peptide].ratio;
        var foldRatio = proteins[id].peptides[peptide].foldRatio;

        var colorvalue=foldRatio;//=foldRatio
        if(colorvalue>maxColor){
            colorvalue=maxColor;
        }
        else if(colorvalue<-maxColor){
            colorvalue=-maxColor;
        }
        var red1=127;
        var green1=127;
        var blue1=127;

        var colorChange=127*(colorvalue/maxColor);
        red1-=colorChange;
        green1+=colorChange;
        blue1-=Math.abs(colorChange);

        for(var j=0;j<mappingresult[peptide]["start"].length;j++){//create new entry for every position found
            var temp = {};
            temp.id = id; //also save id to make peptides unique

            if(!IL_nondifferentiation){
                temp.sequence=peptide;
            }
            else{
                temp.sequence=proteinData[id].peptides_modified[peptide];
            }

            temp.probability=probability;
            temp.ratio=ratio;
            temp.foldRatio=foldRatio;

            //get color
            temp.red=red1;
            temp.green=green1;
            temp.blue=blue1;


            var posX=x_offset + scale((mappingresult[peptide]["start"][j] - 1));
            temp.x=posX;

            temp.y=y_offset+mappingresult[peptide]["lane"][j]*barheight;

            temp.width=scale(peptide.length);
            temp.height = barheight;

            //add to list
            mappingData.push(temp);
        }
    }

    //add empty line for displaying sequence info
    infoDiv.append("p").html("</br>").attr("id","peptideInfo"+id);

    //map peptides
    //TODO: outsource all those onclick code to function
    svg.selectAll("peptide").data(mappingData).enter().append("rect").attr({
        //class as the peptide might align in several positions
        class:function(d){var name = "map_peptide_"+ d.id+"_"+d.sequence; return name;},
        x: function(d){return d.x;},
        y: function(d){return d.y;},
        width: function(d){return d.width;},
        height: function(d){return d.height;},
        fill: function(d){return d3.rgb(d.red,d.green,d.blue)}
    }).on("mouseover",function(d){
        d3.select(this).attr("stroke","grey").attr("stroke-width",2);
        //select all peptides with the same class; selecting the ratio-graph peptides by class is not necessary as they are unique:
        var mappedPeptideClass=".map_peptide_"+ d.id+"_"+d.sequence;
        d3.selectAll(mappedPeptideClass).attr("stroke","grey").attr("stroke-width",2);//first select as grey, later mark active ones as black

        //select entry on graph:
        var graphPeptideId="#graph_peptide_"+d.id+"_"+d.sequence;
        d3.selectAll(graphPeptideId).attr("stroke","grey").attr("stroke-width",2);

        var selection = document.getElementById("peptideInfoFinal"+d.id+"_"+d.sequence);//can't use d3 here as it doesn't return "null"
        if(selection==null){
            //if no element with the id "peptideInfoFinal...." exists, a new element should be generated
            //old: selection = infoDiv.append("p").text(d.sequence +" Heavy2Light: "+d.ratio+" foldRatio: "+d.foldRatio).attr("id","peptideInfo"+d.id+"_"+d.sequence);

            var ratioString="";
            test= d.ratio;

            var ratioRounded = d.ratio;
            ratioRounded = parseFloat(ratioRounded).toFixed(4);

            if(d.ratio!=undefined &! isNaN(d.ratio)){
                ratioString = " Ratio: "+ ratioRounded+" log2(Ratio): "+ d.foldRatio;
            }
            selection = infoDiv.select("#peptideInfo"+d.id).html(d.sequence +ratioString);
            //this element has the id "peptideInfo...." and will be emptied by the mouseout-function, not so the final one (onclick);
        }
    }).on("mouseout",function(d){
        selection = infoDiv.select("#peptideInfo"+d.id).html("</br>");
        //check if selected or not:
        var selection = document.getElementById("peptideInfoFinal"+d.id+"_"+d.sequence);
        var graphPeptideId="#graph_peptide_"+d.id+"_"+d.sequence;

        var mappedPeptideClass=".map_peptide_"+d.id+"_"+d.sequence;
        if(selection==null){//not selected -> return to stroke to normal
            d3.selectAll(mappedPeptideClass).attr("stroke-width",0);
            d3.select(graphPeptideId).attr("stroke-width",0);
        }else{//selected-> make it black again
            d3.selectAll(mappedPeptideClass).attr("stroke","black");
            d3.select(graphPeptideId).attr("stroke","black");
        }

        //remove information if only temporarily displayed
    }).on("click", function(d){
        //changes the ID to final -> prevents removal by mouseout
        //only create new one, if none yet exists
        var selection = document.getElementById("peptideInfoFinal"+d.id+"_"+d.sequence);//can't use d3 here as it doesn't return "null"
        var graphPeptideId="#graph_peptide_"+d.id+"_"+d.sequence;

        var mappedPeptideClass=".map_peptide_"+d.id+"_"+d.sequence;
        if(selection==null){
            //color it black to mark selection
            d3.selectAll(mappedPeptideClass).attr("stroke","black").attr("stroke-width",2);
            d3.select(graphPeptideId).attr("stroke","black").attr("stroke-width",2);
            //remove old selection, create new one with new id
            //TODO: find way to update old selection, prevent removal
            d3.select("#peptideInfo"+d.id).html("</br>");
            var ratioString="";

            var ratioRounded = d.ratio;
            ratioRounded = parseFloat(ratioRounded).toFixed(4);

            if(d.ratio!=undefined){
                ratioString = " Ratio: "+ ratioRounded+" log2(Ratio): "+ d.foldRatio;
            }
            selection = infoDiv.append("p").text(d.sequence +ratioString).attr("id","peptideInfoFinal"+d.id+"_"+d.sequence);
        }
        else{
            //color it grey to mark mouseover
            d3.selectAll(mappedPeptideClass).attr("stroke","grey").attr("stroke-width",2);
            d3.select(graphPeptideId).attr("stroke","grey").attr("stroke-width",2);
            //if it exists and one clicks again: remove it
            d3.select("#peptideInfoFinal"+d.id+"_"+d.sequence).remove();
        }
    });


    //create axis
    var axis = d3.svg.axis().scale(scale).orient("top").ticks(5);
    var axisGroup = svg.append("g").attr("class", "axis").attr("transform", "translate("+x_offset+",30)").call(axis);
    //label the axis
    svg.append("text").attr({
        "x":function(){
            return (x_offset+maxwidth)/2;
        },
        "y":5,
        "class":"axisLabel"
    }).style("text-anchor", "middle").text("Amino acids");


    //adjust height of svg
    //TODO: only necessary if several lines of peptides exist
    svg.attr({
        height: barheight*(3+totalLanes)+y_offset
    });
    createGraph(graphSvg, mappingData, infoDiv);
}

function createGraph(dataSvg, peptideData, infoDiv){
    //looks whether at least one peptide has a ratio that can be displayed
    var worthDisplaying=false;
    for(peptide in peptideData){
        var ratio= peptideData[peptide].foldRatio;

        if(!isNaN(ratio)&&ratio!=null){
            worthDisplaying=true;
            break;
        }
    }

    if(worthDisplaying) {
        //todo use final variables for options
        dataSvg.style("height", 60);//size up + display

        var defaultDomain = 1;
        //creates scale without ratio and dynamic domain
        var scale = d3.scale.linear().domain([-defaultDomain, defaultDomain]).range([0, maxwidth]);//range: pixels

        //find max value; apply it if higher than standard
        var max = 0;
        for (peptide in peptideData) {
            var foldRatio = Math.abs(peptideData[peptide].foldRatio);
            if (foldRatio > defaultDomain && foldRatio > max) {
                max = foldRatio;
            }
        }
        if (max > defaultDomain) {
            scale.domain([-max, max]).nice();
        }

        //create insert data:
        //also: function for mouseover
        var circles = dataSvg.selectAll("peptide").data(peptideData).enter().append("circle").
            each(
            //only adds attribute if it makes sense and removes circles without "cx"
            function (d) {
                var selection = d3.select(this);

                //remove all circles with a non-numerical foldRatio
                if (isNaN(d.foldRatio)|| d.foldRatio==null) {
                    selection.remove();
                } else {
                    var value = scale(d.foldRatio) + x_offset;
                    selection.attr("cx", value);
                }
            }
        ).attr({
                class: "graph_peptide",
                cy: 5 + y_offset,
                r: 5,
                fill: function (d) {
                    return d3.rgb(d.red, d.green, d.blue)
                },
                id: function (d) {
                    var name = "graph_peptide_" + d.id + "_" + d.sequence;
                    //if this circle already exists: remove the new object
                    if (d3.select("#" + name) != "") {
                        d3.select(this).remove();
                    }
                    //else: simply return the new id
                    return name;
                }
            }).on("mouseover", function (d) {
                //selecting the graph peptides by class is not necessary, as they are the same
                d3.select(this).attr("stroke", "grey").attr("stroke-width", 2);//first select as grey, later mark active ones as black

                //select also the mapped peptide and change it accordingly
                var mappedPeptideClass = ".map_peptide_" + d.id + "_" + d.sequence;
                d3.selectAll(mappedPeptideClass).attr("stroke", "grey").attr("stroke-width", 2);//first select as grey, later mark active ones as black

                var selection = document.getElementById("peptideInfoFinal" + d.id + "_" + d.sequence);//can't use d3 here as it doesn't return "null"
                if (selection == null) {
                    //if no element with the id "peptideInfoFinal...." exists, a new element should be generated
                    var ratioRounded = d.ratio;
                    ratioRounded = parseFloat(ratioRounded).toFixed(4);
                    selection = infoDiv.select("#peptideInfo" + d.id).html(d.sequence + " Ratio: " + ratioRounded+" log2(Ratio): "+ d.foldRatio);
                    //this element has the id "peptideInfo...." and will be destroyed by the mouseout-function, not so the final one (onclick);
                }
            }).on("mouseout", function (d) {
                d3.select("#peptideInfo" + d.id).html("</br>");
                //check if selected or not:
                var selection = document.getElementById("peptideInfoFinal" + d.id + "_" + d.sequence);
                if (selection == null) {//not selected -> return to stroke to normal
                    d3.select(this).attr("stroke-width", 0);

                    //select also the mapped peptide and change it accordingly
                    var mappedPeptideClass = ".map_peptide_" + d.id + "_" + d.sequence;
                    d3.selectAll(mappedPeptideClass).attr("stroke-width", 0);
                } else {//selected-> make it black again
                    d3.select(this).attr("stroke", "black");

                    //select also the mapped peptide and change it accordingly
                    var mappedPeptideClass = ".map_peptide_" + d.id + "_" + d.sequence;
                    d3.selectAll(mappedPeptideClass).attr("stroke", "black");
                }

                //remove information if only temporarily displayed
            }).on("click", function (d) {
                //changes the ID to final -> prevents removal by mouseout
                //only create new one, if none yet exists
                var selection = document.getElementById("peptideInfoFinal" + d.id + "_" + d.sequence);//can't use d3 here as it doesn't return "null"
                if (selection == null) {
                    //color it black to mark selection
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

                    //select also the mapped peptide and change it accordingly
                    var mappedPeptideClass = ".map_peptide_" + d.id + "_" + d.sequence;
                    d3.selectAll(mappedPeptideClass).attr("stroke", "black").attr("stroke-width", 2);

                    //remove old selection, create new one with new id
                    //TODO: find way to update old selection, prevent removal
                    d3.select("#peptideInfo" + d.id + "_" + d.sequence).remove();
                    selection = infoDiv.append("p").text(d.sequence + " Heavy2Light: " + d.ratio + " log2(Ratio): " + d.foldRatio).attr("id", "peptideInfoFinal" + d.id + "_" + d.sequence);
                }
                else {
                    //color it grey to mark mouseover
                    d3.select(this).attr("stroke", "grey").attr("stroke-width", 2);
                    var mappedPeptideClass = ".map_peptide_" + d.id + "_" + d.sequence;
                    d3.selectAll(mappedPeptideClass).attr("stroke", "grey").attr("stroke-width", 2);
                    //if it exists and one clicks again: remove it
                    d3.select("#peptideInfoFinal" + d.id + "_" + d.sequence).remove();
                }
            });

        var axis2 = d3.svg.axis().scale(scale).orient("top").ticks(11);//labels on top
        var axisGroup2 = dataSvg.append("g").attr("class", "axis").attr("transform", "translate(" + x_offset + ",30)").call(axis2);

        //label
        dataSvg.append("text").attr({
            "x": function () {
                return (x_offset + maxwidth) / 2;
            },
            "y": 5,
            "class": "axisLabel"
        }).style("text-anchor", "middle").text("log2(ratio)");
    }
}


//functions for the error messages to screen:
var error_divid = "errormessage"
function error_show(message){
    var e = $("#"+error_divid);
    e.css("display","block");
    e.html(message);
}
function error_hide(){
    var e = $("#"+error_divid);
    e.css("display","none");
    e.html("");
}

