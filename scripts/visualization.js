/**
 * this script is responsible for displaying proteins and mapping peptides
 *
 * possible TODOs:
 * dynamically display only the proteins currently on screen (reduces memory/CPU usage
 * provide the user with a button to cancel the download?
 * display unalignable peptides
 * create log with undownloaded peptides
 */


//as the individual components are prone to change during development, it is the easiest approach to create one of the divs and then measure its height in order to get the height for every div
var firstDivId;
function getElementHeight(elementId){
    var selection = d3.select("#"+elementId);
    var data=selection.node().getBoundingClientRect();
    var top = data.top;
    var height = data.height;
    var bottom = data.bottom;
}

//removes previous contents and visualizes EVERYTHING -> change soon to dynamic visualization
 function visualize(){
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

     console.log("Visualized proteins: ");
     console.log(proteins);
     for(id in proteins){
         //only push the ids if the protein is set to be visible
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
         console.log("Processing "+startline +" of "+max);

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
                 div.append("label").text("- "+proteins[id].name);
                 div.append("br");


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
         else{
            //hide loading bar again
             $(".loadingbar").css("display","none");
             //enable buttons for the functions that require finished visualization
             d3.select("#html_download").attr("class","pButton");
             d3.select("#csv_download").attr("class","pButton");
             d3.select("#tools_invertFoldRatios").attr("class","pButton");
             d3.select("#tools_calculateCoverage").attr("class","pButton");
         }

     }
     
}


//old proteator functions

//buttonName = proteinID
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
                content.background="green";
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
            var pepseq = peptide
            if(pepseq!="N/A"){
                var ratio = proteins[id].peptides[peptide].ratio;
                var foldRatio = proteins[id].peptides[peptide].foldRatio;

                //find where the sequence lies (check again whether code is correct)
                var seq = proteins[id].sequence;

                //TODO: can currently only find a single occurence of this peptide, check also for repeats
                var myStart = seq.indexOf(pepseq)+1;
                var myEnd = myStart+pepseq.length-1;

                var annotation={};
                annotation.name=pepseq;

                //calculate color
                //TODO: make maxcolor global constant
                var maxColor=3;//leads to completely red or blue
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

                myAnnotations.push(annotation);}
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
        height:400
    });

    //settings:
    var legendSettings={};
    legendSettings.blocksize=15;
    legendSettings.top_offset=5;
    legendSettings.y_distance=20;

    //header
    legendSvg.append("text").attr({
        y:legendSettings.top_offset+legendSettings.blocksize
    }).text("Legend:");

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

}

var x_offset=10;
var y_offset=45;
var maxwidth = 800;//the max width on the screen

