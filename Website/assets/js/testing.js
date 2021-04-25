// Searchbox


function AbfahrtObj(route, destination, departureTimeIs, type){
    this.route = route;
    this.destination = destination;
    this.departureTimeIs = departureTimeIs;
    this.type = type;
}

var AbfahrtObj001 = new AbfahrtObj("37", "Fü-Hauptbahnhof", "2021-04-24T18:20:09+02:00", "Bus");

console.log(AbfahrtObj001.type);
