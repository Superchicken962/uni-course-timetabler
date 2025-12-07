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
        this.#el.querySelector(".modal-body").innerHTML = html;
    }

    setFooter(html) {
        this.#el.querySelector(".modal-footer").innerHTML = html;
    }

    /**
     * @param { String } selectors 
     * @returns { HTMLElement | null } 
     */
    querySelector(selectors) {
        this.#el.querySelector(selectors);
    }

    show() {
        console.log(this.#bsModal);
        this.#bsModal.show();
    }
}