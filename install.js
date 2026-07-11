/*==========================================
FOODCHAIN INSTALL
==========================================*/

let deferredPrompt = null;

const installPopup = document.getElementById("installPopup");
const installButton = document.getElementById("installButton");
const closeInstallPopup = document.getElementById("closeInstallPopup");

/*==========================================
CHECK IF RUNNING AS PWA
==========================================*/

const runningAsPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

/*==========================================
IF OPENED AS PWA
==========================================*/

if (runningAsPWA) {

    if (installPopup) {
        installPopup.style.display = "none";
    }

}

/*==========================================
BEFORE INSTALL PROMPT
==========================================*/

window.addEventListener("beforeinstallprompt", (e) => {

    if (runningAsPWA) return;

    e.preventDefault();

    deferredPrompt = e;

    if (installPopup) {
        installPopup.style.display = "flex";
    }

    if (installButton) {
        installButton.style.display = "inline-flex";
    }

});

/*==========================================
INSTALL BUTTON
==========================================*/

if (installButton) {

    installButton.addEventListener("click", async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {

            installButton.style.display = "none";

        }

        deferredPrompt = null;

    });

}

/*==========================================
APP INSTALLED
==========================================*/

window.addEventListener("appinstalled", () => {

    deferredPrompt = null;

    if (installButton) {
        installButton.style.display = "none";
    }

});

/*==========================================
CLOSE POPUP
==========================================*/

if (closeInstallPopup) {

    closeInstallPopup.addEventListener("click", () => {

        if (installPopup) {
            installPopup.style.display = "none";
        }

    });

}

/*==========================================
CLICK OUTSIDE TO CLOSE (PHONE)
==========================================*/

if (installPopup) {

    document.addEventListener("click", (e) => {

        if (window.innerWidth > 768) return;

        if (installPopup.contains(e.target)) return;

        installPopup.style.display = "none";

    });

}

/*==========================================
REGISTER SERVICE WORKER
==========================================*/

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("service-worker.js")
            .then(() => console.log("Service Worker Registered"))
            .catch(console.error);

    });

}