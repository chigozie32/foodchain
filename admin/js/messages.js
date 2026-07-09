/*==========================================
FOODCHAIN
CONTACT MESSAGES
MONGODB VERSION
==========================================*/

const API_URL = "https://foodchain-api.onrender.com/contact";

let messages = [];

const tableBody =
document.getElementById("messagesTableBody");

const search =
document.getElementById("searchMessage");

/*==========================================
LOAD MESSAGES
==========================================*/

async function loadMessages(){

    try{

        const response =
        await fetch(API_URL);

        messages =
        await response.json();

        displayMessages();

    }catch(error){

        console.error(error);

        alert("Could not load messages.");

    }

}

/*==========================================
DISPLAY MESSAGES
==========================================*/

function displayMessages(searchText=""){

    if(!tableBody) return;

    tableBody.innerHTML = "";

    messages.forEach(msg=>{

        const keyword =
        searchText.toLowerCase();

        if(

            !msg.name.toLowerCase().includes(keyword) &&

            !msg.email.toLowerCase().includes(keyword)

        ){

            return;

        }

        tableBody.innerHTML += `

<tr>

<td>${msg.name}</td>

<td>${msg.email}</td>

<td>${msg.phone || "-"}</td>

<td>${msg.subject}</td>

<td>${msg.date || "-"}</td>

<td>

<span class="status-badge">

${msg.status || "Unread"}

</span>

</td>

<td class="action-buttons">

<button
class="view-btn"
onclick="viewMessage('${msg._id}')">

View

</button>

<button
class="respond-btn"
onclick="respondMessage('${msg._id}')">

Respond

</button>

<button
class="delete-btn"
onclick="deleteMessage('${msg._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

/*==========================================
VIEW MESSAGE
==========================================*/

async function viewMessage(id){

    try{

        const response = await fetch(`${API_URL}/${id}`,{

            method:"PUT"

        });

        const data = await response.json();

        if(data.success){

            const message = messages.find(msg => msg._id === id);

            if(message){

                message.status = "Read";

            }

            displayMessages(search ? search.value : "");

        }

    }catch(error){

        console.error(error);

    }

    const msg = messages.find(message => message._id === id);

    if(!msg) return;

    alert(

`Name: ${msg.name}

Email: ${msg.email}

Phone: ${msg.phone || "-"}

Subject: ${msg.subject}

Message:

${msg.message}`

    );

}

/*==========================================
RESPOND TO MESSAGE
==========================================*/

function respondMessage(id){

    const msg = messages.find(message => message._id === id);

    if(!msg) return;

    const subject =
    encodeURIComponent("Re: " + msg.subject);

    const body =
    encodeURIComponent(

`Hello ${msg.name},

Thank you for contacting FoodChain.

`

    );

    window.location.href =
`mailto:${msg.email}?subject=${subject}&body=${body}`;

}

/*==========================================
DELETE MESSAGE
==========================================*/

async function deleteMessage(id){

    if(!confirm("Delete this message?")){

        return;

    }

    try{

        const response = await fetch(`${API_URL}/${id}`,{

            method:"DELETE"

        });

        const data = await response.json();

        alert(data.message);

        await loadMessages();

    }catch(error){

        console.error(error);

        alert("Could not delete message.");

    }

}

/*==========================================
SEARCH MESSAGES
==========================================*/

if(search){

    search.addEventListener("input", function(){

        displayMessages(this.value);

    });

}

/*==========================================
INITIALIZE
==========================================*/

document.addEventListener("DOMContentLoaded", ()=>{

    loadMessages();

});