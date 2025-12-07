class Modal {
    #el;
    #bsModal;

    constructor(id) {
        this.#el = document.querySelector(`#${id}`) || document.createElement("div");
        this.#el.id = id;

        this.#el.className = "modal fade";
        this.#el.setAttribute("tabindex", "-1");

        this.#el.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Modal title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body"></div>

                    <div class="modal-footer"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.#el);
        this.#bsModal = new bootstrap.Modal(this.#el);
    }

    setTitle(title) {
        this.#el.querySelector(".modal-title").textContent = title;
    }

    setBody(html) {
        const body = this.#el.querySelector(".modal-body");
        if (!body) return;

        body.innerHTML = html;
    }

    setFooter(html) {
        const footer = this.#el.querySelector(".modal-footer");
        if (!footer) return;
        
        footer.innerHTML = html;
    }

    /**
     * Completely removes the body element. Cannot be undone.
     */
    removeBody() {
        this.#el.querySelector(".modal-body")?.remove();
    }

    /**
     * Completely removes the footer element. Cannot be undone.
     */
    removeFooter() {
        this.#el.querySelector(".modal-footer")?.remove();
    }

    /**
     * @param { String } selectors 
     * @returns { HTMLElement | null } 
     */
    querySelector(selectors) {
        return this.#el.querySelector(selectors);
    }

    /**
     * @param { String } selectors 
     * @returns { NodeListOf<HTMLElement> | null } 
     */
    querySelectorAll(selectors) {
        return this.#el.querySelectorAll(selectors);
    }

    show() {
        this.#bsModal.show();
    }

    close() {
        this.#bsModal.hide();
    }
}

class ErrorModal extends Modal {
    /**
     * Error Modal. Opens automatically when created.
     * 
     * @param { String } title - Error name / title. 
     * @param { String } description - Error message / description.
     * @param { Boolean? } startHidden - Should the modal start hidden? (def. false)
     */
    constructor(name, message, startHidden = false) {
        super("ErrorBox");
        this.setTitle(name);

        this.setBody(`<p>${message}</p>`);

        // If no message is provided, remove the body as nothing will be shown anyway.
        if (!message) {
            this.removeBody();
        }

        this.removeFooter();

        if (!startHidden) this.show();
    }
}