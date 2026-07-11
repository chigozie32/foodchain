/*==========================================
FOODCHAIN INSTALL APP
==========================================*/

let deferredPrompt = null;

const installButton = document.getElementById("installButton");

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    if (installButton) {

        installButton.style.display = "inline-flex";

    }

});

window.addEventListener("appinstalled", () => {

    console.log("FoodChain installed.");

    deferredPrompt = null;

    if (installButton) {

        installButton.style.display = "none";

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

        installButton.style.display = "none";

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