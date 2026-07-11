/*==========================================
FOODCHAIN INSTALL APP
==========================================*/

let deferredPrompt = null;

const installPopup = document.getElementById("installPopup");
const installButton = document.getElementById("installButton");
const closeInstallPopup = document.getElementById("closeInstallPopup");

/*------------------------------------------
CHECK IF APP IS ALREADY INSTALLED
------------------------------------------*/

const isInstalled =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

// Hide everything if already installed
if (isInstalled) {

    if (installPopup) {
        installPopup.style.display = "none";
    }

} else {

    /*------------------------------------------
    INSTALL PROMPT
    ------------------------------------------*/

    window.addEventListener("beforeinstallprompt", (e) => {

        e.preventDefault();

        deferredPrompt = e;

        if (installPopup) {
            installPopup.style.display = "flex";
        }

        if (installButton) {
            installButton.style.display = "inline-flex";
        }

    });

}

/*------------------------------------------
INSTALL BUTTON
------------------------------------------*/

if (installButton) {

    installButton.addEventListener("click", async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        if (installPopup) {
            installPopup.style.display = "none";
        }

    });

}

/*------------------------------------------
APP INSTALLED
------------------------------------------*/

window.addEventListener("appinstalled", () => {

    deferredPrompt = null;

    if (installPopup) {
        installPopup.style.display = "none";
    }

});

/*------------------------------------------
CLOSE POPUP ON MOBILE
------------------------------------------*/

if (installPopup) {

    document.addEventListener("click", (e) => {

        if (window.innerWidth > 768) return;

        if (installPopup.contains(e.target)) return;

        installPopup.style.display = "none";

    });

}

/*------------------------------------------
CLOSE BUTTON
------------------------------------------*/

if (closeInstallPopup) {

    closeInstallPopup.addEventListener("click", () => {

        if (installPopup) {
            installPopup.style.display = "none";
        }

    });

}

/*------------------------------------------
REGISTER SERVICE WORKER
------------------------------------------*/

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js")
            .then(() => console.log("Service Worker Registered"))
            .catch(err => console.error(err));

    });

}