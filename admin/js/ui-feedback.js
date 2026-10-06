/*==========================================
FOODCHAIN ADMIN — CUSTOM UI FEEDBACK
Replaces the browser's built-in alert()/confirm()
with branded, animated toast notifications and a
confirm dialog, matching the rest of the admin UI.

Loaded on every admin page (right after
auth-fetch.js). Exposes two globals:

  showToast(message, type)
      type: "success" | "error" | "info" (optional —
      auto-detected from the message if omitted)

  showConfirm(message, onConfirm, options)
      options: { title, confirmText, cancelText, danger }
      onConfirm is called only if the user confirms.
==========================================*/

(function () {

    /*==========================================
    TOASTS
    ==========================================*/

    let toastContainer = null;

    function getToastContainer() {

        if (toastContainer && document.body.contains(toastContainer)) {
            return toastContainer;
        }

        toastContainer = document.createElement("div");
        toastContainer.className = "fc-toast-container";
        document.body.appendChild(toastContainer);

        return toastContainer;

    }

    function guessToastType(message) {

        const text = String(message || "").toLowerCase();

        const negativeHints = [
            "could not", "couldn't", "can't", "cannot", "fail",
            "error", "invalid", "incorrect", "expired", "not found",
            "required", "denied", "not able", "not authenticated",
            "session expired"
        ];

        return negativeHints.some(hint => text.includes(hint)) ? "error" : "success";

    }

    const TOAST_ICONS = {
        success: "fa-circle-check",
        error: "fa-circle-exclamation",
        info: "fa-circle-info"
    };

    window.showToast = function (message, type) {

        const resolvedType = type || guessToastType(message);

        const container = getToastContainer();

        const toast = document.createElement("div");
        toast.className = `fc-toast fc-toast-${resolvedType}`;

        toast.innerHTML = `
            <i class="fas ${TOAST_ICONS[resolvedType] || TOAST_ICONS.info} fc-toast-icon"></i>
            <span class="fc-toast-message"></span>
            <button class="fc-toast-close" aria-label="Dismiss">
                <i class="fas fa-xmark"></i>
            </button>
            <span class="fc-toast-progress"></span>
        `;

        // Set text via textContent to avoid ever interpreting message as HTML
        toast.querySelector(".fc-toast-message").textContent = message;

        container.appendChild(toast);

        // Force reflow so the enter transition actually plays
        void toast.offsetWidth;
        toast.classList.add("fc-toast-in");

        const DURATION = 4500;
        let dismissTimer = setTimeout(() => dismissToast(toast), DURATION);

        toast.querySelector(".fc-toast-close").addEventListener("click", () => {
            clearTimeout(dismissTimer);
            dismissToast(toast);
        });

        function dismissToast(el) {

            el.classList.remove("fc-toast-in");
            el.classList.add("fc-toast-out");

            el.addEventListener("transitionend", () => {
                el.remove();
            }, { once: true });

        }

        return toast;

    };

    /*==========================================
    INFO DIALOG (view-details popups — single "Close" button)
    ==========================================*/

    window.showInfo = function (title, message) {

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay fc-confirm-overlay";

        overlay.innerHTML = `
            <div class="modal-box fc-confirm-box">
                <div class="modal-header">
                    <h3></h3>
                    <button class="modal-close" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="fc-confirm-message" style="white-space: pre-line;"></p>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary fc-confirm-ok">Close</button>
                </div>
            </div>
        `;

        overlay.querySelector(".modal-header h3").textContent = title;
        overlay.querySelector(".fc-confirm-message").textContent = message;

        document.body.appendChild(overlay);

        void overlay.offsetWidth;
        overlay.classList.add("active");

        function close() {
            overlay.classList.remove("active");
            overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
        }

        overlay.querySelector(".modal-close").addEventListener("click", close);
        overlay.querySelector(".fc-confirm-ok").addEventListener("click", close);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) close();
        });

    };

    /*==========================================
    CONFIRM DIALOG
    ==========================================*/

    window.showConfirm = function (message, onConfirm, options) {

        options = options || {};

        const title = options.title || "Please Confirm";
        const confirmText = options.confirmText || "Confirm";
        const cancelText = options.cancelText || "Cancel";
        const danger = !!options.danger;

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay fc-confirm-overlay";

        overlay.innerHTML = `
            <div class="modal-box fc-confirm-box">
                <div class="modal-header">
                    <h3></h3>
                    <button class="modal-close" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="fc-confirm-message"></p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary fc-confirm-cancel"></button>
                    <button class="btn-primary fc-confirm-ok"></button>
                </div>
            </div>
        `;

        overlay.querySelector(".modal-header h3").textContent = title;
        overlay.querySelector(".fc-confirm-message").textContent = message;
        overlay.querySelector(".fc-confirm-cancel").textContent = cancelText;
        overlay.querySelector(".fc-confirm-ok").textContent = confirmText;

        if (danger) {
            overlay.querySelector(".fc-confirm-ok").classList.add("btn-danger");
        }

        document.body.appendChild(overlay);

        void overlay.offsetWidth;
        overlay.classList.add("active");

        function close() {
            overlay.classList.remove("active");
            overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
        }

        overlay.querySelector(".modal-close").addEventListener("click", close);
        overlay.querySelector(".fc-confirm-cancel").addEventListener("click", close);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) close();
        });

        overlay.querySelector(".fc-confirm-ok").addEventListener("click", () => {
            close();
            if (typeof onConfirm === "function") onConfirm();
        });

    };

/*==========================================
STAGGERED "ONE-BY-ONE" ENTRANCE ANIMATION
Applies a sequential fade-up to a list of
elements (table rows, cards) whenever content
is (re)rendered — gives lists a premium,
choreographed feel instead of popping in at once.

Usage: staggerIn(containerEl, "tr")
       staggerIn(containerEl) // defaults to direct children
==========================================*/

window.staggerIn = function (container, selector) {

    if (!container) return;

    const items = selector
        ? container.querySelectorAll(selector)
        : container.children;

    Array.prototype.forEach.call(items, (el, index) => {

        el.classList.remove("fc-stagger-in");
        el.style.animationDelay = "";

        // Force reflow so re-adding the class replays the animation
        void el.offsetWidth;

        el.style.animationDelay = `${Math.min(index, 14) * 45}ms`;
        el.classList.add("fc-stagger-in");

    });

};

})();
