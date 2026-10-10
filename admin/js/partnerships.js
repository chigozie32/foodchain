/*==========================================
FOODCHAIN
PARTNERSHIP REQUESTS
(MongoDB Version)
==========================================*/

const PARTNERSHIP_API = "https://foodchain-api.onrender.com/partnership";

let partnershipRequests = [];
let selectedPartnershipIds = new Set();
let currentViewedPartnershipId = null;

const tableBody =
document.getElementById("partnershipTableBody");

const selectAllPartnerships =
document.getElementById("selectAllPartnerships");

const bulkBar =
document.getElementById("bulkActionBar");

const bulkCountEl =
document.getElementById("bulkSelectedCount");

/*==========================================
LOAD REQUESTS
==========================================*/

async function loadPartnershipRequests(){

    try{

        const response =
        await fetch(PARTNERSHIP_API);

        partnershipRequests =
        await response.json();

        displayRequests();

    }catch(error){

        console.error(error);

        showToast("Could not load partnership requests.");

    }

}

/*==========================================
DISPLAY REQUESTS
==========================================*/

function displayRequests(searchText=""){

    if(!tableBody) return;

    tableBody.innerHTML = "";

    const keyword = searchText.toLowerCase();

    const visible = partnershipRequests.filter(request =>
        request.restaurant.toLowerCase().includes(keyword)
    );

    visible.forEach((request)=>{

        const statusClass = (request.status || "Pending").toLowerCase();

        tableBody.innerHTML += `

<tr class="${selectedPartnershipIds.has(request._id) ? "row-selected" : ""}">

<td>
    <input type="checkbox" class="row-checkbox" data-id="${request._id}"
        ${selectedPartnershipIds.has(request._id) ? "checked" : ""}
        onchange="togglePartnershipSelection('${request._id}', this.checked)">
</td>

<td>${request.restaurant}</td>

<td>${request.owner}</td>

<td>${request.category}</td>

<td>${request.email}</td>

<td>${request.phone}</td>

<td>${request.city}</td>

<td>
<span class="status-badge status-${statusClass}">
${request.status || "Pending"}
</span>
</td>

<td class="action-buttons">

<button
class="view-btn"
onclick="viewRequest('${request._id}')" title="View details">

<i class="fas fa-eye"></i>

</button>

<button
class="respond-btn"
onclick="openReplyModal('${request._id}')" title="Reply">

<i class="fas fa-reply"></i> Reply

</button>

<button
class="approve-btn"
onclick="approveRequest('${request._id}')" title="Approve">

<i class="fas fa-check"></i>

</button>

<button
class="reject-btn"
onclick="rejectRequest('${request._id}')" title="Reject">

<i class="fas fa-times"></i>

</button>

<button
class="delete-btn"
onclick="deleteRequest('${request._id}')" title="Delete">

<i class="fas fa-trash"></i>

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

function togglePartnershipSelection(id, checked){

    if(checked){
        selectedPartnershipIds.add(id);
    } else {
        selectedPartnershipIds.delete(id);
    }

    displayRequests(searchInput ? searchInput.value : "");

}

function updateSelectAllState(visibleList){

    if(!selectAllPartnerships) return;

    const allSelected = visibleList.length > 0 &&
        visibleList.every(r => selectedPartnershipIds.has(r._id));

    selectAllPartnerships.checked = allSelected;

}

function updateBulkBar(){

    if(!bulkBar) return;

    const count = selectedPartnershipIds.size;

    if(count > 0){
        bulkBar.classList.add("active");
    } else {
        bulkBar.classList.remove("active");
    }

    if(bulkCountEl){
        bulkCountEl.textContent = count;
    }

}

if(selectAllPartnerships){

    selectAllPartnerships.addEventListener("change", function(){

        const keyword = (searchInput ? searchInput.value : "").toLowerCase();

        const visible = partnershipRequests.filter(r =>
            r.restaurant.toLowerCase().includes(keyword)
        );

        if(this.checked){
            visible.forEach(r => selectedPartnershipIds.add(r._id));
        } else {
            visible.forEach(r => selectedPartnershipIds.delete(r._id));
        }

        displayRequests(searchInput ? searchInput.value : "");

    });

}

/*==========================================
VIEW REQUEST
==========================================*/

function viewRequest(id){

    const request =
    partnershipRequests.find(r=>r._id===id);

    if(!request) return;

    currentViewedPartnershipId = id;

    const modal = document.getElementById("viewPartnershipModal");

    if(modal){

        document.getElementById("viewPName").textContent = request.restaurant;
        document.getElementById("viewPOwner").textContent = request.owner;
        document.getElementById("viewPCategory").textContent = request.category;
        document.getElementById("viewPCity").textContent = request.city;
        document.getElementById("viewPEmail").textContent = request.email;
        document.getElementById("viewPPhone").textContent = request.phone;
        document.getElementById("viewPDescription").textContent = request.description || "-";

        const replySection = document.getElementById("viewPReplySection");

        if(request.replyMessage){
            replySection.style.display = "block";
            document.getElementById("viewPReply").textContent = request.replyMessage;
        } else {
            replySection.style.display = "none";
        }

        modal.classList.add("active");

    }

}

function closeViewPartnershipModal(){

    const modal = document.getElementById("viewPartnershipModal");
    if(modal) modal.classList.remove("active");

}

/*==========================================
REPLY MODAL (single + bulk)
==========================================*/

let replyTargetId = null;
let replyTargetIds = null;

function openReplyModal(id){

    replyTargetId = id;
    replyTargetIds = null;

    const request = partnershipRequests.find(r => r._id === id);
    if(!request) return;

    const modal = document.getElementById("replyModal");
    if(!modal) return;

    document.getElementById("replyModalTitle").textContent = `Reply to ${request.owner}`;
    document.getElementById("replyModalSubtitle").textContent = `${request.restaurant} — ${request.email}`;
    document.getElementById("replyText").value = "";

    modal.classList.add("active");

}

function openBulkReplyModal(){

    if(selectedPartnershipIds.size === 0) return;

    replyTargetId = null;
    replyTargetIds = Array.from(selectedPartnershipIds);

    const modal = document.getElementById("replyModal");
    if(!modal) return;

    document.getElementById("replyModalTitle").textContent = `Reply to ${replyTargetIds.length} selected request(s)`;
    document.getElementById("replyModalSubtitle").textContent = "The same message will be emailed to everyone selected.";
    document.getElementById("replyText").value = "";

    modal.classList.add("active");

}

function closeReplyModal(){

    const modal = document.getElementById("replyModal");
    if(modal) modal.classList.remove("active");

    replyTargetId = null;
    replyTargetIds = null;

}

async function sendReply(){

    const replyMessage = document.getElementById("replyText").value.trim();

    if(!replyMessage){
        showToast("Please write a reply message first.");
        return;
    }

    const sendBtn = document.getElementById("sendReplyBtn");
    if(sendBtn){
        sendBtn.disabled = true;
        sendBtn.textContent = "Opening email app...";
    }

    try{

        let targetIds, recipientEmails;

        if(replyTargetIds && replyTargetIds.length){

            targetIds = replyTargetIds;

            recipientEmails = partnershipRequests
                .filter(p => targetIds.includes(p._id))
                .map(p => p.email);

        } else if (replyTargetId) {

            targetIds = [replyTargetId];

            const req = partnershipRequests.find(p => p._id === replyTargetId);
            recipientEmails = req ? [req.email] : [];

        } else {

            showToast("No recipient selected.");
            return;

        }

        if(!recipientEmails.length){
            showToast("Could not find an email address for the selected request(s).");
            return;
        }

        // Open the admin's own default email app with everything pre-filled.
        const subject = encodeURIComponent("Reply from FoodChain");
        const body = encodeURIComponent(replyMessage);
        const to = recipientEmails.join(",");

        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

        // Record that these were responded to (no email-sending involved —
        // just a status update, so this can't fail the way SMTP can).
        const response = await fetch(`${PARTNERSHIP_API}/bulk-status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: targetIds, status: "Responded" })
        });

        const data = await response.json();

        showToast(data.message || "Marked as responded.");

        selectedPartnershipIds.clear();
        closeReplyModal();
        await loadPartnershipRequests();

    }catch(error){

        console.error(error);
        showToast("Could not update request status.");

    }finally{

        if(sendBtn){
            sendBtn.disabled = false;
            sendBtn.textContent = "Send Reply";
        }

    }

}

