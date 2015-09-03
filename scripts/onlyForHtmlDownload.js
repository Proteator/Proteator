window.onload=function(){
    //load the protein data saved in the html file
    proteins=JSON.parse(d3.select("#dataContainer").text());
    visualize();
}