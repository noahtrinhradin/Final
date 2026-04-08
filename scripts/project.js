$(document).ready(function() {
    var bounds = [[0,0], [905, 1280]];

    var map = L.map("map",{
        crs: L.CRS.Simple,
        maxZoom: 2,
        minZoom: 0.1,//0.017,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    });

    var image = L.imageOverlay("images/Sinnoh.png", bounds).addTo(map);
    map.fitBounds(bounds);
    map.setZoom(0.5);

    //const offcanvas = new bootstrap.Offcanvas("#offcanvas");

    let hotels;
    let rooms;

    const loadJSON = async() => {
        try{
            let res1 = await fetch("public/hotels.json");
            hotels = await res1.json();

            let res2 = await fetch("public/rooms.json");
            rooms = await res2.json();
            console.log(hotels, rooms);
        } catch (e) {
            console.log("Failed loading JSON");
        }
    }

    let markers = {};
    const markerMake = () => {
        for (let hotel of hotels){
            let card = `
                <div class="card m-0 p-0 popupCard">
                    <div class="row g-0">
                        <div class="col-5">
                            <img src="${hotel.image}" class="img-fluid rounded-start cityImg" alt="...">
                        </div>
                        <div class="col-7">
                            <div class="card-body">
                                <h5 class="card-title">${hotel.name}</h5>
                                <p class="card-text">${hotel.description}</p>
                                <p class="card-text">${hotel.rating}⭑ <span class="text-body-secondary">(${hotel.reviews} reviews)</span</p>
                                <p class="card-text"><small class="text-body-secondary">${hotel.city}</small></p>
                                <img src="${hotel.weather}" class="weather" alt="...">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if(hotel.id === 11){
                markers[hotel.id] = L.marker(hotel.coords).addTo(map).bindPopup(card, {
                    offset: [0, 330],
                    className: "Snowpoint"
                });
            }   else if(hotel.id === 12){
                markers[hotel.id] = L.marker(hotel.coords).addTo(map).bindPopup(card, {
                    offset: [-220, 180],
                    className: "Sunyshore"
                });
            }   else{
                markers[hotel.id] = L.marker(hotel.coords).addTo(map).bindPopup(card);
            }
            markers[hotel.id].on("click", function() {
                map.panTo(hotel.coords, {
                    duration: 1
                });
            });
        }
    }

    let carousels = {};
    let carouselInstances = {};
    let hotelCards = {};

    const sidebarMake = () => {

        for (let hotel of hotels) {
            hotelCards[hotel.id] = `
                <div id="hotelCard${hotel.id}">
                    <div class="card mt-2 mb-2 p-0 sidebarCard bg-dark text-white">
                        <img src="${hotel.image}" class="img-fluid card-img-top rounded-start sidebarImg" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">${hotel.name}</h5>
                            <p class="card-text">${hotel.description}</p>
                            <p class="card-text small">${hotel.rating}⭑ (${hotel.reviews} reviews)</p>
                            <img src="${hotel.weather}" class="weather" alt="...">
                        </div>
                    </div>
                    <div id="carouselCard${hotel.id}"></div>
                </div>
            `;
            $("#sidebarCards").append(hotelCards[hotel.id]);
        }

        for (let i = 0; i < hotels.length; i++) {
            let cards = "";
            let roomGroup = rooms.filter(room => room.hotelId === hotels[i].id);
            let active = "active";
            for (let room of roomGroup) {
                let availability = "is not";
                if(room.available) {
                    availability = "is";
                }
                let img = "";
                if(room.type === "Suite") {
                    img = "images/suite.png";
                } else if(room.type === "Double") {
                    img = "images/double.png";
                } else {
                    img = "images/single.png";
                }
                let card = `
                <div class="carousel-item ${active}">
                    <div class="card mt-2 mb-2 pb-3 sidebarCard bg-dark text-white">
                        <img src="${img}" class="img-fluid card-img-top rounded-start roomImg" alt="...">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 d-flex align-items-center mt-1 mb-3">
                                    <h5 class="card-title col-6">${room.name}</h5>
                                    <div class="col-6 text-center">
                                        <button type="button" class="btn btn-secondary col-6">Add to Cart</button>
                                    </div>
                                </div>
                                <p class="card-text col-6">₽${room.pricePerNight} / night</p>
                                <p class="card-text col-6">${room.rating}⭑ (${room.reviews} reviews)</p>
                                <p class="card-text col-6">Beds: ${room.beds}</p>
                                <p class="card-text col-6">Max Guests: ${room.maxGuests}</p>
                                <p class="card-text col-6">Room type: ${room.type}</p>
                                <p class="card-text col-6">Room <b>${availability}</b> available to book</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
                cards += card;
                active = "";
            }

            carousels[i] = `
                <div id="carousel${i}" class="carousel slide">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#carousel${i}" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                        <button type="button" data-bs-target="#carousel${i}" data-bs-slide-to="1" aria-label="Slide 2"></button>
                        <button type="button" data-bs-target="#carousel${i}" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    </div>
                    <div class="carousel-inner">
                        ${cards}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel${i}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carousel${i}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            `;
            $(`#carouselCard${hotels[i].id}`).append(carousels[i]);
            carouselInstances[i] = new bootstrap.Carousel(`#carousel${i}`);
        }
    }

    const cardVisibility = () => {
        for (let hotel of hotels) {
            markers[hotel.id].on("click", function () {
                for(let hotel of hotels) {
                    $(`#hotelCard${hotel.id}`).hide();
                }
                $(`#hotelCard${hotel.id}`).show();
                $("#sidebarCards").scrollTop(0);
            })
        }

        map.on("click", function () {
            for (let hotel of hotels) {
                $(`#hotelCard${hotel.id}`).show();
                $("#sidebarCards").scrollTop(0);
            }
        })
    }

    const loadPage = async() => {
        await loadJSON();
        markerMake();
        sidebarMake();
        cardVisibility();
    }
    loadPage();

})