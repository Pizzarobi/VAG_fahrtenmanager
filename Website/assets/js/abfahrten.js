const searchInput = document.getElementById('search');
const searchWrapper = document.querySelector('.wrapperSearch');
const resultsWrapper = document.getElementById('resultsWrapper');
const currentStation = document.getElementById('currentStation');
const currentHaltID = document.getElementById('currentHaltID');
const searchButton = document.getElementById('searchButton');


var haltname;
var haltID;

var haltnames = [];
var haltIDs = [];
var abfahrten = new Array();

// Search
searchInput.addEventListener("keyup", e => {
    if(e.key == "Enter"){
        clickHandler(haltnames[0]);
    }

    let input = searchInput.value;
    if (input.length >= 4) {
        searchHaltName(input);
    }else {
        searchWrapper.classList.remove('show');
    }
});

searchButton.addEventListener("click", () =>{
    clickHandler(haltnames[0]);
});

const searchHaltName = async searchText => {
    const res = await fetch('https://start.vag.de/dm/api/v1/haltestellen/VAG?name='+ searchInput.value);
    const haltnamesraw = await res.json();
    //console.log(HaltIDs.Haltestellen);

    haltnames = [];
    haltIDs = [];
    for(var k in haltnamesraw.Haltestellen){
        //console.log(haltnamesraw.Haltestellen[k].VAGKennung);
        haltnames[k] = [haltnamesraw.Haltestellen[k].Haltestellenname];
        haltIDs[k] = [haltnamesraw.Haltestellen[k].VAGKennung];
    }
    
    //console.log(haltnames);
    
    if (!haltnames.length) {
        return searchWrapper.classList.remove('show');
    }

    const content = haltnames
    .map((item) => {
    return `<li id="result">${item}</li>`;
    })
    .join('');

    searchWrapper.classList.add('show');
    resultsWrapper.innerHTML = `<ul>${content}</ul>`;
}

resultsWrapper.addEventListener("click", searchClick);
resultsWrapper.addEventListener("touchend", searchClick);//Janky stuff for phone

function searchClick(event){
    //console.info(event);
    if(event.target.id == "result"){
        clickHandler(event.target.innerHTML);
    }
}

function clickHandler(busstop){
    haltname = busstop;
    searchWrapper.classList.remove('show');
    searchInput.value = "";
    currentStation.innerHTML = haltname;
    getHaltID();
    getAbfahrten();
}

// Get HaltID Pretty janky cos one extra get that i probably dont need
function getHaltID(){
    for(var k in haltnames){
        if(!found && (haltnames[k] == haltname)){
            haltID = haltIDs[k];
            currentHaltID.innerHTML = "ID: " + haltID;
            var found = true;
        }
    }
}

const getAbfahrten = async searchText => {
    const res = await fetch('https://start.vag.de/dm/api/v1/abfahrten/VAG/'+ haltID);
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

function clearAbfahrten(){
    abfahrten.length = new Array();
    const elements = document.getElementsByClassName('opnvcard');
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    } 
}

function renderAbfahrten(){
    for(var k in abfahrten){
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
        var route = abfahrten[k].route;

        var departureIn
        if(abfahrten[k].departureIn == 0)
            departureIn = "Gleich";
        else
            departureIn = "in " + abfahrten[k].departureIn + " min";
        
        var destination = abfahrten[k].destination;
        var tooltip = abfahrten[k].tripnbr;

        var opnvCardTemplate = [
            '<div id="opnvCard" class="card text-center d-flex opnvcard">',
                '<div class="card-body" style="padding: 10px;margin: 0px;padding-right: 10px;">',
                    '<div class="row" style="margin: 5px;">',
                        '<div class="w-100 d-flex"></div>',
                        '<div class="col-auto" style="padding: 0px;width: 10%;"><i class="material-icons d-flex justify-content-center align-items-start" data-toggle="tooltip" title="'+ tooltip +'" data-bss-tooltip="" style="font-size: 40px;">' + icon + '</i>',
                            '<p style="width: auto;font-size: 25px;margin: 0px;">'+ route + '</p>',
                        '</div>',
                        '<div class="col-3 d-flex justify-content-center align-items-center" style="padding: 0px;max-width: 800px;">',
                            '<p class="departureIn text-center d-flex" style="font-size: 25px;margin: auto;padding: 0px;">' + departureIn + '</p>',
                        '</div>',
                        '<div class="col d-flex justify-content-center align-items-center" style="padding: 0px;font-size: 20px;">',
                            '<p class="destination text-center" style="margin: 0px;margin-bottom: 0px;padding: 0px;font-size: 25px;">' + destination + '</p>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join("\n");
    
        $("body").append(opnvCardTemplate);
    }
}

//AbfahrtObject stuff
function abfahrtObj(route, destination, departureIn, type, tripnbr){
    this.route = route;
    this.destination = destination;
    this.departureIn = departureIn;
    this.type = type;
    this.tripnbr = tripnbr;
}

// resultsWrapper.addEventListener("click", event => {
//     searchWrapper.classList.remove('show');
//     haltname = event.originalTarget.innerHTML;
//     searchInput.value = haltname;
// });

// Fahrtenanzeige

// var AbfahrtObj001 = new AbfahrtObj("37", "Fü-Hauptbahnhof", "2021-04-24T18:20:09+02:00", "Bus");

// console.log(AbfahrtObj001.type);