/*
Scripts to create flowText (rectangular) in SVG 1.1 UAs
*/

//main function
function textFlow(myText,textToAppend,maxWidth,x,y,ddy,justified, fontsize) {
        //extract and add line breaks for start
		fontsize = typeof fontsize !== 'undefined' ? fontsize : 10;
        var dashArray = new Array();
        var dashFound = true;
        var indexPos = 0;
        var cumulY = 0;
		$('#tool_select').trigger('click'); // so that second time the drawing does not occur on clicking
        while (dashFound == true) {
                var result = myText.indexOf("-",indexPos);
                if (result == -1) {
                        //could not find a dash
                        dashFound = false;
                }
                else {
                        dashArray.push(result);
                        indexPos = result + 1;
                }
        }
        //split the text at all spaces and dashes
        var words = myText.split(/[\s-]/);
        var line = "";
        var dy = 0;
        var curNumChars = 0;
        var computedTextLength = 0;
        var myTextNode;
        var tspanEl;
        var lastLineBreak = 0;
        
        for (i=0;i<words.length;i++) {
                var word = words[i];
                curNumChars += word.length + 1;
                if (computedTextLength > maxWidth || i == 0) {
                        if (computedTextLength > maxWidth) {
                             var tempText = tspanEl.firstChild.nodeValue;
                             tempText = tempText.slice(0,(tempText.length - words[i-1].length - 2)); //the -2 is because we also strip off white space
                             tspanEl.firstChild.nodeValue = tempText;
                             if (justified) {
                               //determine the number of words in this line
                               var nrWords = tempText.split(/\s/).length;
                               computedTextLength = tspanEl.getComputedTextLength();
                               var additionalWordSpacing = (maxWidth - computedTextLength) / (nrWords - 1);
                               tspanEl.setAttributeNS(null,"word-spacing",additionalWordSpacing);
                               //alternatively one could use textLength and lengthAdjust, however, currently this is not too well supported in SVG UA's
                             }
                             //reset line and create a new one because it is already over the limit
                             line = "";
                        } else {
                        	//not over, we concatenate
                            if (i != 0) {
                                line = words[i-1] + " " + line;
                             }
                        }                                                
                        
                        if(checkDashPosition(dashArray,curNumChars-1)) {
                           line = word + "-";
                        }
                        else {
                           line = word + " ";
                        }
                        //tspanEl = document.createElementNS(svgNS,"tspan");
                        tspanEl = document.createElementNS(svgNS,"text");
                        tspanEl.setAttributeNS(null,"x",x);
                        tspanEl.setAttributeNS(null,"text-anchor","middle");
                        tspanEl.setAttributeNS(null,"font-size",fontsize);
                        //tspanEl.setAttributeNS(null,"dy",dy);
                        tspanEl.setAttributeNS(null,"y",y+cumulY);
                        if (line !== "") {
                            myTextNode = document.createTextNode(line);                            	
                        } else {
                            myTextNode = document.createTextNode(word);
                        }                            	
                        tspanEl.appendChild(myTextNode);
                        textToAppend.appendChild(tspanEl);                        	

                        dy = ddy;
                        cumulY += dy;
                 }
                else {
                        if(checkDashPosition(dashArray,curNumChars-1)) {
                                line += word + "-";
                        }
                        else {
                                line += word + " ";
                        }
                        tspanEl.firstChild.nodeValue = line;
                }
                computedTextLength = tspanEl.getComputedTextLength();
                if (i == words.length - 1) {
                  if (computedTextLength > maxWidth) {
                    var tempText = tspanEl.firstChild.nodeValue;
                    tspanEl.firstChild.nodeValue = tempText.slice(0,(tempText.length - words[i].length - 1));
                    tspanEl = document.createElementNS(svgNS,"text");
                    tspanEl.setAttributeNS(null,"x",x);
                    //tspanEl.setAttributeNS(null,"dy",dy);
                    tspanEl.setAttributeNS(null,"y",y+cumulY);
                    tspanEl.setAttributeNS(null,"text-anchor","middle");
                    tspanEl.setAttributeNS(null,"font-size",fontsize);
                    myTextNode = document.createTextNode(words[i]);
                    tspanEl.appendChild(myTextNode);
                    textToAppend.appendChild(tspanEl);
                  }
                
                }
        }
        return cumulY;
}

//this function checks if there should be a dash at the given position, instead of a blank
function checkDashPosition(dashArray,pos) {
        var result = false;
        for (var i=0;i<dashArray.length;i++) {
                if (dashArray[i] == pos) {
                        result = true;
                }
        }
        return result;
}