const fs = require("fs");

function parseFile(path){
    const data = fs.readFileSync(path, { encoding: 'utf8'} );
    const rawLines = breakIntoLines(data); // Split converts string into array

    const rawHeaders = rawLines.shift();
    const headers = parseLine(rawHeaders)
    
    lines = []

    rawLines.forEach(line => {
        if(line == ""){}
        else{
            lines.push(parseLine(line));
        };
    });

    const jsonObjects = lines.map(row => {
        return Object.fromEntries(
            headers.map((header, index) => [header, row[index]])
        );
    });

    return jsonObjects;
}

// Read text in, break into lines handling escaped strings etc
function breakIntoLines(data){
    data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    var lines = []
    var insideQuotes = false;
    var currentString = ""
    var skipQuote = false;
    var skipCharacter = false;
    var currentIndex = 0;

    for(var character of data){
        if(skipCharacter) {  skipCharacter = false; }
        // Is it a quote?
        else if(character == "\""){
            if(skipQuote) { skipQuote = false; }

            //If we're not in quotes, open a quote block and proceed with the next character.
            else if(!insideQuotes){ insideQuotes = true; }
            else{ //We are not in quotes, so we should check if there's a quote immediately after this one.
                if(data[currentIndex + 1] == "\""){
                    // The next character is a quote mark. Treat this as an escaped quote.
                    skipQuote = true;
                }
                else{
                    // this is the end of an escaped string
                    insideQuotes = false
                }
            }
            currentString += character;
        }

        else if((character == "\r" || character == "\n") && !insideQuotes){
            // it's a newline!
            lines.push(currentString);
            currentString = "";
        }
        else{
            currentString += character;
        }
        
        currentIndex += 1;
    }

    // Include the final string if there's anything left
    if (currentString.length > 0 || data.endsWith('\n')) {
        lines.push(currentString);
    }

    return lines;
}

function parseValue(val) {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === '') return null; // or empty string depending on preference

    // Check if it's a valid number
    if (!isNaN(val) && val.trim() !== '') {
        return Number(val); // converts to integer or float automatically
    }

    return val; // remains a string
}

function parseLine(data){
    elements = []
    var inQuotes = false;
    var ignoreNext = false;
    var index = 0;
    var currentElement = "";
    for(var character of data){
        if(ignoreNext){ // Just take the character, don't do anything
            currentElement = character;
        }

        else if(inQuotes){ // we are in a quote block, just mulch through anything but quote marks
            if(character == "\""){
                // Look ahead
                if(data[index + 1] == "\""){ //Escaped quote
                    ignoreNext = true;
                }
                else{ inQuotes = false; } //Ending quote
            }
            else{ //Normal character, just add it
                currentElement += character;
            }
        }

        else if(character == "\""){ // we're ENTERING a quote block - Don't add the quote marks to our string
            inQuotes = true;
        }

        else if(character == ","){ //Comma, so end of field
            const parsedElement = parseValue(currentElement);
            elements.push(parsedElement);
            currentElement = "";
        }

        else{ //Nothing exciting, just push it
            currentElement += character;
        }

        index += 1;
    }
    if(currentElement.length > 0){ elements.push(parseValue(currentElement)); }
    return elements;
}

module.exports = { parseFile }