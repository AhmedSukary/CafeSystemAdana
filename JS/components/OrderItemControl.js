import { UpdateItem, RemoveItem, GetAllExtraDetailsOrderItem } from "../features/orderService.js";
class OrderItemControl extends HTMLElement {

    constructor() {
        super();
        this._item = null;
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="order-item-control">
                <div class="info">
                    <div class="details">
                        <span>1</span>
                        <span class="name"></span>
                        <span class="price"></span>
                    </div>
                    <div class="controls">
                        <button class="add"><img src="imgs/25304.png" alt=""></button>
                        <button class="cansel"><img src="imgs/cansel.png" alt=""></button>
                        <button class="delete"><img src="imgs/1345874.png" alt=""></button>
                    </div>
                </div>
                <input id="" type="text" value="">
            </div>
        `;

        this.querySelector(".add").addEventListener("click", () => this.addExtra());

        this.querySelector(".cansel").addEventListener("click", () => this.cansel());

        this.querySelector(".delete").addEventListener("click", () => this.deleteItem());

        this.updateUI();
    }

    set item(value) {
      
        this._item = value;
    }

    updateUI() {
        const nameElement = this.querySelector(".name").textContent = this._item.name;
        const priceElement = this.querySelector(".price").textContent = this._item.price + "₺";
        const inputElement = this.querySelector("input").value = this._item.description ?? "";
    }

    async addExtra() {
        try {
            await UpdateItem(this._item.id, this._item.orderId, this._item.name, this._item.description, this._item.price, this._item.printerName, this._item.status);
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }

    async cansel() {
        try {
            await UpdateItem(this._item.id, this._item.orderId, this._item.name, this._item.description, this._item.price, this._item.printerName, "cansel");
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }

    async deleteItem() {
        try {
            await RemoveItem(this._item.id);
            this.remove();
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }
}

customElements.define("order-item-control", OrderItemControl);
