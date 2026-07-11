/*==========================================
FOODCHAIN INSTALL APP
==========================================*/

let deferredPrompt = null;

const installButton = document.getElementById("installButton");

// Hide install UI by default
if (installButton) {
    installButton.style.display = "none";
}

// Detect if app is already installed
window.addEventListener("beforeinstallprompt", (e) => {

    // Already installed? Never show popup.
    if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    ) {
        return;
    }

    e.preventDefault();

    deferredPrompt = e;

    const installPopup = document.getElementById("installPopup");

    if (installPopup) {
        installPopup.style.display = "flex";
    }

    if (installButton) {
        installButton.style.display = "inline-flex";
    }

});

window.addEventListener("appinstalled", () => {

    deferredPrompt = null;

    const installPopup =
        document.getElementById("installPopup");

    if (installPopup) {
        installPopup.style.display = "none";
    }

});

/*==========================================
CLOSE INSTALL POPUP (MOBILE)
==========================================*/

const installPopup =
document.getElementById("installPopup");

if (installPopup) {

    document.addEventListener("click", (e) => {

        // Only on phones
        if (window.innerWidth > 768) return;

        // Don't close if user clicked inside popup
        if (installPopup.contains(e.target)) return;

        installPopup.style.display = "none";

    });

}
/*==========================================
INSTALL BUTTON
==========================================*/

if (installButton) {

    installButton.addEventListener("click", async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        console.log("Install result:", outcome);

        deferredPrompt = null;

        const installPopup = document.getElementById("installPopup");

if (installPopup) {

    installPopup.style.display = "none";

}

    });

}


/*==========================================
REGISTER SERVICE WORKER
==========================================*/

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js")
            .then(() => {

                console.log("Service Worker Registered");

            })
            .catch((error) => {

                console.error(error);

            });

    });

}

const closeInstallPopup =
document.getElementById("closeInstallPopup");

if (closeInstallPopup) {

    closeInstallPopup.addEventListener("click", () => {

        document.getElementById("installPopup").style.display = "none";

    });

}

/*==========================================
HIDE POPUP IF APP IS ALREADY INSTALLED
==========================================*/

window.addEventListener("DOMContentLoaded", () => {

    const installPopup =
        document.getElementById("installPopup");

    const installed =
        window.matchMedia("(display-mode: standalone").matches ||
        window.navigator.standalone === true;

    if (installed && installPopup) {

        installPopup.style.display = "none";

    }

});