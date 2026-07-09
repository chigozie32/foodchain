/*==========================================
FOODCHAIN NEWSLETTER SUBSCRIBERS
MONGODB VERSION
==========================================*/

const API_URL = "http://localhost:3000/newsletter";

let subscribers = [];

const tableBody =
document.getElementById("subscriberTableBody");

const search =
document.getElementById("searchSubscriber");

/*==========================================
LOAD SUBSCRIBERS
==========================================*/

async function loadSubscribers(){

    try{

        const response =
        await fetch(API_URL);

        subscribers =
        await response.json();

        displaySubscribers();

    }catch(error){

        console.error(error);

        alert("Could not load subscribers.");

    }

}

/*==========================================
DISPLAY SUBSCRIBERS
==========================================*/

function displaySubscribers(searchText=""){

    if(!tableBody) return;

    tableBody.innerHTML = "";

    subscribers.forEach(subscriber=>{

        const keyword =
        searchText.toLowerCase();

        if(

            !subscriber.email
            .toLowerCase()
            .includes(keyword)

        ){

            return;

        }

        tableBody.innerHTML += `

<tr>

<td>${subscriber.email}</td>

<td>${subscriber.date}</td>

<td class="action-buttons">

<button
class="view-btn"
onclick="viewSubscriber('${subscriber._id}')">

View

</button>

<button
class="delete-btn"
onclick="deleteSubscriber('${subscriber._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

/*==========================================
VIEW SUBSCRIBER
==========================================*/

function viewSubscriber(id){

    const subscriber =
    subscribers.find(item => item._id === id);

    if(!subscriber) return;

    alert(

`Subscriber Email:

${subscriber.email}

Subscribed On:

${subscriber.date}`

    );

}

/*==========================================
DELETE SUBSCRIBER
==========================================*/

async function deleteSubscriber(id){

    if(!confirm("Delete this subscriber?")){

        return;

    }

    try{

        const response = await fetch(`${API_URL}/${id}`,{

            method:"DELETE"

        });

        const data = await response.json();

        alert(data.message);

        await loadSubscribers();

    }catch(error){

        console.error(error);

        alert("Could not delete subscriber.");

    }

}

/*==========================================
SEARCH SUBSCRIBERS
==========================================*/

if(search){

    search.addEventListener("input",function(){

        displaySubscribers(this.value);

    });

}

/*==========================================
INITIALIZE
==========================================*/

document.addEventListener("DOMContentLoaded",()=>{

    loadSubscribers();

});