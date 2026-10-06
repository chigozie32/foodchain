/*==========================================
FOODCHAIN
CONTACT MESSAGES
MONGODB VERSION
==========================================*/

const API_URL = "https://foodchain-api.onrender.com/contact";

let messages = [];
let selectedMessageIds = new Set();
let currentViewedMessageId = null;

const tableBody =
document.getElementById("messagesTableBody");

const search =
document.getElementById("searchMessage");

const selectAllCheckbox =
document.getElementById("selectAllMessages");

const bulkBar =
document.getElementById("bulkActionBar");

const bulkCountEl =
document.getElementById("bulkSelectedCount");

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

        showToast("Could not load messages.");

    }

}

/*==========================================
DISPLAY MESSAGES
==========================================*/

function displayMessages(searchText=""){

    if(!tableBody) return;

    tableBody.innerHTML = "";

    const keyword = searchText.toLowerCase();

    const visible = messages.filter(msg =>
        msg.name.toLowerCase().includes(keyword) ||
        msg.email.toLowerCase().includes(keyword)
    );

    visible.forEach(msg=>{

        const statusClass = (msg.status || "Unread").toLowerCase();

        tableBody.innerHTML += `

<tr class="${selectedMessageIds.has(msg._id) ? "row-selected" : ""}">

<td>
    <input type="checkbox" class="row-checkbox" data-id="${msg._id}"
        ${selectedMessageIds.has(msg._id) ? "checked" : ""}
        onchange="toggleMessageSelection('${msg._id}', this.checked)">
</td>

<td>${msg.name}</td>

<td>${msg.email}</td>

<td>${msg.phone || "-"}</td>

<td>${msg.subject}</td>

<td>${msg.date || "-"}</td>

<td>

<span class="status-badge status-${statusClass}">

${msg.status || "Unread"}

</span>

</td>

<td class="action-buttons">

<button
class="view-btn"
onclick="viewMessage('${msg._id}')" title="View full message">

<i class="fas fa-eye"></i>

</button>

<button
class="respond-btn"
onclick="openReplyModal('${msg._id}')" title="Reply">

<i class="fas fa-reply"></i> Reply

</button>

<button
class="delete-btn"
onclick="deleteMessage('${msg._id}')" title="Delete">

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

function toggleMessageSelection(id, checked){

    if(checked){
        selectedMessageIds.add(id);
    } else {
        selectedMessageIds.delete(id);
    }

    displayMessages(search ? search.value : "");

}

function updateSelectAllState(visibleList){

    if(!selectAllCheckbox) return;

    const allSelected = visibleList.length > 0 &&
        visibleList.every(m => selectedMessageIds.has(m._id));

    selectAllCheckbox.checked = allSelected;

}

function updateBulkBar(){

    if(!bulkBar) return;

    const count = selectedMessageIds.size;

    if(count > 0){
        bulkBar.classList.add("active");
    } else {
        bulkBar.classList.remove("active");
    }

    if(bulkCountEl){
        bulkCountEl.textContent = count;
    }

}

if(selectAllCheckbox){

    selectAllCheckbox.addEventListener("change", function(){

        const keyword = (search ? search.value : "").toLowerCase();

        const visible = messages.filter(msg =>
            msg.name.toLowerCase().includes(keyword) ||
            msg.email.toLowerCase().includes(keyword)
        );

        if(this.checked){
            visible.forEach(m => selectedMessageIds.add(m._id));
        } else {
            visible.forEach(m => selectedMessageIds.delete(m._id));
        }

        displayMessages(search ? search.value : "");

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

    const modal = document.getElementById("viewMessageModal");

    if(modal){

        currentViewedMessageId = msg._id;

        document.getElementById("viewMsgName").textContent = msg.name;
        document.getElementById("viewMsgEmail").textContent = msg.email;
        document.getElementById("viewMsgPhone").textContent = msg.phone || "-";
        document.getElementById("viewMsgSubject").textContent = msg.subject;
        document.getElementById("viewMsgBody").textContent = msg.message;

        const replySection = document.getElementById("viewMsgReplySection");

        if(msg.replyMessage){
            replySection.style.display = "block";
            document.getElementById("viewMsgReply").textContent = msg.replyMessage;
        } else {
            replySection.style.display = "none";
        }

        modal.classList.add("active");

    }

}

function closeViewMessageModal(){

    const modal = document.getElementById("viewMessageModal");
    if(modal) modal.classList.remove("active");

}

/*==========================================
REPLY MODAL (single message)
==========================================*/

let replyTargetId = null;
let replyTargetIds = null; // used for bulk reply

function openReplyModal(id){

    replyTargetId = id;
    replyTargetIds = null;

    const msg = messages.find(m => m._id === id);
    if(!msg) return;

    const modal = document.getElementById("replyModal");
    if(!modal) return;

    document.getElementById("replyModalTitle").textContent = `Reply to ${msg.name}`;
    document.getElementById("replyModalSubtitle").textContent = msg.email;
    document.getElementById("replyText").value = "";

    modal.classList.add("active");

}

function openBulkReplyModal(){

    if(selectedMessageIds.size === 0) return;

    replyTargetId = null;
    replyTargetIds = Array.from(selectedMessageIds);

    const modal = document.getElementById("replyModal");
    if(!modal) return;

    document.getElementById("replyModalTitle").textContent = `Reply to ${replyTargetIds.length} selected message(s)`;
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
        sendBtn.textContent = "Sending...";
    }

    try{

        let response, data;

        if(replyTargetIds && replyTargetIds.length){

            response = await fetch(`${API_URL}/bulk-reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: replyTargetIds, replyMessage })
            });

            data = await response.json();

            selectedMessageIds.clear();

        } else if (replyTargetId) {

            response = await fetch(`${API_URL}/${replyTargetId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ replyMessage })
            });

            data = await response.json();

        }

        showToast(data.message || "Reply sent.");

        closeReplyModal();
        await loadMessages();

    }catch(error){

        console.error(error);
        showToast("Could not send reply.");

    }finally{

        if(sendBtn){
            sendBtn.disabled = false;
            sendBtn.textContent = "Send Reply";
        }

    }

}

/*==========================================
BULK: MARK RESPONDED / DELETE
==========================================*/

async function bulkMarkResponded(){

    if(selectedMessageIds.size === 0) return;

    try{

        const response = await fetch(`${API_URL}/bulk-status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: Array.from(selectedMessageIds), status: "Responded" })
        });

        const data = await response.json();

        showToast(data.message);

        selectedMessageIds.clear();
        await loadMessages();

    }catch(error){

        console.error(error);
        showToast("Could not update messages.");

    }

}

async function bulkDeleteMessages(){

    if(selectedMessageIds.size === 0) return;

    showConfirm(`Delete ${selectedMessageIds.size} selected message(s)?`, async () => {

        try{

            const response = await fetch(`${API_URL}/bulk`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedMessageIds) })
            });

            const data = await response.json();

            showToast(data.message);

            selectedMessageIds.clear();
            await loadMessages();

        }catch(error){

            console.error(error);
            showToast("Could not delete messages.");

        }

    }, { title: "Delete Messages", confirmText: "Delete", danger: true });

}

/*==========================================
DELETE MESSAGE (single)
==========================================*/

async function deleteMessage(id){

    showConfirm("Delete this message?", async () => {

        try{

            const response = await fetch(`${API_URL}/${id}`,{

                method:"DELETE"

            });

            const data = await response.json();

            showToast(data.message);

            selectedMessageIds.delete(id);

            await loadMessages();

        }catch(error){

            console.error(error);

            showToast("Could not delete message.");

        }

    }, { title: "Delete Message", confirmText: "Delete", danger: true });

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

    loadNotifications();
    loadMessages();

});
