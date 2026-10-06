/*==========================================
FOODCHAIN NEWSLETTER SUBSCRIBERS
MONGODB VERSION
==========================================*/

const API_URL = "https://foodchain-api.onrender.com/newsletter";

let subscribers = [];
let selectedSubscriberIds = new Set();

const tableBody =
document.getElementById("subscriberTableBody");

const search =
document.getElementById("searchSubscriber");

const selectAllSubscribers =
document.getElementById("selectAllSubscribers");

const bulkBar =
document.getElementById("bulkActionBar");

const bulkCountEl =
document.getElementById("bulkSelectedCount");

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

        showToast("Could not load subscribers.");

    }

}

/*==========================================
DISPLAY SUBSCRIBERS
==========================================*/

function displaySubscribers(searchText=""){

    if(!tableBody) return;

    tableBody.innerHTML = "";

    const keyword = searchText.toLowerCase();

    const visible = subscribers.filter(s => s.email.toLowerCase().includes(keyword));

    visible.forEach(subscriber=>{

        tableBody.innerHTML += `

<tr class="${selectedSubscriberIds.has(subscriber._id) ? "row-selected" : ""}">

<td>
    <input type="checkbox" class="row-checkbox" data-id="${subscriber._id}"
        ${selectedSubscriberIds.has(subscriber._id) ? "checked" : ""}
        onchange="toggleSubscriberSelection('${subscriber._id}', this.checked)">
</td>

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

    updateSelectAllState(visible);
    updateBulkBar();
    staggerIn(tableBody, "tr");

}

/*==========================================
SELECTION HANDLING
==========================================*/

function toggleSubscriberSelection(id, checked){

    if(checked){
        selectedSubscriberIds.add(id);
    } else {
        selectedSubscriberIds.delete(id);
    }

    displaySubscribers(search ? search.value : "");

}

function updateSelectAllState(visibleList){

    if(!selectAllSubscribers) return;

    const allSelected = visibleList.length > 0 &&
        visibleList.every(s => selectedSubscriberIds.has(s._id));

    selectAllSubscribers.checked = allSelected;

}

function updateBulkBar(){

    if(!bulkBar) return;

    const count = selectedSubscriberIds.size;

    if(count > 0){
        bulkBar.classList.add("active");
    } else {
        bulkBar.classList.remove("active");
    }

    if(bulkCountEl){
        bulkCountEl.textContent = count;
    }

}

if(selectAllSubscribers){

    selectAllSubscribers.addEventListener("change", function(){

        const keyword = (search ? search.value : "").toLowerCase();

        const visible = subscribers.filter(s => s.email.toLowerCase().includes(keyword));

        if(this.checked){
            visible.forEach(s => selectedSubscriberIds.add(s._id));
        } else {
            visible.forEach(s => selectedSubscriberIds.delete(s._id));
        }

        displaySubscribers(search ? search.value : "");

    });

}

/*==========================================
VIEW SUBSCRIBER
==========================================*/

function viewSubscriber(id){

    const subscriber =
    subscribers.find(item => item._id === id);

    if(!subscriber) return;

    showInfo(
        "Subscriber Details",
        `Email: ${subscriber.email}\nSubscribed On: ${subscriber.date}`
    );

}

/*==========================================
DELETE SUBSCRIBER (single)
==========================================*/

async function deleteSubscriber(id){

    showConfirm("Delete this subscriber?", async () => {

        try{

            const response = await fetch(`${API_URL}/${id}`,{

                method:"DELETE"

            });

            const data = await response.json();

            showToast(data.message);

            selectedSubscriberIds.delete(id);

            await loadSubscribers();

        }catch(error){

            console.error(error);

            showToast("Could not delete subscriber.");

        }

    }, { title: "Delete Subscriber", confirmText: "Delete", danger: true });

}

/*==========================================
BULK DELETE
==========================================*/

async function bulkDeleteSubscribers(){

    if(selectedSubscriberIds.size === 0) return;

    showConfirm(`Delete ${selectedSubscriberIds.size} selected subscriber(s)?`, async () => {

        try{

            const response = await fetch(`${API_URL}/bulk`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedSubscriberIds) })
            });

            const data = await response.json();

            showToast(data.message);

            selectedSubscriberIds.clear();
            await loadSubscribers();

        }catch(error){

            console.error(error);
            showToast("Could not delete subscribers.");

        }

    }, { title: "Delete Subscribers", confirmText: "Delete", danger: true });

}

/*==========================================
BROADCAST EMAIL (selected or all)
==========================================*/

function openBroadcastModal(scope){

    const modal = document.getElementById("broadcastModal");
    if(!modal) return;

    modal.dataset.scope = scope; // "selected" or "all"

    document.getElementById("broadcastModalSubtitle").textContent =
        scope === "selected"
            ? `This will be emailed to ${selectedSubscriberIds.size} selected subscriber(s).`
            : `This will be emailed to all ${subscribers.length} subscriber(s).`;

    document.getElementById("broadcastSubject").value = "";
    document.getElementById("broadcastMessage").value = "";

    modal.classList.add("active");

}

function closeBroadcastModal(){

    const modal = document.getElementById("broadcastModal");
    if(modal) modal.classList.remove("active");

}

async function sendBroadcast(){

    const modal = document.getElementById("broadcastModal");
    const scope = modal ? modal.dataset.scope : "all";

    const subject = document.getElementById("broadcastSubject").value.trim();
    const message = document.getElementById("broadcastMessage").value.trim();

    if(!subject || !message){
        showToast("Please fill in both the subject and message.");
        return;
    }

    const sendBtn = document.getElementById("sendBroadcastBtn");
    if(sendBtn){
        sendBtn.disabled = true;
        sendBtn.textContent = "Sending...";
    }

    try{

        const body = { subject, message };

        if(scope === "selected"){
            body.ids = Array.from(selectedSubscriberIds);
        }

        const response = await fetch(`${API_URL}/broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        showToast(data.message);

        closeBroadcastModal();
        selectedSubscriberIds.clear();
        displaySubscribers(search ? search.value : "");

    }catch(error){

        console.error(error);
        showToast("Could not send broadcast.");

    }finally{

        if(sendBtn){
            sendBtn.disabled = false;
            sendBtn.textContent = "Send Email";
        }

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
