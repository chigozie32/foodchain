/*==========================================
FOODCHAIN ADMIN — AUTH-AWARE FETCH

Loaded FIRST on every admin page (before any
other admin script). It patches the global
fetch() so that any request going to the
FoodChain API automatically carries the
logged-in admin's token — no other file needs
to be touched to add the header.

It also catches 401 responses from the API
(expired/invalid session) and bounces the
admin back to the login page automatically.
==========================================*/

(function () {

    const API_HOST = "foodchain-api.onrender.com";

    const originalFetch = window.fetch.bind(window);

    /*==========================================
    SLIM TOP LOADING BAR
    Shows automatically while any API request is
    in flight — no changes needed anywhere else.
    ==========================================*/

    let activeRequests = 0;
    let loadingBar = null;
    let hideTimer = null;

    function getLoadingBar() {

        if (loadingBar && document.body.contains(loadingBar)) return loadingBar;

        loadingBar = document.createElement("div");
        loadingBar.className = "fc-loading-bar";
        document.body.appendChild(loadingBar);

        return loadingBar;

    }

    function startLoading() {

        activeRequests++;

        const bar = getLoadingBar();

        clearTimeout(hideTimer);

        bar.classList.remove("fc-loading-bar-done");
        bar.classList.add("fc-loading-bar-active");

    }

    function stopLoading() {

        activeRequests = Math.max(0, activeRequests - 1);

        if (activeRequests > 0) return;

        const bar = getLoadingBar();

        bar.classList.add("fc-loading-bar-done");

        hideTimer = setTimeout(() => {
            bar.classList.remove("fc-loading-bar-active", "fc-loading-bar-done");
        }, 300);

    }

    window.fetch = function (input, init) {

        const url = typeof input === "string" ? input : (input && input.url) || "";

        const isApiCall = url.includes(API_HOST);

        if (isApiCall) {

            const token = localStorage.getItem("adminToken");

            init = init || {};
            init.headers = init.headers || {};

            // Normalize Headers instances to a plain object so we can safely add to them
            if (init.headers instanceof Headers) {

                const plain = {};
                init.headers.forEach((value, key) => { plain[key] = value; });
                init.headers = plain;

            }

            if (token && !init.headers["Authorization"] && !init.headers["authorization"]) {
                init.headers["Authorization"] = `Bearer ${token}`;
            }

        }

        if (isApiCall) {
            startLoading();
        }

        return originalFetch(input, init).then((response) => {

            if (isApiCall) {

                stopLoading();

                if (response.status === 401) {

                    const isLoginRequest = url.endsWith("/admin/login");

                    if (!isLoginRequest) {

                        localStorage.removeItem("adminToken");
                        localStorage.removeItem("adminLoggedIn");
                        localStorage.removeItem("admin");

                        if (!window.location.pathname.endsWith("login.html")) {
                            window.location.href = "login.html";
                        }

                    }

                }

            }

            return response;

        }).catch((error) => {

            if (isApiCall) stopLoading();

            throw error;

        });

    };

})();
