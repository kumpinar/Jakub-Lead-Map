
mapboxgl.accessToken = 'pk.eyJ1IjoieWFycmFyYW5nZXMiLCJhIjoiY2tydHpnM2pwOXdldzJubDM1b2dvcm15cCJ9.sAkVnbCzwrVLLRi7xxiHnA';
let mondayToken = localStorage.getItem('monday-token');
let selectedCountry;
let selectedIndustry;
let selectedLeads;
let regionsGeojson;
let matchedClients;
let matchedRegionName;
let selectedLead;
let groupsOfSelectedBoard;
let columnsOfSelectedBoard;
const CLIENT_STATUS_SENT = 1;
const LEAD_STATUS_SENT = 3;
let clients;

const clientsModal = new bootstrap.Modal('#clientsModal');

// Create a new map.
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [
        21.00489285129794,
        52.212130350909234
    ],
    zoom: 4
});

const popup = new mapboxgl.Popup({
    closeButton: false,
    className: 'clients-popup'
});

map.on('load', () => {

    toggleSidebar('left');

    map.addSource('regions', {
        'type': 'geojson',
        'data': null
    });

    map.addLayer({
        'id': 'regions-layer',
        'type': 'fill',
        'source': 'regions',
        'paint': {
            'fill-color': 'rgba(200, 100, 240, 0.2)',
            'fill-outline-color': 'rgba(200, 100, 240, 1)'
        }
    });

    map.addLayer(
        {
            'id': 'regions-layer-highlighted',
            'type': 'fill',
            'source': 'regions',
            'paint': {
                'fill-color': 'rgba(200, 100, 240, 0.5)',
                'fill-outline-color': 'rgba(200, 100, 240, 1)'
            },
            'filter': ['in', 'name', '']
        }
    );

    map.on('mousemove', 'regions-layer', (e) => {
        const regionName = e.features[0].properties.name;
        map.setFilter('regions-layer-highlighted', [
            'in',
            'name',
            regionName
        ]);

        if (clients) {
            let popupContent ='';

            e.features.forEach(regionFeature => {

                //find clients by region name
                popupContent += 'Clients in Region: ' + regionFeature.properties.name;
                popupContent += '<ul>';
                    
                clients.filter(cl => 
                                        cl.regions.includes(regionFeature.properties.name.trim().toLowerCase())
                                    ||  cl.regions.includes(selectedCountry.name_pl.toLowerCase()) 
                                    ||  cl.regions.includes(selectedCountry.name.toLowerCase())
                            ).forEach(cn => {
                    popupContent += `<li>
                                        ${cn.name} 
                                        ${checkClientNameWithBoardColumn(cn.name)} 
                                        <div client-name="${encodeURIComponent(cn.name)}" class="spinner-border client-total-leads-spinner" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div> 
                                        <span client-name="${encodeURIComponent(cn.name)}" class="badge rounded-pill text-bg-info lead-count"></span>
                                    </li>`;
                });
                popupContent += '</ul>';
                
            });

            const bufferedClients = map.queryRenderedFeatures(e.point,{layers: ['client-buffers-layer']});

            if(bufferedClients && bufferedClients.length > 0){
                popupContent += 'Clients in Buffered Area: ';
                popupContent += '<br><ul>';
                bufferedClients.forEach(cn => {
                    popupContent += `
                    <li>
                        ${cn.properties.name} 
                        ${checkClientNameWithBoardColumn(cn.properties.name)}  
                        <div client-name="${encodeURIComponent(cn.properties.name)}" class="spinner-border client-total-leads-spinner" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div> 
                        <span client-name="${encodeURIComponent(cn.properties.name)}"  class="badge rounded-pill text-bg-info lead-count"></span>
                    </li>`;
                });
                popupContent += '</ul>';
            }

            popup
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
            populateClientTotalLeadsOnMapPopup();
        }

    });

    map.on('mouseleave', 'regions-layer', () => {
        popup.remove();
        map.setFilter('regions-layer-highlighted', ['in', 'name', '']);
    });


    map.addSource('client-buffers', {
        'type': 'geojson',
        'data': null
    });

    map.addLayer({
        'id': 'client-buffers-layer',
        'type': 'fill',
        'source': 'client-buffers',
        'paint': {
            'fill-color': 'rgba(100, 200, 240, 0.2)',
            'fill-outline-color': 'rgba(26, 26, 26, 1)'
        }
    });

    map.addLayer(
        {
            'id': 'client-buffers-layer-highlighted',
            'type': 'fill',
            'source': 'client-buffers',
            'paint': {
                'fill-color': 'rgba(100, 200, 240, 0.5)',
                'fill-outline-color': 'rgba(26, 26, 26, 1)'
            },
            'filter': ['in', 'name', '']
        }
    );



    map.on('mousemove', 'client-buffers-layer', (e) => {
        map.setFilter('client-buffers-layer-highlighted', [
            'in',
            'name',
            e.features[0].properties.name
        ]);

    });

    map.on('mouseleave', 'client-buffers-layer', () => {
        map.setFilter('client-buffers-layer-highlighted', ['in', 'name', '']);
    });

    map.addSource('labels', {
        'type': 'geojson',
        'data': null
    });

    map.addLayer({
        'id': 'labels-icon-layer',
        'source': 'labels',
        'type': 'circle',
        'paint': {
            'circle-radius': 6,
            'circle-color': '#B42222'
        }
    });

    map.addLayer({
        'id': 'labels-layer',
        'type': 'symbol',
        'source': 'labels',
        'layout': {
            'text-field': ['get', 'name'],
            'text-size': 14,
            'text-anchor': 'center',
            'text-offset': [0, 1]
        }
    });

    map.addSource('leads', {
        'type': 'geojson',
        'data': null,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'lead-clusters',
        type: 'circle',
        source: 'leads',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: 'lead-cluster-count',
        type: 'symbol',
        source: 'leads',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // inspect a cluster on click
    map.on('click', 'lead-clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['lead-clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('leads').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });




    map.loadImage('markers/cb0d0c.png', (error, image) => {
        if (error) throw error;
        map.addImage('lead-marker', image);

        map.addLayer({
            'id': 'leads-layer',
            'source': 'leads',
            "type": "symbol",
            "filter": ['!', ['has', 'point_count']],
            "layout": {
                "icon-image": "lead-marker",
                "icon-allow-overlap": true,
                'text-field': ['get', 'name'],
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
            }
        });


        map.on('mouseenter', 'leads-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'leads-layer', () => {
            map.getCanvas().style.cursor = '';
        });
        map.on('click', 'leads-layer', (e) => {
            matchedRegionNames = [];
            matchedClients = [];
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['leads-layer']
            });
            //clear the fields
            $('#tdSelectedLead').html('');
            $('#tdRegionOfSelectedLead').html('');
            $('#tdLeadNotes').html('');
            
            // find region of lead
            selectedLead = features[0];
            turf.featureEach(regionsGeojson, function (currentFeature, featureIndex) {
                if (turf.booleanWithin(selectedLead, currentFeature)) {
                    matchedRegionNames.push(currentFeature.properties.name);
                }
            });
            // find matched clients by region
            if (matchedRegionNames.length > 0) {
                if (clients && clients.length > 0) {
                    matchedRegionNames.forEach(matchedRegionName => {
                        let mr = clients.filter(c => c.regions.includes(matchedRegionName.trim().toLowerCase()) || c.regions.includes(selectedCountry.name_pl.toLowerCase()) || c.regions.includes(selectedCountry.name.toLowerCase()) ); 
                        matchedClients = matchedClients.concat(mr); 
                    });
                }

                map.querySourceFeatures('client-buffers').forEach(currentFeature => {
                    if (turf.booleanWithin(selectedLead, currentFeature)) {
                        const bufferedToAdd = clients.find(cl=> cl.name == currentFeature.properties.name);
                        if(bufferedToAdd){
                            let isAdded = matchedClients.filter(mc => mc.name==bufferedToAdd.name).length;
                            if(isAdded == 0) matchedClients.push( bufferedToAdd);
                        }
                    }
                });


                $('#tdSelectedLead').html(features[0].properties.name);
                $('#tdRegionOfSelectedLead').html(matchedRegionNames.join(', '));
                $('#tdLeadNotes').html(features[0].properties.note?.trim('"'));
            }




            clientsModal.show();
        });

    });

    modalListenersSetup();

    // setupClientLayers(); // no need for now

    if (mondayToken == null) {
        showModalToSetToken();
    } else {
        checkMondayToken();
    }
});