/*==========================================
BULK: STATUS + DELETE
==========================================*/

async function bulkApprove(){
    await bulkSetStatus("Approved");
}

async function bulkReject(){
    await bulkSetStatus("Rejected");
}

async function bulkSetStatus(status){

    if(selectedPartnershipIds.size === 0) return;

    try{

        const response = await fetch(`${PARTNERSHIP_API}/bulk-status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: Array.from(selectedPartnershipIds), status })
        });

        const data = await response.json();

        showToast(data.message);

        selectedPartnershipIds.clear();
        await loadPartnershipRequests();

    }catch(error){

        console.error(error);
        showToast("Could not update requests.");

    }

}

async function bulkDeleteRequests(){

    if(selectedPartnershipIds.size === 0) return;

    showConfirm(`Delete ${selectedPartnershipIds.size} selected request(s)?`, async () => {

        try{

            const response = await fetch(`${PARTNERSHIP_API}/bulk`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedPartnershipIds) })
            });

            const data = await response.json();

            showToast(data.message);

            selectedPartnershipIds.clear();
            await loadPartnershipRequests();

        }catch(error){

            console.error(error);
            showToast("Could not delete requests.");

        }

    }, { title: "Delete Requests", confirmText: "Delete", danger: true });

}

/*==========================================
APPROVE / REJECT / DELETE (single)
==========================================*/

async function approveRequest(id){

    try{

        const response = await fetch(
            `${PARTNERSHIP_API}/${id}/approve`,
            {
                method:"PUT"
            }
        );

        const data = await response.json();

        showToast(data.message);

        loadPartnershipRequests();

    }catch(error){

        console.error(error);

        showToast("Could not approve partnership request.");

    }

}

async function rejectRequest(id){

    try{

        const response = await fetch(
            `${PARTNERSHIP_API}/${id}/reject`,
            {
                method:"PUT"
            }
        );

        const data = await response.json();

        showToast(data.message);

        loadPartnershipRequests();

    }catch(error){

        console.error(error);

        showToast("Could not reject partnership request.");

    }

}

async function deleteRequest(id){

    showConfirm("Are you sure you want to delete this request?", async () => {

        try{

            const response = await fetch(
                `${PARTNERSHIP_API}/${id}`,
                {
                    method:"DELETE"
                }
            );

            const data = await response.json();

            showToast(data.message);

            selectedPartnershipIds.delete(id);

            loadPartnershipRequests();

        }catch(error){

            console.error(error);

            showToast("Could not delete partnership request.");

        }

    }, { title: "Delete Request", confirmText: "Delete", danger: true });

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

document.addEventListener("DOMContentLoaded", () => {
    loadPartnershipRequests();
});