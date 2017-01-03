// y = ax + b
function findLinearFunction(p1, p2){
	var a = (p2.y - p1.y) / (p2.x - p1.x);
	var b = p1.y - a*p1.x;
	return {'a': a,'b': b};
}

// Ax + By + C = 0 -> ax -y + b = 0
function distanceFromAPointToALine(p, f) {
	return Math.abs(f.a*p.x -p.y + f.b) / Math.sqrt(f.a*f.a + 1);
}

function displayError(message) {
    document.getElementById('error').innerText = message;
    document.getElementById("error").style.display = "initial";
}

function displaySuccess() {
    document.getElementById("success").style.display = "initial";
}

function go() {
    init();
    
    var rawInput = loadInput();
    
    var transformedInput = transformInput(rawInput);
    
    var maxNbNodes = 149;
    if(document.getElementById('ambit1').checked) {
        maxNbNodes = 59;
    }
    
	var minimizedArray = reduceNumberOfNodes(transformedInput, maxNbNodes);
	displayMinimizedArray(minimizedArray);
	
	var suuntoCode = getSuuntoCode(minimizedArray);
    displaySuuntoCode(suuntoCode);

    displayDetails(transformedInput, minimizedArray);	
	
	displaySuccess();
}

function init() {
    document.getElementById("error").style.display = "none";
    document.getElementById("success").style.display = "none";
    document.getElementById('out').value = "";
    document.getElementById('code').value = "";
    document.getElementById('distance').innerHTML = "-";
    document.getElementById('from').innerHTML = "-";
    document.getElementById('to').innerHTML = "-";	
}

function loadInput() {
    var input = document.getElementById('input').value.trim();
    if(input == "") {
        displayError('"Input" should not be empty');
        return;
    }
    return input;
}

/* 
    Parse data from Excel file
*/ 
function transformInput(input){

	var splits = input.split('\n');
	var output = [];
	
	var previousDistance = 0;
	var firstTimestamp = 0;
	for(var i = 0; i < splits.length; i++){
		
		var b = splits[i].split('\t');
		if(b.length != 3) {
		    displayError("Wrong number of columns at line " + (i+1));
		    return;
		}
		
		var sDate = b[0]; 
		var distance = b[2];
		
		if(previousDistance == distance){
			output.pop();
		}
		previousDistance = distance;
		
		var momentDate = moment(sDate, 'YYYY-MM-DD HH:mm:ss');
		if(isNaN(momentDate)) {
		    displayError("Wrong date format at line " + (i+1));
            return false;
		}
		
		var timestamp = momentDate.unix();
		if(i==0) {
            firstTimestamp = timestamp;
        }
		var time = timestamp - firstTimestamp;
		
		output.push({'x':time, 'y':distance});
	}
	return output;
}

function reduceNumberOfNodes(array, maxNbNodes) {
    var fepsilon = 1;
    var lastValue = array[array.length-1];
        
    while (array.length > maxNbNodes){
        array = RDPalgorithm(array, fepsilon);
        array.push(lastValue);
        fepsilon += 0.01;
    }
    return array;
}

/**
Ramer–Douglas–Peucker algorithm
**/
function RDPalgorithm(listPoints, epsilon){
	var dmax = 0;
	var index = 0;
	var recResults = [];
	var linearFunction = findLinearFunction(listPoints[0], listPoints[listPoints.length-1]);
	for(var i = 1; i < listPoints.length-1; i++) {
		var d = distanceFromAPointToALine(listPoints[i], linearFunction);
		if (d > dmax) {
			index = i;
			dmax = d;
		}
	}
	if (dmax > epsilon) {
		recResults = recResults.concat(RDPalgorithm(listPoints.slice(0, index+1), epsilon));
		recResults = recResults.concat(RDPalgorithm(listPoints.slice(index, listPoints.length), epsilon));

	} else {
		recResults.push(listPoints[0]);
	}
	return recResults;
}


function displayMinimizedArray(tab) {
	var r = "";
	for(var key in tab) {
	    if (tab.hasOwnProperty(key)) {
		    r += tab[key].x+'\t'+tab[key].y+'\n';
        }
	}
	document.getElementById('out').value = r;
}

/**
    
**/
function getSuuntoCode(tab) {
	var sCode = "";
	
	for(var i = 1; i < tab.length; i++) {
	    if(i==1) { // IF 
	        sCode += "if(SUUNTO_DURATION<=" + tab[1].x + "){";
	    } else if (i == tab.length-1) { // ELSE 
	        sCode += "else {";
	    } else { // ELSE IF
	        sCode += "else if(SUUNTO_DURATION <= " + tab[i].x + "){";
	    }
		sCode += getCoeffString(tab[i].y, tab[i].x) + ";}";
	}
	
	return sCode+="RESULT=SUUNTO_DURATION*c-SUUNTO_DISTANCE;";
}

function getCoeffString(distance, time) {
    return "c=" + (Math.round(distance / time *10000)/10000);
}

function displaySuuntoCode(suuntoCode) {
    document.getElementById('code').value = suuntoCode;
}

function displayDetails(transformedInput, minimizedArray) {
    document.getElementById('distance').innerHTML = minimizedArray[minimizedArray.length-1].y;
	document.getElementById('from').innerHTML = transformedInput.length;
	document.getElementById('to').innerHTML = minimizedArray.length;
}