const monday = window.mondaySdk();



function toggleSidebar(id) {
    const elem = document.getElementById(id);
    const collapsed = elem.classList.toggle('collapsed');
    const padding = {};
    padding[id] = collapsed ? 0 : 300;
    const sidebarArrow = document.getElementById('sidebar-arrow');
    sidebarArrow.innerHTML = collapsed ? '&rarr;' : '&larr;';
    map.easeTo({
        padding: padding,
        duration: 1000
    });
}

function showModalToSetToken() {
    bootbox.prompt({
        title: 'Please enter your token!',
        message: '<p>Monday CRM -> Profile Logo -> Developers -> My access tokens -> Show/Copy </p>',
        callback: function (result) {
            mondayToken = result;
            localStorage.setItem('monday-token', mondayToken);
            checkMondayToken();
        }
    });
}

function listCountries() {
    $('#countries').empty();
    let countryNames = countries.map(c => {
        let countryItem = $(`<li>${c.name}</li>`);
        $('#countries').append(countryItem);
        countryItem.click(() => {

            map.getSource('regions').setData(c.regionBordersUrl);
            if(c.regionLabelsUrl && c.regionLabelsUrl!=''){
                map.getSource('labels').setData(c.regionLabelsUrl);
            }
            map.getSource('leads').setData({ "type": "FeatureCollection", "features": [] });
            map.getSource('client-buffers').setData({ "type": "FeatureCollection", "features": [] });

            fetch(c.regionBordersUrl)
                .then((response) => response.json())
                .then(function (geojson) {
                    regionsGeojson = geojson;
                    const bbox = turf.bbox(regionsGeojson);
                    map.fitBounds(bbox, {
                        padding: { top: 50, bottom: 50, left: 100, right: 50 }
                    });
                });
            selectedCountry = c;
            listIndustriesByCountry();
        });
    });

}

