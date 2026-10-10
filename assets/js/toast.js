/*==========================================
FOODCHAIN — CUSTOM UI FEEDBACK (PUBLIC SITE)
Replaces the browser's built-in alert() with a
branded, animated toast notification — used by
the newsletter, contact, and partnership forms.

Loaded on every public page, before contact.js /
main.js / newsletter.js. Exposes:

  showToast(message, type)
      type: "success" | "error" | "info" (optional —
      auto-detected from the message if omitted)
==========================================*/

(function () {

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
            "error", "invalid", "incorrect", "please", "required",
            "not found", "already", "denied"
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

        // Set text via textContent so a message is never interpreted as HTML
        toast.querySelector(".fc-toast-message").textContent = message;

        container.appendChild(toast);

        // Force reflow so the enter transition actually plays
        void toast.offsetWidth;
        toast.classList.add("fc-toast-in");

        const DURATION = 7000;
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

})();