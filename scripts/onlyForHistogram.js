/**
 * Created by Patrick on 10.11.2015.
 */
window.onload=function(){
    createHistogram();
}

function createHistogram(){
    var dataString = $("#dataContainer").html();
    var x = eval(dataString);

    //calculate mean value and adjust all values
    var meanValue = getMedian(x);
        function getMedian(valueArray){
        var median = 0;

        for(var i =0; i<valueArray.length;i++){
            median+=valueArray[i];
        }
        median/=valueArray.length;

        return median;
    }

    //adjust all values:
    for(i in x){
        x[i]=x[i]-meanValue;
    }


    var data = [
        {
            x: x,
            type: 'histogram'
        }
    ];

    var layout = {
        title: 'Peptides normalized',
        xaxis: {
            title: 'fold ratio',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: '#7f7f7f'
            }
        },
        yaxis: {
            title: 'amount',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: '#7f7f7f'
            }
        }
    };

    Plotly.newPlot('container', data, layout);
}