function listIndustriesByCountry() {
    $('#industries').empty();
    $('#leads').empty();
    countries.find(c => c.name == selectedCountry.name).industries.map(i => {
        let industryItem = $(`<li>${i.name}</li>`);
        $('#industries').append(industryItem);
        industryItem.click(() => {
            selectedIndustry = i;
            $('#leads').html(`
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            `);
            getBoardDetails(function(){
                listLeadsByIndustry();
                getClientsByIndustry();
            });
            // listClientsByIndustry(i, countryName); // no need to show clients on map, for now
        });
    });
}

function listLeadsByIndustry() {
    $('#leads').html(`
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `);
    
    let noteFieldId = columnsOfSelectedBoard.find(c => c.title == 'notatka' || c.title == 'notatki' || c.title == 'notes' || c.title == 'type of property' || c.title ==  'type of ad' || c.title ==  'typ reklamy').id;
    let cityFieldId = columnsOfSelectedBoard.find(c => c.title == 'miejscowość' || c.title == 'województwo' || c.title == 'lokalizacja' || c.title == 'region' || c.title == 'city/ postal code' || c.title == 'postal code' || c.title == 'city').id;
    let goodGroupIds =  groupsOfSelectedBoard.filter(c => c.title.includes('good')).map(g => g.id);
    console.log('goodGroupIds', goodGroupIds);
    let query = `query GetBoardItems{  
            boards(ids: [${selectedIndustry.boardId}]) {  
                name
                groups(ids: ["${goodGroupIds.join('","')}"]){
                    title
                    items_page(limit: 500) {  
                        items {  
                            id  
                            name 
                            column_values(ids: ["email", "lead_email", "${cityFieldId}", "${noteFieldId}"]) {  
                                id  
                                value  
                            }  
                        }  
                    }  
                }
            }  
        }`;

    monday.api(query, {
        apiVersion: '2023-10',
        token: mondayToken
    }).then(res => {
        selectedLeads = [];
        let leadAddresses = [];
        res.data.boards[0].groups.map(g => {

            g.items_page.items.map(li => {
                let leadEmail = JSON.parse(li.column_values.filter(cv => cv.id == 'email' || cv.id == 'lead_email')[0].value)?.email;
                let leadCity = '';
                const cityColumn = li.column_values.filter(cv => cv.id == cityFieldId)[0].value?.replace(/^["']|["']$/g, '');
                if (cityColumn) {
                    if (cityColumn.startsWith('{')) {
                        leadCity = JSON.parse(cityColumn).text;
                    }
                    else {
                        leadCity = cityColumn
                    }

                    leadCity = leadCity.replaceAll('\"', '');
                    leadNote = li.column_values.filter(cv => cv.id == noteFieldId)[0].value;
                    try {
                        let noteJson=JSON.parse(leadNote);
                        if(noteJson.text) leadNote = noteJson.text;
                    } catch (e) {}


                    selectedLeads.push({
                        id: li.id,
                        name: li.name,
                        email: leadEmail,
                        city: leadCity,
                        address: leadCity + ' ' + selectedCountry.name, 
                        note: leadNote
                    });
                }
            });

        });

        displayLeads(selectedLeads);
        createAddressIfNotExist(selectedLeads.map(l => l.address), function () {
            displayLeadsOnMap();
        });

    });

}

function displayLeads(leads) {

    $('#leads').empty();
    leads.map(le => {
        let leadItem = $(`<h6>${le.name} <span class="badge rounded-pill text-bg-secondary">${le.city}</span>`);
        $('#leads').append(leadItem);

        leadItem.click(() => {
            map.flyTo({center: [le.longitude, le.latitude], zoom: 12});
        });
    });
}

function getClientsByIndustry() {
    clients = null;
    map.getSource('client-buffers').setData({ "type": "FeatureCollection", "features": [] });

    if (selectedIndustry.clientsCsvUrl) {
        Papa.parse(selectedIndustry.clientsCsvUrl + '&nocache=' + Math.floor(Math.random() * 100000000).toString(), {
            download: true,
            header: true,
            complete: function (results) {
                clients = results.data.filter(d => d['NAME'].trim()!='').map(d => {
                    return {
                        name: d['NAME'],
                        regions: (d['REGION'].trim() == '' || d['REGION'].trim() == '-') ? [] : d['REGION'].trim().toLowerCase().split(',').map(c=>c.trim()),
                        city: d['CITY'] == '' ? null : d['CITY'],
                        cityBufferKm: d['BUFFER IN KM'] == '' ? null : Number(d['BUFFER IN KM']),
                        orderedLeads: d['ORDERED LEADS'] == '' ? null : Number(d['ORDERED LEADS']),
                        status: d['STATUS'] ? ( d['STATUS'].trim().toLowerCase()=='yes' ? true : false ) : true,
                    }
                });
                clients = clients.filter(c=>c.status==true);
                getCityCoordinatesOfClients();
            }
        });
    };
}

listCountries();

const firebaseConfig = {
    apiKey: "AIzaSyDsnXEGVGThb-OnBXG20PjFvRMdgFw-vDc",
    authDomain: "lemon-lead-map.firebaseapp.com",
    projectId: "lemon-lead-map",
    storageBucket: "lemon-lead-map.appspot.com",
    messagingSenderId: "1095389983309",
    appId: "1:1095389983309:web:5eb6344c31006cdb8e6204"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();


function createAddressIfNotExist(addresses, callback) {
    let addressCreatePromises = [];
    let addressCheckPromises = [];

    addresses.forEach(address => {
        addressCheckPromises.push(
            db.collection('address_book').where('address', '==', address).get().then((snapshot) => {
                if (snapshot.docs.length == 0) {
                    return address
                }
            })
        );
    });

    Promise.all(addressCheckPromises).then((values) => {
        values.forEach(address => {
            if (address) {
                addressCreatePromises.push(
                    db.collection("address_book").add({
                        address: address
                    }).then(() => {
                        return address;
                    })
                );
            }
        });
        Promise.all(addressCreatePromises).then((values) => {
            //display them on map
            if (typeof callback === "function") {
                callback();
            }
        });
    });



}

function displayLeadsOnMap() {

    let geojson = {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "features": []
    };

    let uniqueAdresses = selectedLeads.map(l => l.address);
    uniqueAdresses = uniqueAdresses.filter(onlyUnique);

    const batches = [];

    while (uniqueAdresses.length) {
        // firestore limits batches to 10
        const batch = uniqueAdresses.splice(0, 10);

        // add the batch request to to a queue
        batches.push(
            db.collection('address_book')
                .where(
                    'address',
                    'in',
                    [...batch]
                )
                .get()
                .then(results => results.docs.map(result => ({ /* id: result.id, */ ...result.data() })))
        )
    }

    // after all of the data is fetched, return it
    return Promise.all(batches)
        .then(content => {
            content.flat().forEach(addressData => {
                selectedLeads.filter(le => le.address == addressData.address).forEach(le => {
                    le['latitude'] = addressData.latitude;
                    le['longitude'] = addressData.longitude;
                });
            });

            selectedLeads.map(le => {
                geojson.features.push(
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [le.longitude, le.latitude]
                        },
                        properties: { ...le }
                    }
                );
            });
            map.getSource('leads').setData(geojson);
        });
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}


function modalListenersSetup() {
    var clientsModalEl = document.getElementById('clientsModal');

    clientsModalEl.addEventListener('show.bs.modal', event => {
        $('#noClient').show();
        $('#clients-table-container').hide();
        if (matchedClients && matchedClients.length > 0) {
            $('#noClient').hide();
            $('#clients-table-container').show();
            $clientsTable.bootstrapTable('load', matchedClients);
            populateClientTotalLeads();
        }
    })

}

const initcap = (str) => str[0].toUpperCase() + str.substring(1).toLowerCase();


let $clientsTable = $('#clients-table');
$clientsTable.bootstrapTable({
    clickToSelect: true
});

function regionFormatter(value, row) {
    let regionsText='';
    if(value && value.filter(region => region.trim() != '-').length > 0){
        regionsText += value.map(region => initcap(region)).join(', ');
    }
    if(row.city && row.city !='') {
        regionsText +=  row.city +' + '+row.cityBufferKm + 'km';
    }
    return regionsText;
}

function clientNameFormatter(value, row) {
    return value + ` <div client-name="${encodeURIComponent(value)}" class="spinner-border client-total-leads-spinner" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div> 
                    <span client-name="${encodeURIComponent(value)}"   class="badge rounded-pill text-bg-info lead-count"></span>`;
}

$('#btnSendLeadToClients').click(() => {
    // send selected lead to client
    /*
     * set client fields to sent []
     * set lead status to sent
     * move lead to send group
    */
    clientsModal.hide();
    if ($clientsTable.bootstrapTable('getSelections').length == 0) {
        bootbox.alert('You need to select at least one client!', function () {
            clientsModal.show();
        });
        return;
    }
    bootbox.confirm('Are you sure to send the leads to the matched clients!',
        function (result) {
            if (result) {



                let sendGroupId = groupsOfSelectedBoard.find(c => c.title == 'send').id;
                let leadStatusFieldId = columnsOfSelectedBoard.find(c => c.title == 'status').id;
                let clientQueries = [];

                // get selected clients

                $clientsTable.bootstrapTable('getSelections').forEach(function (value, i) {

                    let clientFieldId = columnsOfSelectedBoard.find(c => c.title == value.name.trim().toLowerCase()).id;
                    clientQueries.push(`
                                        set_client_field_of_lead_${i}: change_simple_column_value (board_id: ${selectedIndustry.boardId}, item_id: ${selectedLead.properties.id}, column_id: "${clientFieldId}", value: "${CLIENT_STATUS_SENT}") {
                                            id
                                        }
                                        `);
                });

                let query = `mutation {
                                    set_lead_status: change_simple_column_value (board_id: ${selectedIndustry.boardId}, item_id: ${selectedLead.properties.id}, column_id: "${leadStatusFieldId}", value: "${LEAD_STATUS_SENT}") {
                                        id
                                    }
                                    ${clientQueries.join('\n')}
                                    move_to_sent_group: move_item_to_group(item_id: ${selectedLead.properties.id}, group_id: "${sendGroupId}") {
                                        id
                                    }
                                }`;

                monday.api(query, {
                    apiVersion: '2023-10',
                    token: mondayToken
                }).then(res => {
                    listLeadsByIndustry();
                    bootbox.alert({
                        message: '<p><i class="fa fa-check"></i> The lead sent to the client(s)',
                        backdrop: true
                    });

                })
                    .catch((error) => {
                        console.log(error);

                        bootbox.alert({
                            message: '<p><i class="fa Example of exclamation-triangle fa-exclamation-triangle"></i> An error occured',
                            backdrop: true
                        });
                    });

            } else {
                clientsModal.show();
            }
        });


});

function getBoardDetails(callback) {
    let query = `query GetBoardItems{  
                    boards(ids: ${selectedIndustry.boardId}) {  
                        name
                        groups {
                            title
                            id  
                        }
                        columns{
                            title
                            id 
                        }
                    }  
                }   
                `;

    monday.api(query, {
        apiVersion: '2023-10',
        token: mondayToken
    }).then(res => {

        groupsOfSelectedBoard = res.data.boards[0].groups;
        columnsOfSelectedBoard = res.data.boards[0].columns;

        groupsOfSelectedBoard = groupsOfSelectedBoard.map(group => {
            return {
                title: group.title.trim().toLowerCase(),
                id: group.id
            }
        });
        columnsOfSelectedBoard = columnsOfSelectedBoard.map(group => {
            return {
                title: group.title.trim().toLowerCase(),
                id: group.id
            }
        });

        
        if (typeof callback === "function") {
            callback();
        }

    });
}

function getCityCoordinatesOfClients() {
    let clientsWithCity = clients.filter(c => c.city && c.city != '');
    createAddressIfNotExist(clientsWithCity.map(c => c.city + ' ' + selectedCountry.name), function () {
        polulateClientCoordinates();
    });
}

function polulateClientCoordinates() {
    let clientsWithCity = clients.filter(c => c.city && c.city != '');
    let uniqueAdresses = clientsWithCity.map(c => c.city + ' ' + selectedCountry.name);
    uniqueAdresses = uniqueAdresses.filter(onlyUnique);

    const batches = [];

    while (uniqueAdresses.length) {
        // firestore limits batches to 10
        const batch = uniqueAdresses.splice(0, 10);

        // add the batch request to to a queue
        batches.push(
            db.collection('address_book')
                .where(
                    'address',
                    'in',
                    [...batch]
                )
                .get()
                .then(results => results.docs.map(result => ({ /* id: result.id, */ ...result.data() })))
        )
    }

    Promise.all(batches)
        .then(content => {
            content.flat().forEach(addressData => {
                clientsWithCity.filter(c => c.city + ' ' + selectedCountry.name == addressData.address).forEach(c => {
                    c['latitude'] = addressData.latitude;
                    c['longitude'] = addressData.longitude;
                });
            });

            let clientBufferGeojson = turf.featureCollection(
                clientsWithCity.map(cl => {
                    let point = turf.point([cl.longitude, cl.latitude]);
                    let feature = turf.buffer(point, cl.cityBufferKm);
                    feature.properties['name'] = cl.name;
                    return feature;
                })
            );

            map.getSource('client-buffers').setData(clientBufferGeojson);

        });

}


function checkMondayToken(){
    $('#authenticate-spinner').show();
    monday.api(`query { users { id, name } }`, {
        apiVersion: '2023-10',
        token: mondayToken
    }).then(res => {
        console.log(res);
        $('#authenticate-spinner').hide();
    }).catch(err => {
        localStorage.removeItem('monday-token');
        mondayToken = null;
        showModalToSetToken();
    });
}



function checkClientNameWithBoardColumn(clientName) {
    let isNameAndColumnTitleMatched = columnsOfSelectedBoard.filter(col => col.title == clientName.trim().toLowerCase()).length > 0;

    if(isNameAndColumnTitleMatched == false ){
        return '<span style="color:red;"> Check coumn title on the board</span>'
    }
    return '';
}

function getNumberOfSendLeads(clientName, spinnerElement) {
    //let sendGroupId = groupsOfSelectedBoard.find(c => c.title == 'send').id;
    let client = clients.find(cl => cl.name == clientName);
    let clientColumn = columnsOfSelectedBoard.find(c => c.title == clientName.trim().toLowerCase());

    if(clientColumn) {
        if (!Object.keys(client).includes('numberOfSentLeads')){
            client['numberOfSentLeads'] = '...';
        } else{
            //spinnerElement.next().html(` (${client.numberOfSentLeads}/${client.orderedLeads??'unknown'})`  );
            $('#clients-table').find(`.lead-count[client-name='${encodeURIComponent(client.name)}']`).html(` (${client.numberOfSentLeads}/${client.orderedLeads??'unknown'})`);
            $('.clients-popup').find(`.lead-count[client-name='${encodeURIComponent(client.name)}']`).html(` (${client.numberOfSentLeads}/${client.orderedLeads??'unknown'})`);
            spinnerElement.remove();
            return;
        }
        let clientFieldId = clientColumn.id;
        let query = `
            query {
                boards (ids: ${selectedIndustry.boardId}) {
                    items_page (query_params: {rules: [{column_id: "${clientFieldId}", compare_value: 1 }]}, limit:500) {
                    items {
                        id
                        name
                    }
                    }
                }
            }
            `;
            
        monday.api(query, {
            apiVersion: '2023-10',
            token: mondayToken
        }).then(res => {
            let sendLeadsCount = res.data.boards[0].items_page.items.length;
            //spinnerElement.next().html(` (${sendLeadsCount}/${client.orderedLeads??'unknown'})`  );
            spinnerElement.remove();
            $('#clients-table').find(`.lead-count[client-name='${encodeURIComponent(client.name)}']`).html(` (${sendLeadsCount}/${client.orderedLeads??'unknown'})`);
            $('.clients-popup').find(`.lead-count[client-name='${encodeURIComponent(client.name)}']`).html(` (${sendLeadsCount}/${client.orderedLeads??'unknown'})`);
            client['numberOfSentLeads'] = sendLeadsCount;
        });
    } else {
        spinnerElement.remove();
        $('#clients-table').find(`.lead-count[client-name='${encodeURIComponent(client.name)}']`).remove();
        $('.clients-popup').find(`.lead-count[client-name='${encodeURIComponent(client.name)}']`).remove();
    }

}

function populateClientTotalLeads(){
    $('#clients-table').find('.client-total-leads-spinner').each(function(){
        getNumberOfSendLeads(decodeURIComponent($(this).attr('client-name')), $(this) );
    });
}

function populateClientTotalLeadsOnMapPopup(){
    $('.clients-popup').find('.client-total-leads-spinner').each(function(){
        getNumberOfSendLeads(decodeURIComponent($(this).attr('client-name')), $(this) );
    });
}



// Status = Send
// ClientColumn = Wysłany
// Move to 'Send' group
