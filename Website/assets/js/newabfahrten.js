// New better Version of abfahrten.js

const searchInput = document.getElementById('search');
const searchWrapper = document.querySelector('.wrapperSearch');
const resultsWrapper = document.getElementById('resultsWrapper');
const currentStation = document.getElementById('currentStation');
const currentHaltID = document.getElementById('currentHaltID');
const searchButton = document.getElementById('searchButton');

var haltinfo = ["Willkommen", 0];
var abfahrten = new Array();

function resetArray(){
    haltinfo = ["Willkommen", 0];
}

// Search Input Events and removing autosearch box
searchInput.addEventListener("keyup", e => {
    if(e.key == "Enter"){
        clickHandler(haltinfo[0][0]);
    }
    let input = searchInput.value;
    if (input.length >= 4) {
        searchHaltNameID(input);
        doAutocomplete();
    }else {
        searchWrapper.classList.remove('show');
    }
});

// Searchbutton Eventlistener Looks for first Result
searchButton.addEventListener("click", clickHandler(haltinfo[0][0]));

// Looks for HaltName and ID from sInput Variable /// new implementation of HaltName and HaltID lookup
const searchHaltNameID = async function search(sInput){
    //fetching haltname
    const res = await fetch('https://start.vag.de/dm/api/v1/haltestellen/VAG?name='+ sInput);
    const haltnamesraw = await res.json();
    //Clearing haltinfo Array and adding new Objects
    console.log(haltinfo); // HJAHJAHAHHAJKHLkjhsakljfhalkusehflaksjdhfklasjdhf
    resetArray();
    for(var k in haltnamesraw.Haltestellen){
        haltinfo[k][0] = [haltnamesraw.Haltestellen[k].Haltestellenname];
        haltinfo[k][1] = [haltnamesraw.Haltestellen[k].VAGKennung];
    }
    //If no result
    if(!haltinfo.length)
        haltinfo[0][0] = "Kein Ergebnis"; //Maybe Help Page for no Result?

    console.log(haltinfo);
}

//Render Autocomplete
function doAutocomplete(){
    let content = haltinfo.map((item) => {
    return `<li id="result">${item}</li>`;
    })
    .join('');
    resultsWrapper.innerHTML = `<ul>${content}</ul>`;
    searchWrapper.classList.add('show');
}

//Search Event handling
resultsWrapper.addEventListener("click", searchClick);
resultsWrapper.addEventListener("touchend", searchClick); //Janky stuff for phone, needs to detect touchcursor change to avoid mislick
//Checks for valid Click
function searchClick(event){
    if(event.target.id == "result"){
        setCurrentHalt(event.target.innerHTML);
        clickHandler(event.target.innerHTML);//Check 2nd Line comment in clickHandler
    }
}

//Handles the click and calls setCurrentHalt and getAbfahrten
//Should be able to allways use currentHalt/Haltinfo[0]
function clickHandler(busstop){
    searchWrapper.classList.remove('show');
    searchInput.value = "";
    currentStation.innerHTML = busstop;
    //setCurrentHalt(busstop); unnecessary technically gotta test
    getAbfahrten();
}

//sets haltinfo[0] to the current Busstop / Removes the need for some global Variables from old implementation
function setCurrentHalt(busstop){
    if (haltinfo[0][0] != busstop){
        for(var k in haltinfo){
            if(!found && (haltinfo[k] == busstop)){
                haltinfo[0][0] = haltinfo[k][0];
                var found = true;
            }
        }
    }
}

//gets Departures from VAG API and pushes them to abfahrten array // Should add Fahrtplaner in here cause its allmost the same
const getAbfahrten = async  getAbfahrtenasync => {
    const res = await fetch('https://start.vag.de/dm/api/v1/abfahrten/VAG/'+ haltinfo[0][1]);
    const abfahrtenraw = await res.json();
    clearAbfahrten();

    for(var k in abfahrtenraw.Abfahrten){
        var route = abfahrtenraw.Abfahrten[k].Linienname;
        var destination = abfahrtenraw.Abfahrten[k].Richtungstext;
        var abfahrtsZeitIst = new Date(abfahrtenraw.Abfahrten[k].AbfahrtszeitIst);
        var departureIn = Math.floor((abfahrtsZeitIst-Date.now())/1000/60);
        var type = abfahrtenraw.Abfahrten[k].Produkt;
        var tripnbr = abfahrtenraw.Abfahrten[k].Fahrtnummer;

        abfahrten.push(new abfahrtObj(route,destination,departureIn,type,tripnbr));
    }
    renderAbfahrten();
}

//clears the page from departure elements
function clearAbfahrten(){
    abfahrten.length = 0;
    const elements = document.getElementsByClassName('opnvcard');
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    } 
}

//Adds departure Elements to the Page
function renderAbfahrten(){
    for(var k in abfahrten){
        //chooses correct Item Type
        var icon;
        switch(abfahrten[k].type){
            case "Bus":
                icon = "directions_bus"
                break;
            case "Tram":
                icon = "tram";
                break;
            case "UBahn":
                icon = "directions_subway"
                break;
            default:
                icon = "tram";
        }
        //Formats departure String
        if(abfahrten[k].departureIn == 0)
            var departureIn = "Gleich";
        else
            var departureIn = "in " + abfahrten[k].departureIn + " min";
        //opnvCard HTML
        var opnvCardTemplate = [
            '<div id="opnvCard" class="card text-center d-flex opnvcard">',
                '<div class="card-body" style="padding: 10px;margin: 0px;padding-right: 10px;">',
                    '<div class="row" style="margin: 5px;">',
                        '<div class="w-100 d-flex"></div>',
                        '<div id="opnvicon" class="col-auto" style="padding: 0px;width: 10%;"><i id="opnvicon" class="material-icons d-flex justify-content-center align-items-start" data-toggle="tooltip" info="'+ abfahrten[k].tripnbr + '" title="Klicken fuer mehr Info" data-bss-tooltip="" style="font-size: 40px;">' + icon + '</i>',
                            '<p style="width: auto;font-size: 25px;margin: 0px;">'+ abfahrten[k].route + '</p>',
                        '</div>',
                        '<div class="col-3 d-flex justify-content-center align-items-center" style="padding: 0px;max-width: 800px;">',
                            '<p class="departureIn text-center d-flex" style="font-size: 25px;margin: auto;padding: 0px;">' + departureIn + '</p>',
                        '</div>',
                        '<div class="col d-flex justify-content-center align-items-center" style="padding: 0px;font-size: 20px;">',
                            '<p class="destination text-center" style="margin: 0px;margin-bottom: 0px;padding: 0px;font-size: 25px;">' + abfahrten[k].destination + '</p>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join("\n");
    
        $("body").append(opnvCardTemplate);
    }
    //Assigns opnvicons for later Use
    opnvicons = document.getElementsByClassName('.opnvicon');
}








//AbfahrtObject for abfahrten Array
function abfahrtObj(route, destination, departureIn, type, tripnbr){
    this.route = route;
    this.destination = destination;
    this.departureIn = departureIn;
    this.type = type;
    this.tripnbr = tripnbr;
}