function visualizeData(div, id) {

    var svg = div.append("svg");
    var graphSvg = div.append("svg").attr("class", "graphSvg");
    var infoDiv = div.append("div").attr("id", "info" + id).attr("class", "infoDiv");

    var sequence = proteins[id].sequence;

    var defaultMax = 500;//on this size, a protein will occupy the entire width
    if (sequence.length > defaultMax) {
        defaultMax = sequence.length;
    }
    var scale = d3.scale.linear().domain([0, defaultMax]).range([0, maxwidth]).nice();

    var barheight = 20;

    //colors
    var maxColor = 3;//cutoff value for colorchange
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

        //different colors
        if (feature[3] == "Extracellular") {
            color_temp = "#9D1309";
        } else if (feature[3] == "Transmembrane") {
            color_temp = "orange";
        }
        else if (feature[3] == "Cytoplasmic" || feature[3] == "Lumenal") {
            color_temp = "yellow";
        }
        else if (feature[3] == "Signal peptide") {
            color_temp = "cyan";
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

    var peptidePositions = [];
    /*peptidePositions=[]
        Sequence1:{
                start : 5,
                stop: 15
            }
    ]*/

    //create mappingData
    for (peptide in proteins[id].peptides) {
        var additionalLines=0;//if several peptides overlap

        //find where the sequence lies (check again whether code is correct)

        var indexes = [];
        currentPos = 0;
        if(peptide.length>0){//don't search for empty peptides

            while (true) {
                var index1 = sequence.indexOf(peptide, currentPos);
                if (index1 == -1) {
                    break;
                } else {
                    indexes.push(index1);
                    currentPos = index1 + 2;//search for multiple occurences of this peptide
                    //TODO: check whether this + 2 is actually correct
                }
            }
        }

        for(var j=0;j<indexes.length;j++){//create new entry for every position found
            var temp = {};
            temp.id = id; //also save id to make peptides unique
            temp.sequence=peptide;
            temp.probability=proteins[id].peptides[peptide].probability;
            temp.ratio=proteins[id].peptides[peptide].ratio;
            temp.foldRatio=proteins[id].peptides[peptide].foldRatio;

            //get color
            var colorvalue=temp.foldRatio;//=foldRatio
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

            temp.red=red1;
            temp.green=green1;
            temp.blue=blue1;


            var posX=x_offset + scale((indexes[j] - 1));
            temp.x=posX;

            var moveToNewLine=false;
            for(k in peptidePositions){
                var oldPos=peptidePositions[k];

                if(indexes[j]>= oldPos.start&&indexes[j]<=oldPos.stop){
                    moveToNewLine=true;
                }else if((indexes[j]+peptide.length)>= oldPos.start&&(indexes[j]+peptide.length)<=oldPos.stop){
                    moveToNewLine=true;
                }
            }


            if(moveToNewLine){//2nd line of peptides
                temp.y=y_offset+2*barheight;
            }
            else{
                temp.y=y_offset+barheight;
            }
            temp.width=scale(peptide.length);
            temp.height = barheight;

            //add to list
            mappingData.push(temp);

            //save index
            var pos={"start":indexes[j],"stop":indexes[j]+peptide.length};
            peptidePositions.push(pos);
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
        //select all peptides with the same class; selecting the graph peptides by class is not necessary as they are unique:
        var mappedPeptideClass="map_peptide_"+ d.id+"_"+d.sequence;
        d3.selectAll(mappedPeptideClass).attr("stroke","grey").attr("stroke-width",2);//first select as grey, later mark active ones as black

        //select entry on graph:
        var graphPeptideId="#graph_peptide_"+d.id+"_"+d.sequence;
        d3.selectAll(graphPeptideId).attr("stroke","grey").attr("stroke-width",2);

        var selection = document.getElementById("peptideInfoFinal"+d.id+"_"+d.sequence);//can't use d3 here as it doesn't return "null"
        if(selection==null){
            //if no element with the id "peptideInfoFinal...." exists, a new element should be generated
            //old: selection = infoDiv.append("p").text(d.sequence +" Heavy2Light: "+d.ratio+" foldRatio: "+d.foldRatio).attr("id","peptideInfo"+d.id+"_"+d.sequence);

            selection = infoDiv.select("#peptideInfo"+d.id).html(d.sequence +" Ratio: "+d.ratio);
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
            selection = infoDiv.append("p").text(d.sequence +" Ratio: "+d.ratio).attr("id","peptideInfoFinal"+d.id+"_"+d.sequence);
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
        height: barheight*(3+additionalLines)+y_offset
    });
    createGraph(graphSvg, mappingData, infoDiv);
}

function createGraph(dataSvg, peptideData, infoDiv){
    //looks whether at least one peptide has a ratio that can be displayed
    var worthDisplaying=false;
    for(peptide in peptideData){
        var ratio= peptideData[peptide].foldRatio;

        if(!isNaN(ratio)){
            worthDisplaying=true;
            console.log("worthDisplaying");
            break;
        }
    }
    console.log("Display: "+worthDisplaying);

    if(worthDisplaying) {
        //todo use final variables for options
        dataSvg.style("height", 60);//size up + display

        var defaultDomain = 5;
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

                if (isNaN(d.foldRatio)) {
                    selection.remove();
                }
                //remove all circles with a non-numerical foldRatio
                if (isNaN(d.foldRatio)) {
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
                    selection = infoDiv.select("#peptideInfo" + d.id).html(d.sequence + " Ratio: " + d.ratio);
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
                    selection = infoDiv.append("p").text(d.sequence + " Heavy2Light: " + d.ratio + " foldRatio: " + d.foldRatio).attr("id", "peptideInfoFinal" + d.id + "_" + d.sequence);
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
        }).style("text-anchor", "middle").text("foldchange");
    }
}
