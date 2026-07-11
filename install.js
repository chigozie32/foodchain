/*==========================================
FOODCHAIN INSTALL APP
==========================================*/

let deferredPrompt = null;

const installButton = document.getElementById("installButton");

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    if (installButton) {

        const installPopup = document.getElementById("installPopup");

    if (installPopup) {

        installPopup.style.display = "block";

}
}
});

window.addEventListener("appinstalled", () => {

    console.log("FoodChain installed.");

    deferredPrompt = null;

    const installPopup = document.getElementById("installPopup");

if (installPopup) {

    const installPopup = document.getElementById("installPopup");

if (installPopup) {

    installPopup.style.display = "none";

}

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