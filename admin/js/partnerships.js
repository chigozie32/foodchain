/*==========================================
FOODCHAIN
PARTNERSHIP REQUESTS
(MongoDB Version)
==========================================*/

let partnershipRequests = [];

const tableBody =
document.getElementById("partnershipTableBody");

// const searchInput =
// document.getElementById("searchPartnership");

/*==========================================
LOAD REQUESTS
==========================================*/

async function loadPartnershipRequests(){

    try{

        const response =
        await fetch("http://localhost:3000/partnership");

        partnershipRequests =
        await response.json();

        displayRequests();

    }catch(error){

        console.error(error);

        alert("Could not load partnership requests.");

    }

}

/*==========================================
DISPLAY REQUESTS
==========================================*/

function displayRequests(searchText=""){

    if(!tableBody) return;

    tableBody.innerHTML = "";

    partnershipRequests.forEach((request)=>{

        if(

            !request.restaurant
            .toLowerCase()
            .includes(searchText.toLowerCase())

        ){

            return;

        }

        tableBody.innerHTML += `

<tr>

<td>${request.restaurant}</td>

<td>${request.owner}</td>

<td>${request.category}</td>

<td>${request.email}</td>

<td>${request.phone}</td>

<td>${request.city}</td>

<td>

<button
class="view-btn"
onclick="viewRequest('${request._id}')">

View

</button>

<button
class="approve-btn"
onclick="approveRequest('${request._id}')">

Approve

</button>

<button
class="reject-btn"
onclick="rejectRequest('${request._id}')">

Reject

</button>

<button
class="delete-btn"
onclick="deleteRequest('${request._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

/*==========================================
VIEW REQUEST
==========================================*/

function viewRequest(id){

    const request =
    partnershipRequests.find(r=>r._id===id);

    if(!request) return;

    alert(

`Business Name: ${request.restaurant}

Owner: ${request.owner}

Category: ${request.category}

City: ${request.city}

Email: ${request.email}

Phone: ${request.phone}

Description:

${request.description}`

    );

}

/*==========================================
APPROVE REQUEST
==========================================*/

async function approveRequest(id){

    try{

        const response = await fetch(
            `http://localhost:3000/partnership/${id}/approve`,
            {
                method:"PUT"
            }
        );

        const data = await response.json();

        alert(data.message);

        loadPartnershipRequests();

    }catch(error){

        console.error(error);

        alert("Could not approve partnership request.");

    }

}

/*==========================================
REJECT REQUEST
==========================================*/

async function rejectRequest(id){

    try{

        const response = await fetch(
            `http://localhost:3000/partnership/${id}/reject`,
            {
                method:"PUT"
            }
        );

        const data = await response.json();

        alert(data.message);

        loadPartnershipRequests();

    }catch(error){

        console.error(error);

        alert("Could not reject partnership request.");

    }

}

/*==========================================
DELETE REQUEST
==========================================*/

async function deleteRequest(id){

    if(!confirm("Are you sure you want to delete this request?")){
        return;
    }

    try{

        const response = await fetch(
            `http://localhost:3000/partnership/${id}`,
            {
                method:"DELETE"
            }
        );

        const data = await response.json();

        alert(data.message);

        loadPartnershipRequests();

    }catch(error){

        console.error(error);

        alert("Could not delete partnership request.");

    }

}

/*==========================================
SEARCH
==========================================*/

const searchInput =
document.getElementById("searchPartnership");

if(searchInput){

    searchInput.addEventListener("input",function(){

        displayRequests(this.value);

    });

}

/*==========================================
INITIAL LOAD
==========================================*/

loadPartnershipRequests();