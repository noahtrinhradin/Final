//Pokemon themed final project, uses a custom image leaflet map instead of the default one
$(document).ready(function() {
    //dimensions of map image
    var bounds = [[0,0], [905, 1280]];
    //at 0 minzoom a bit of grayspace shows up
    var map = L.map("map",{
        crs: L.CRS.Simple,
        maxZoom: 2,
        minZoom: 0.1,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    });

    var image = L.imageOverlay("images/Sinnoh.png", bounds).addTo(map);
    map.fitBounds(bounds);
    map.setZoom(0.1);
    //the custom pokeballs look like shit compared to the default markers
    let pokeballIcon = L.icon({
        iconUrl: "images/pokeball.png",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -20]
    })
    const offcanvas = new bootstrap.Offcanvas("#checkoutOffcanvas");
    const modal = new bootstrap.Modal("#calendarModal");
    const checkoutModal = new bootstrap.Modal("#checkoutModal");

    //json data arrays
    let hotels;
    let rooms;
    //local storage for only rooms that are in the booked array
    let bookedRooms = JSON.parse(localStorage.getItem("bookedRooms")) || [];
    //variable for weather object storage
    let weatherArray = [];

    const loadJSON = async() => {
        try{
            let res1 = await fetch("public/hotels.json");
            hotels = await res1.json();

            let res2 = await fetch("public/rooms.json");
            rooms = await res2.json();
        } catch (e) {
            console.log("Failed loading JSON");
        }
    }
    //i wanted to to a bulk api call but that is a payed option only, the hotels are tied to the real world towns they are based off of
    const loadWeather = async() => {
        const apiKey = "4d5b0c4e3fed4922b0d111013260904";
        try{
            for(let hotel of hotels) {
                let response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${hotel.irlCity}`);
                let data = await response.json();

                weatherArray.push(data);
            }
            console.log("Weather:", weatherArray);
        } catch (e) {
            console.log("Failed loading weather");
        }
    }

    //makes the popups and markers for the map
    let markers = {};
    const markerMake = () => {
        for (let hotel of hotels){
            let degrees = weatherArray[hotel.id-1].current.temp_c;
            let condition = weatherArray[hotel.id-1].current.condition.text.toLowerCase();
            let weatherImg = "images/castform.gif";
            //castform is a pokemon that changes form based on the weather, used it to showcase current weather
            if(condition.includes("sun") || condition.includes("clear")) {
                weatherImg = "images/castform-sunny.gif"
            } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower") || condition.includes("thunder")) {
                weatherImg = "images/castform-rainy.gif";
            } else if (condition.includes("snow") || condition.includes("ice") || condition.includes("blizzard")) {
                weatherImg = "images/castform-snowy.gif";
            }
            
            //Want to show all the castform forms, and these locations are thematically always under a weather condition
            //Static weather
            if(hotel.id === 9) {
                weatherImg = "images/castform-rainy.gif";
            } else if(hotel.id === 11) {
                weatherImg = "images/castform-snowy.gif";
            } else if (hotel.id === 12) {
                weatherImg = "images/castform-sunny.gif";
            }
            //popup cards for markers
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
                                <p class="card-text">${hotel.rating}⭑ <span class="text-body-secondary">(${hotel.reviews} reviews)</span></p>
                                <p class="weatherP text-body-secondary small">${degrees}℃</p><img src="${weatherImg}" class="weather" alt="...">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            //Different offsets for the edges of the map, so they arent facing straight up and clipping the map
            if(hotel.id === 11){
                markers[hotel.id] = L.marker(hotel.coords, {
                    icon: pokeballIcon
                }).addTo(map).bindPopup(card, {
                    offset: [0, 330],
                    className: "Snowpoint"
                });
            }   else if(hotel.id === 12){
                markers[hotel.id] = L.marker(hotel.coords, {
                    icon: pokeballIcon
                }).addTo(map).bindPopup(card, {
                    offset: [-220, 180],
                    className: "Sunyshore"
                });
            }   else{
                markers[hotel.id] = L.marker(hotel.coords, {
                    icon: pokeballIcon
                }).addTo(map).bindPopup(card);
            }
            //pans to wherever you clicked
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
    //Makes the sidebar cards
    const sidebarMake = (sortType) => {

        for (let hotel of hotels) {
            //reused code
            let degrees = weatherArray[hotel.id-1].current.temp_c;
            let condition = weatherArray[hotel.id-1].current.condition.text.toLowerCase();
            let weatherImg = "images/castform.gif";

            if(condition.includes("sun") || condition.includes("clear")) {
                weatherImg = "images/castform-sunny.gif"
            } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower") || condition.includes("thunder")) {
                weatherImg = "images/castform-rainy.gif";
                hotel.rain = true;
            } else if (condition.includes("snow") || condition.includes("ice") || condition.includes("blizzard")) {
                weatherImg = "images/castform-snowy.gif";
            }

            if(hotel.id === 9) {
                weatherImg = "images/castform-rainy.gif";
                hotel.rain = true;
            } else if(hotel.id === 11) {
                weatherImg = "images/castform-snowy.gif";
            } else if (hotel.id === 12) {
                weatherImg = "images/castform-sunny.gif";
            }
            //hotel card
            hotelCards[hotel.id] = `
                <div id="hotelCard${hotel.id}">
                    <div class="card mt-2 mb-2 p-0 sidebarCard">
                        <img src="${hotel.image}" class="img-fluid card-img-top rounded-start sidebarImg" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">${hotel.name}</h5>
                            <p class="card-text">${hotel.description}</p>
                            <p class="card-text small">${hotel.rating}⭑ (${hotel.reviews} reviews)</p>
                            <p class="card-text small text-secondary">${hotel.irlCity}</p>
                            <p class="weatherP text-body-secondary small">${degrees}℃</p><img src="${weatherImg}" class="weather" alt="...">
                        </div>
                    </div>
                    <div id="carouselCard${hotel.id}"></div>
                </div>
            `;
            $("#sidebarCards").append(hotelCards[hotel.id]);
        }

        for (let i = 0; i < hotels.length; i++) {
            let cards = "";
            //filters to only rooms that share id with current hotel id
            let roomGroup = rooms.filter(room => room.hotelId === hotels[i].id);
            //sorting logic, a - b is smallest to largest, vice versa
            if(sortType === "priceA"){
                roomGroup = roomGroup.sort((a, b) => a.pricePerNight - b.pricePerNight);
            } else if(sortType === "priceD") {
                roomGroup = roomGroup.sort((a, b) => b.pricePerNight - a.pricePerNight)
            } else if (sortType === "ratingA") {
                roomGroup = roomGroup.sort((a, b) => a.rating - b.rating);
            } else if (sortType === "ratingD") {
                roomGroup = roomGroup.sort((a, b) => b.rating - a.rating);
            } else if (sortType === "guestsA") {
                roomGroup = roomGroup.sort((a, b) => a.maxGuests - b.maxGuests);
            } else if (sortType === "guestsD") {
                roomGroup = roomGroup.sort((a, b) => b.maxGuests - a.maxGuests);
            }

            let active = "active";
            for (let room of roomGroup) {
                let availability = "is not";
                //disables buttons if unavailable
                let disabled = "disabled";

                if(room.available) {
                    availability = "is";
                    disabled = "";
                }
                let img = "";
                //decides image based off room type, i couldnt find unique images for rooms with beds, even finding 3 was really hard and i wasnt gonna boot up a rom just to get screenshots
                if(room.type === "Suite") {
                    img = "images/suite.png";
                } else if(room.type === "Double") {
                    img = "images/double.png";
                } else {
                    img = "images/single.png";
                }
                //carousel display for rooms
               let card =
                    `<div class="carousel-item ${active}">
                        <div class="card mt-2 mb-2 pb-3 sidebarCard">
                            <img src="${img}" class="img-fluid card-img-top rounded-start roomImg" alt="...">
                            <div class="card-body">
                                <div class="row g-2"> <div class="col-12 col-md-6 align-self-center">
                                        <h5 class="card-title m-0">${room.name}</h5>
                                    </div>
                                    <div class="col-12 col-md-6 text-center text-md-end">
                                        <button type="button" id="roombtn${room.id}" class="btn btn-secondary roombtns w-75 d-block mx-auto" ${disabled}>Add to Cart</button>
                                    </div> 

                                    <p class="card-text col-12 col-md-6 mb-1">₽${room.pricePerNight} / night</p>
                                    <p class="card-text col-12 col-md-6 mb-1">${room.rating}⭑ (${room.reviews} reviews)</p>
                                    <p class="card-text col-12 col-md-6 mb-1">Beds: ${room.beds}</p>
                                    <p class="card-text col-12 col-md-6 mb-1">Max Guests: ${room.maxGuests}</p>
                                    <p class="card-text col-12 col-md-6 mb-1">Room type: ${room.type}</p>
                                    <p class="card-text col-12 col-md-6 mb-1">Room <b>${availability}</b> available to book</p>
                                </div>
                            </div>
                        </div>
                    </div>`;

                cards += card;
                active = "";
            }

            carousels[i] = 
                `<div id="carousel${i}" class="carousel slide">
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
                </div>`;
            //Attaches the room cards to the hotel cards, so they follow the same visibility rules
            $(`#carouselCard${hotels[i].id}`).append(carousels[i]);
            carouselInstances[i] = new bootstrap.Carousel(`#carousel${i}`);
        }
    }
    //hides every sidebar card when you click the marker on map, then shows the one you selected
    //exit the limited view by clicking anywhere on map
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

    let curRoom = {};
    let finished;
    let exists = false;
    //remakeSidebar during sorting, destroys the sidebar then remakes with different logic depending on what button was pressed, 
    //clicking the options toggle between ascending and descending
    const remakeSidebar = (sortType) => {
        $("#sidebarCards").html("");
        sidebarMake(sortType);
        cardVisibility();
        btnLogic();
    }

    $("#sortPriceA").click(function () {
        remakeSidebar("priceA");
        $("#sortPriceA").hide();
        $("#sortPriceD").show();
    });

    $("#sortRatingA").click(function() {
        remakeSidebar("ratingA");
        $("#sortRatingA").hide();
        $("#sortRatingD").show();
    });

    $("#sortGuestsA").click(function() {
        remakeSidebar("guestsA");
        $("#sortGuestsA").hide();
        $("#sortGuestsD").show();
    });

    $("#sortPriceD").click(function () {
        remakeSidebar("priceD");
        $("#sortPriceD").hide();
        $("#sortPriceA").show();
    });

    $("#sortRatingD").click(function() {
        remakeSidebar("ratingD");
        $("#sortRatingD").hide();
        $("#sortRatingA").show();
    });

    $("#sortGuestsD").click(function() {
        remakeSidebar("guestsD");
        $("#sortGuestsD").hide();
        $("#sortGuestsA").show();
    });

//event listeners for the buttons on the room cards to pull up a modal form asking for the days youre staying and number of guests
    const btnLogic = () => {
        for(let room of rooms){
            $(`#roombtn${room.id}`).on("click", function() {
                $("#validate").html("");
                $("#modalLabel").html(`Booking: ${room.name}`);
                curRoom = room;
                //bookedRooms is the array for the cart, its checking if ive already added it to the cart, so it can either update the value or add a new value to the cart
                let existingRoom = bookedRooms.find(room => room.room.id === curRoom.id);

                if(existingRoom) {
                    $("#dateIn").val(existingRoom.in);
                    $("#dateOut").val(existingRoom.out);
                    exists = true;
                } else {
                    $("#dateIn").val("");
                    $("#dateOut").val("");
                    exists = false;
                }
                $("#groupSizeInput").attr("max", room.maxGuests);
                modal.show();
            });
        }
    }

    const modalBtns = () => {
        let dIn = $("#dateIn").val();
        let dOut = $("#dateOut").val()
        finished = false;

        if (dIn === "" || dOut === "") {
            $("#validate").html("Please fill out both dates.");
            return;
        }
        if (dIn >= dOut) {
            $("#validate").html("Please enter valid dates.");
            return;
        } else {
            $("#validate").html("");
        }
        //stack overflow comparing dates, when you subtract 2 date objects it returns a number in milliseconds, so you have to convert to days
        let dateIn = new Date(dIn);
        let dateOut = new Date(dOut);
        let utc1 = Date.UTC(dateIn.getFullYear(), dateIn.getMonth(), dateIn.getDate());
        let utc2 = Date.UTC(dateOut.getFullYear(), dateOut.getMonth(), dateOut.getDate());

        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        let dayDiff = Math.floor((utc2 - utc1) / _MS_PER_DAY);
        let groupSize = $("#groupSizeInput").val();
        let totalPrice = dayDiff * curRoom.pricePerNight * groupSize;
        //new room object for booked rooms, with some payment info
        let roomBook = {
            room: curRoom,
            in: dIn,
            out: dOut,
            daysDiff: dayDiff,
            price: totalPrice,
            groupSize: groupSize
        }
        //updates or adds new room
        if(exists) {
            let updateRoom = bookedRooms.findIndex(room => room.room.id === curRoom.id);
            bookedRooms[updateRoom] = roomBook;
        } else {
            bookedRooms.push(roomBook);
        }
        //update local storage with bookedRooms, local storage can only hold strings
        localStorage.setItem("bookedRooms", JSON.stringify(bookedRooms));
        modal.hide();
        finished = true;
    }
    //saves room to bookedRooms on modal button press
    $(`#modalbtnBack`).on("click", function() {
        modalBtns();
    });

    $(`#modalbtnCheckout`).on("click", function() {
        modalBtns();
        if (finished) {
            offcanvas.show();
        }
    });

    let regexArray = [];

    const loadCart = () => {
        const offcanvasLoad= () => {
            for (let [regex, input] of regexArray) {
                input.removeClass("is-invalid");
                input.removeClass("is-valid");
            }

            let checkoutItems = "";
            let subtotal = 0;

            $("#checkoutList").empty();
            for(let room of bookedRooms) {
                let nights = "nights";
                let guests = "guests";
                if (room.daysDiff === 1) {
                    nights = "night";
                    guests = "guest";
                }
                let rainy = "";
                let rainTax = 0;
                //rain property in hotel objects just for this. all are false and get turned true when raining
                let parentHotel = hotels.find(h => h.id === room.room.hotelId);

                if(parentHotel.rain){
                    rainy = `<br>- <span class="small">5% rain fee</span>`;
                    rainTax = 0.05 * room.price;
                }
                let roomDeal = "";
                let discount = 0;
                if(room.daysDiff >= 3) {
                    roomDeal = `<br>- <span class="small">10% extended trip discount`;
                    discount = 0.1 * room.price;
                }
                subtotal += room.price + rainTax + discount;
                checkoutItems += `<li id="li${room.room.id}" class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <p>${room.room.name}:
                            <br>- <span class="small">₽${room.room.pricePerNight} x ${room.daysDiff} ${nights} x ${room.groupSize} ${guests}</span>
                            ${rainy}${roomDeal}
                            <br>- Total: ₽${Math.round(room.price + rainTax - discount)}
                        </p>
                        <i id="trashbtn${room.room.id}" class="bi bi-trash"></i>
                    </div>
                </li>`;
            }

            $("#subtotal").html(`Subtotal: ₽${Math.round(subtotal)}`);
            $("#tax").html(`Tax: ₽${Math.round(subtotal*0.12)} (12%)`);
            $("#grandTotal").html(`Grand Total: ₽${Math.round(subtotal*1.12)}`);
            $("#checkoutList").append(checkoutItems);

            for (let room of bookedRooms) {
                //deleted room associated with trash button from bookedRoom array
                $(`#trashbtn${room.room.id}`).on("click", function () {
                    let roomid = room.room.id;
                    bookedRooms = bookedRooms.filter(bookedRoom => bookedRoom.room.id !== roomid);
                    localStorage.setItem("bookedRooms", JSON.stringify(bookedRooms));
                    offcanvasLoad();
                });
            }
        }
        //same thing
        $("#emptyCartBtn").click(() => {
           bookedRooms = [];
           localStorage.removeItem("bookedRooms");
           offcanvasLoad();
        });

        $("#checkoutOffcanvas").on("show.bs.offcanvas", function () {
            offcanvasLoad();
        });
    };

    let valid;
//regex
    const regex = () => {
        const nameReg = /^[a-zA-Z-]+$/;
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneReg = /^\d{3}-\d{3}-\d{4}$/;
        const cardReg = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
        const expiryReg = /^(0[1-9]|1[0-2]) \/ (2[6-9]|3[0-9])$/;
        const ccvReg = /^\d{3}$/;

        const fnameIn = $("#fname");
        const lnameIn = $("#lname"); 
        const emailIn = $("#email");
        const phoneIn = $("#phone");
        const cardIn = $("#card");
        const expiryIn = $("#expiry");
        const ccvIn = $("#ccv");

        regexArray = [ [nameReg, fnameIn] ,[nameReg, lnameIn], [emailReg, emailIn], [phoneReg, phoneIn], [cardReg, cardIn], [expiryReg, expiryIn], [ccvReg, ccvIn] ];

        for (let [regex, input] of regexArray) {
            if (regex.test(input.val())) {
                input.addClass("is-valid");
                input.removeClass("is-invalid");
            } else {
                input.addClass("is-invalid");
                input.removeClass("is-valid");
            }
        }

        valid = regexArray.every(([regex, input]) => regex.test(input.val()));
    }
//from previous labs, disables non integers, and splices hyphens where needed
    $("#phone").on("input", (e) => {
        let input = e.target.value;
        input = input.replace(/\D/g, "");

        if (input.length > 6) {
            input = input.slice(0,3) + "-" + input.slice(3,6) + "-" + input.slice(6);
        } else if (input.length > 3) {
            input = input.slice(0,3) + "-" + input.slice(3);
        }

        e.target.value = input;
    });

    $("#card").on("input", (e) => {
        let input = e.target.value;
        input = input.replace(/\D/g, "");

        if(input.length > 12 ) {
            input = input.slice(0,4) + "-" + input.slice(4, 8) + "-" + input.slice(8, 12) + "-" + input.slice(12);
        }
        else if (input.length > 8) {
            input = input.slice(0,4) + "-" + input.slice(4, 8) + "-" + input.slice(8);
        }
        else if(input.length > 4){
            input = input.slice(0,4) + "-" + input.slice(4);
        }
        e.target.value = input;
    });

    $("#expiry").on("input", (e) => {
        let input = e.target.value;
        input = input.replace(/\D/g, "");

        if(input.length > 2) {
            input = input.slice(0,2) + " / " + input.slice(2);
        }
        e.target.value = input;
    });

    $("#ccv").on("input", (e) => {
        let input = e.target.value;
        input = input.replace(/\D/g, "");
        e.target.value = input;
    });

//moves to checkout if all form inputs are valid
    $("#payBtn").click(function() {
        regex();
        if(valid) {
            for(let room of bookedRooms) {
                room.room.available = false;
                remakeSidebar();
            }
            checkoutModal.show();
        }
    });

    $("#checkoutModal").on("show.bs.modal", function (){
        let checkoutItems = "";
        let subtotal = 0;

        let name = $("#fname").val();
        let email = $("#email").val();
        $("#modalMsg").html(`Thank you <b>${name}</b>,<br> your receipt will be emailed to <b>${email}</b> shortly!`);
       //receipt is same as from offcanvas
        for(let room of bookedRooms) {
            let nights = "nights";
            let guests = "guests";
            if (room.daysDiff === 1) {
                nights = "night";
                guests = "guest";
            }
            let rainy = "";
            let rainTax = 0;
            let parentHotel = hotels.find(h => h.id === room.room.hotelId);

            if(parentHotel.rain){
                rainy = `<br>- <span class="small">5% rain fee</span>`;
                rainTax = 0.05 * room.price;
            }
            let roomDeal = "";
            let discount = 0;
            if(room.daysDiff >= 3) {
                roomDeal = `<br>- <span class="small">10% extended trip discount`;
                discount = 0.1 * room.price;
            }
            subtotal += room.price + rainTax + discount;
            checkoutItems += `<li id="li${room.room.id}" class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <p>${room.room.name}:
                            <br>- <span class="small">₽${room.room.pricePerNight} x ${room.daysDiff} ${nights} x ${room.groupSize} ${guests}</span>
                            ${rainy}${roomDeal}
                            <br>- Total: ₽${Math.round(room.price - discount + rainTax)}
                            </span>
                        </p>
                    </div>
                </li>`;
        }
        $("#subtotalModal").html(`Subtotal: ₽${Math.round(subtotal)}`);
        $("#taxModal").html(`Tax: ₽${Math.round(subtotal*0.12)} (12%)`);
        $("#grandTotalModal").html(`Grand Total: ₽${Math.round(subtotal*1.12)}`);
        $("#checkoutListModal").html(checkoutItems);
    });
//closes the popups and clears cart
    $("#checkoutModalBtn").click(function () {
        bookedRooms = [];
        localStorage.removeItem("bookedRooms");
        offcanvas.hide();
        checkoutModal.hide();
    });
    //needed to wait for json to load for marker and sidebar, but forgot why i had this function after a while so called all my functions here
    const loadPage = async () => {
        await loadJSON();
        await loadWeather();
        markerMake();
        sidebarMake();
        cardVisibility();
        btnLogic();
        loadCart();
    }

    loadPage();

})