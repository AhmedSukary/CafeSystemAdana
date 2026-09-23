import { getAllByCategoryById } from "./features/productService.js";
import { getAllTables, UpdateTable, getTableById } from "./features/tableService.js";
import {
    GetTableUnpaidOrdersByTableNumber,
    UpdateOrder,
    GetAllOrderItemsByOrderId,
    AddNewOrder,
    AddOrderToPrint,
    AddOrderItem,
    UpdateItem,
    GetAllExtraDetailsOrderItem,
    GetOrderItemById
} from "./features/orderService.js";

const params = new URLSearchParams(window.location.search);
const UseingSystemName = params.get("UseingSystemName");
document.getElementById("useingSystemName").innerText = UseingSystemName;

class ClassOrder {
    constructor(id, status, payment, orderedName, total, tableNumber, createdAt) {
        this.id = id;
        this.status = status;
        this.payment = payment;
        this.orderedName = orderedName;
        this.total = total;
        this.tableNumber = tableNumber;
        this.createdAt = createdAt;
    }

    async Add() {
        try {

            let NewOrder = await AddNewOrder(UseingSystemName, currentTable.number);
            this.id = NewOrder.id;
            this.status = NewOrder.status;
            this.payment = NewOrder.payment;
            this.orderedName = NewOrder.orderedName;
            this.total = NewOrder.total;
            this.tableNumber = NewOrder.tableNumber;
            this.createdAt = NewOrder.createdAt;
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }

    async Save() {
        try {
            await UpdateOrder(this.Id, this.Status, this.Payment, this.OrderedName, this.Total, this.TableNumber, this.CreatedAt)
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }
}

class ClassOrderItem {
    constructor(id, orderId, name, description, price, printerName, status) {
        this.id = id;
        this.orderId = orderId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.printerName = printerName;
        this.status = status;
    }

    async Save() {
        try {
            const NewOrderItem = await AddOrderItem(this.orderId, this.name, this.description, this.price, this.printerName, this.status);
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }
}

let currentOrder = null;
let orderItems = [];
let currentTable;

const TableNumberEle = document.getElementById("tableNumber");
const OrderTotalAmountEle = document.getElementById("orderTotalAmount");
const Notes = document.getElementById("notes");
const SendOrderEle = document.getElementById("sendOrder");
const CanselOrderEle = document.getElementById("canselOrder");
const AddExtraToOrder = document.getElementById("addExtraToOrder");
const Logout = document.getElementById("logout");
const OrderItemsEle = document.getElementById("orderItems");
const ProductsEle = document.getElementById("products");
const TablesEle = document.getElementById("tables");
const TableBox = document.getElementById("tableBox");
const EmptyTablesBox = document.getElementById("emptyTablesBox");
const Loading = document.getElementById("loading");
const ExtraOrderItemBox = document.getElementById("extraOrderItemBox");
const CategoriesBtns = document.querySelectorAll(".categoryBtn");

await renderTables();

await renderProductsByCategoryById(1);

await categorySelect();

async function categorySelect() {
    for (const btn of CategoriesBtns) {
        btn.addEventListener("click", async () => {
            CategoriesBtns.forEach(e => e.classList.remove("active"));
            btn.classList.add("active");
            await renderProductsByCategoryById(btn.innerText);
        });
    }
}

function addNewOrder() {
    currentOrder = new ClassOrder(-1, "", "", "", 0, 0, null);
}

function addOrderItem(name, price, quantity, printerName) {
    if (currentTable == null)
        return alert("ℹ️ Please select table befor adding any items to order");

    try {
        if (currentOrder == null) {
            addNewOrder();
            for (let i = 0; i < quantity; i++) {
                let orderItem = new ClassOrderItem(crypto.randomUUID(), currentOrder.id, name, "", price, printerName, "Processing");
                orderItems.push(orderItem);
            }
            renderOrderItems();
            return;
        }
        for (let i = 0; i < quantity; i++) {
            let orderItem = new ClassOrderItem(crypto.randomUUID(), currentOrder.id, name, "", price, printerName, "Processing");
            orderItems.push(orderItem);
        }
        renderOrderItems();
    }
    catch (err) {
        alert("⚠️ " + err.message);
    }
}

function renderOrderItems() {
    currentOrder.total = 0;
    OrderItemsEle.innerHTML = "";

    for (const i of orderItems) {
        OrderItemsEle.insertAdjacentHTML("beforeend", `
            <div class="item">
                <div class="info">
                    <div class="details">
                        <span>1</span>
                        <span>${i.name}</span>
                        <span>${i.price}₺</span>
                    </div>
                    <div class="controls">                       
                        <button id="remove-item-${i.id}"><img src="imgs/delete.png" alt=""></button>
                    </div>
                </div>
                <div class="description">${i.description}</div>
            </div>      
        `);
        document.getElementById(`remove-item-${i.id}`).addEventListener("click", async () => {
            const index = orderItems.findIndex(x => x.id === i.id);
            if (index !== -1) {
                orderItems.splice(index, 1);
            }
            renderOrderItems();
        });
        currentOrder.total += i.price;
    }
    OrderTotalAmountEle.innerText = currentOrder.total + "₺";
}

async function renderProductsByCategoryById(id) {
    const products = await getAllByCategoryById(id);
    ProductsEle.innerHTML = "";
    for (const p of products) {
        ProductsEle.insertAdjacentHTML("beforeend", `
            <div class="product" id="${p.id}">
                <span class="name">${p.name}</span>
                <span class="price">${p.price}₺</span>
                <div class="controls">
                    <button id="increase-item-${p.id}"><img src="imgs/add.png" alt=""></button>
                    <span id="quantity-item-${p.id}" class="count">1</span>
                    <button id="decrease-item-${p.id}"><img src="imgs/substract.png" alt=""></button>        
                </div>
                <button id="send-item-${p.id}" class="send"><img src="imgs/turn-right.png" alt=""></button>
            </div>       
        `);

        document.getElementById(`increase-item-${p.id}`).addEventListener("click", async () => {
            let count = document.getElementById(`quantity-item-${p.id}`).innerHTML;
            count++;
            document.getElementById(`quantity-item-${p.id}`).innerHTML = count;
        });

        document.getElementById(`decrease-item-${p.id}`).addEventListener("click", async () => {
            let count = document.getElementById(`quantity-item-${p.id}`).innerHTML;
            if (count != 1) {
                count--;
                document.getElementById(`quantity-item-${p.id}`).innerHTML = count;
            }
            return;
        });

        document.getElementById(`send-item-${p.id}`).addEventListener("click", async () => {
            let count = document.getElementById(`quantity-item-${p.id}`).innerHTML;
            await addOrderItem(p.name, p.price, count, p.printerName);
            renderProductsByCategoryById(id);
        });
    }
}

async function renderTables() {
    const tables = await getAllTables();
    TablesEle.innerHTML = "";
    for (const t of tables) {
        TablesEle.insertAdjacentHTML("beforeend", `
            <div id="table-${t.id}" class="table ${t.status}">
                <button id="button-${t.id}"> <img src="imgs/table.png" alt="">${t.number}</button>       
            </div>
        `);

        document.getElementById(`button-${t.id}`).addEventListener("click", async () => {
            currentTable = await getTableById(t.id);

            document.querySelectorAll(".table").forEach(t => t.classList.remove("Selected"));

            if (!document.getElementById(`table-${t.id}`).classList.contains("Processing") &&
                !document.getElementById(`table-${t.id}`).classList.contains("Processed")) {
                document.getElementById(`table-${t.id}`).classList.add("Selected");
            }

            if (currentTable.status != "Empty") {
                await renderTableBox(currentTable);
            }
            else {
                TableNumberEle.innerText = currentTable.number;
            }
        });
    }
}

async function renderTableBox(table) {
    currentTable = table;
    TableBox.innerHTML = "";
    TableBox.classList.remove("hidden");
    TableBox.insertAdjacentHTML("beforeend", `
        <div class="closeBtn"><button id="closeBtn"><img src="imgs/cross.png" alt=""></button></div>
        <div class="copyToEmptyTable"><button id="copyToEmptyTableBtn"><img src="imgs/copy.png" alt=""></button></div>
        <div class="table ${table.status}"> <img src="imgs/table.png" alt="">${table.number}</div>    
    `);
    const orders = await GetTableUnpaidOrdersByTableNumber(table.number);
    let totalAmount = 0;
    for (const order of orders) {
        TableBox.insertAdjacentHTML("beforeend", `
            <div class="order">
                <span class="orderId">ID: ${order.id}</span>
                <p>Time: ${formatShortDateTime(order.createdAt)}</p>
                <div id="orderItems-${order.id}" class="orderItems"></div>
                <div id="totalOfOrder-${order.id}" class="total">Amount: ${order.total}₺</div>
            </div>
        `);

        const Items = await GetAllOrderItemsByOrderId(order.id);
        let orderTotal = 0;
        for (const Item of Items) {
            if (Item.status === "Canseled") {
                document.getElementById(`orderItems-${order.id}`).insertAdjacentHTML("beforeend", `
                <div class="item ${Item.status}">
                    <div class="info">
                        <div class="details">
                            <span>1</span>
                            <span>${Item.name}</span>
                            <span>-${Item.price}₺</span>
                            
                        </div>
                        <div class="item-controls">
                            <span>Canseled</span>                       
                        </div>
                    </div>
                    <div class="description">${Item.description}</div>
                </div>
                `);
                continue;
            }
            orderTotal += Item.price;
            document.getElementById(`orderItems-${order.id}`).insertAdjacentHTML("beforeend", `
                <div class="item ${Item.status}">
                    <div class="info">
                        <div class="details">
                            <span>1</span>
                            <span>${Item.name}</span>
                            <span>${Item.price}₺</span>
                        </div>
                        <div class="item-controls">                       
                            <button id="cansel-${Item.id}"><img src="imgs/forbidden.png" alt=""></button>
                            <button id="addExtra-${Item.id}"><img src="imgs/plus.png" alt=""></button>
                            <button id="processed-${Item.id}"><img src="imgs/checkmark.png" alt=""></button>
                        </div>
                    </div>
                    <div class="description">${Item.description}</div>
                </div>
            `);

            document.getElementById(`cansel-${Item.id}`).addEventListener("click", async () => {
                try {
                    Loading.classList.remove("hidden");
                    await UpdateItem(Item.id, Item.orderId, Item.name, Item.description, Item.price, Item.printerName, "Canseled");
                    renderTableBox(table);
                    Loading.classList.add("hidden");
                }
                catch (err) {
                    alert("⚠️ " + err.message);
                }
            });

            document.getElementById(`addExtra-${Item.id}`).addEventListener("click", async () => {
                await AddExtraToOrderItem(Item.id, table);
            });

            document.getElementById(`processed-${Item.id}`).addEventListener("click", async () => {
                try {
                    Loading.classList.remove("hidden");
                    await UpdateItem(Item.id, Item.orderId, Item.name, Item.description, Item.price, Item.printerName, "Processed");
                    renderTableBox(table);
                    Loading.classList.add("hidden");
                }
                catch (err) {
                    alert("⚠️ " + err.message);
                }
            });
        }
        document.getElementById(`totalOfOrder-${order.id}`).innerText = `Amount: ${orderTotal}₺`;
        totalAmount += orderTotal;
    }

    document.getElementById("closeBtn").addEventListener("click", () => {
        currentTable = null;
        currentOrder = null;
        TableNumberEle.innerHTML = "???";
        TableBox.classList.add("hidden");
    });

    document.getElementById("copyToEmptyTableBtn").addEventListener("click", async () => {
        await renderEmptyTablesBox(orders, currentTable);
    });

    if (table.status == "Processed") {
        TableBox.insertAdjacentHTML("beforeend", `
            <div class="controls">
                <button id="addExtra"><img src="imgs/plus.png" alt=""></button>
            </div>  
        `);

        document.getElementById("addExtra").addEventListener("click", () => {
            TableNumberEle.innerText = currentTable.number;
            TableBox.innerHTML = "";
            TableBox.classList.add("hidden");
        });
    }

    if (table.status == "Processing") {
        TableBox.insertAdjacentHTML("beforeend", `
            <div class="controls">
                <button id="processed"><img src="imgs/checkmark.png" alt=""></button>
                <button id="addExtra"><img src="imgs/plus.png" alt=""></button> 
            </div>  
        `);

        document.getElementById("processed").addEventListener("click", async () => {
            await UpdateTable(currentTable.id, currentTable.number, currentTable.isAvailable, "Processed");
            location.reload();
        });

        document.getElementById("addExtra").addEventListener("click", () => {
            TableNumberEle.innerText = currentTable.number;
            TableBox.innerHTML = "";
            TableBox.classList.add("hidden");
        });
    }

    TableBox.insertAdjacentHTML("beforeend", `
        <div class="totalAmount">Total Amount: ${totalAmount}₺</div>  
    `);
}

async function renderEmptyTablesBox(orders, tableCapy) {
    const tables = await getAllTables();
    let tableToSwitch = null;
    EmptyTablesBox.innerHTML = "";
    EmptyTablesBox.classList.remove("hidden");
    EmptyTablesBox.insertAdjacentHTML("beforeend", `
        <div class="closeBtn"><button id="emptyTablesBoxCloseBtn"><img src="imgs/cross.png" alt=""></button></div>
        <div class="switchTable">
            <div class="currentTable"><img src="imgs/table.png" alt=""><span id="currentTableNamber">${tableCapy.number}</span></div>
            <span>-></span>
            <div class="capyToTable"><img src="imgs/table.png" alt=""><span id="capyToTableNamber">???</span></div>
        </div>
        <div class="emptyTables" id="emptyTablesToCapy"></div>
        <div class="completeCapyToTable">
            <button id="completeCapyToTableBtn"><img src="imgs/checkmark.png" alt=""></button>
        </div>
    `);

    const EmptyTablesToCapy = document.getElementById("emptyTablesToCapy");
    for (const table of tables) {
        if (table.status !== "Empty") {
            continue;
        }
        EmptyTablesToCapy.insertAdjacentHTML("beforeend", `
            <div id="table" class="table">
                <button id="button-${table.id}"> <img src="imgs/table.png" alt="">${table.number}</button>
            </div> 
        `);

        document.getElementById(`button-${table.id}`).addEventListener("click", () => {
            tableToSwitch = table;
            document.getElementById("capyToTableNamber").innerText = tableToSwitch.number;
        });
    }

    document.getElementById("completeCapyToTableBtn").addEventListener("click", async () => {
        try {
            if (tableToSwitch === null)
                return alert("ℹ️ No table to switch");

            for (const order of orders) {
                await UpdateOrder(order.id, order.status, order.payment, order.orderedName, order.total, tableToSwitch.number, order.createdAt);
            }
            await UpdateTable(tableToSwitch.id, tableToSwitch.number, tableToSwitch.isAvailable, tableCapy.status);
            await UpdateTable(tableCapy.id, tableCapy.number, tableCapy.isAvailable, "Empty");
            location.reload();
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    });

    document.getElementById("emptyTablesBoxCloseBtn").addEventListener("click", () => {
        EmptyTablesBox.classList.add("hidden");
        EmptyTablesBox.innerHTML = "";
    });
}

CanselOrderEle.addEventListener("click", async () => {
    if (currentOrder == null || OrderItemsEle.innerHTML == "")
        return alert("ℹ️ No order to cansel");
    try {
        let answer = confirm("ℹ️ Do you want to remove all order items?");
        if (answer) {
            orderItems = [];
            currentOrder.total = 0;
            OrderTotalAmountEle.innerText = currentOrder.total + "₺";
            OrderItemsEle.innerHTML = "";
            TableNumberEle.innerText = "???";
            currentTable = null;
        }
        else
            return;
    }
    catch (err) {
        alert("⚠️ " + err.message);
    }
});

class ClassOrderItemsToAddExtraControl {

    constructor(id, orderId, name, price, description, printerName, status) {
        this.IsComplete = false;
        this.IsChecked = false;
        this.id = id;
        this.orderId = orderId;
        this.name = name;
        this.price = price;
        this.description = description;
        this.extraPrice = price
        this.extraDetails = description;
        this.printerName = printerName;
        this.status = status;
    }

    AddExtra(extraPrice, extraDetails) {
        this.extraPrice += extraPrice;
        this.extraDetails += extraDetails + " ";
    }

    Clear() {
        this.extraPrice = this.price;
        this.extraDetails = this.description;
    }

    Check() {
        this.IsChecked = true;
    }

    UnCheck() {
        this.IsChecked = false;
    }

    CompleteExtraDetails() {
        this.IsComplete = true;
    }

    async Save() {
        try {
            const item = orderItems.find(x => x.id === this.id);
            item.id = this.id;
            item.orderId = this.orderId;
            item.name = this.name;
            item.description = this.extraDetails;
            item.price = this.extraPrice;
            item.printerName = this.printerName;
            item.status = this.status;
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }
}

class OrderItemsToAddExtraControl {

    constructor(id, orderId, name, price, description, printerName, status) {
        this.IsComplete = false;
        this.IsChecked = false;
        this.id = id;
        this.orderId = orderId;
        this.name = name;
        this.price = price;
        this.description = description;
        this.extraPrice = price
        this.extraDetails = description;
        this.printerName = printerName;
        this.status = status;
    }

    AddExtra(extraPrice, extraDetails) {
        this.extraPrice += extraPrice;
        this.extraDetails += extraDetails + " ";
    }

    Clear() {
        this.extraPrice = this.price;
        this.extraDetails = this.description;
    }

    Check() {
        this.IsChecked = true;
    }

    UnCheck() {
        this.IsChecked = false;
    }

    CompleteExtraDetails() {
        this.IsComplete = true;
    }

    async Save() {
        try {
            await UpdateItem(this.id, this.orderId, this.name, this.extraDetails, this.extraPrice, this.printerName, this.status);
        }
        catch (err) {
            alert("⚠️ " + err.message);
        }
    }
}

let controls = [];

function renderOrderItemsToAddExtraControls() {

    const orderItemsToAddExtra = document.getElementById("orderItemsToAddExtra");
    orderItemsToAddExtra.innerHTML = "";
    for (const control of controls) {

        if (control.IsComplete === true && control.IsChecked === true) {
            orderItemsToAddExtra.insertAdjacentHTML("beforeend", `
            <div class="orderItemToAddExtra" style="background-color: #b4b4b4;">
                <div class="details">
                    <input type="checkbox" checked disabled name="" id="orderItemsToAddExtraCheckbox-${control.id}">
                    <span>1</span>
                    <span>${control.name}</span>
                    <span>${control.extraPrice}₺</span>
                </div>
                <div class="description">
                    <textarea name="" id="">${control.extraDetails}</textarea>
                    <div class="controls">
                        <button disabled id="extraOrderItemClearBtn-${control.id}"><img src="imgs/forbidden.png" alt=""></button>                       
                        <button disabled id="extraOrderItemCompleteBtn-${control.id}"><img src="imgs/checkmark.png" alt=""></button>
                    </div>
                </div>
            </div>
        `);
        }

        if (control.IsComplete === false && control.IsChecked === true) {
            orderItemsToAddExtra.insertAdjacentHTML("beforeend", `
            <div class="orderItemToAddExtra">
                <div class="details">
                    <input type="checkbox" checked name="" id="orderItemsToAddExtraCheckbox-${control.id}">
                    <span>1</span>
                    <span>${control.name}</span>
                    <span>${control.extraPrice}₺</span>
                </div>
                <div class="description">
                    <textarea name="" id="">${control.extraDetails}</textarea>
                    <div class="controls">
                        <button id="extraOrderItemClearBtn-${control.id}"><img src="imgs/forbidden.png" alt=""></button>                       
                        <button id="extraOrderItemCompleteBtn-${control.id}"><img src="imgs/checkmark.png" alt=""></button>
                    </div>
                </div>
            </div>
            `);
            document.getElementById(`extraOrderItemClearBtn-${control.id}`).addEventListener("click", () => {
                control.Clear();
                renderOrderItemsToAddExtraControls();
            });
            document.getElementById(`extraOrderItemCompleteBtn-${control.id}`).addEventListener("click", () => {
                control.CompleteExtraDetails();
                renderOrderItemsToAddExtraControls();
            });
            document.getElementById(`orderItemsToAddExtraCheckbox-${control.id}`).addEventListener("change", function () {
                if (this.checked) {
                    control.IsChecked = true;
                    renderOrderItemsToAddExtraControls();
                } else {
                    control.IsChecked = false;
                    renderOrderItemsToAddExtraControls();
                }
            });
        }

        if (control.IsComplete === false && control.IsChecked === false) {
            orderItemsToAddExtra.insertAdjacentHTML("beforeend", `
            <div class="orderItemToAddExtra">
                <div class="details">
                    <input type="checkbox" name="" id="orderItemsToAddExtraCheckbox-${control.id}">
                    <span>1</span>
                    <span>${control.name}</span>
                    <span>${control.extraPrice}₺</span>
                </div>
                <div class="description">
                    <textarea name="" id="">${control.extraDetails}</textarea>
                    <div class="controls">
                        <button id="extraOrderItemClearBtn-${control.id}"><img src="imgs/forbidden.png" alt=""></button>                       
                        <button id="extraOrderItemCompleteBtn-${control.id}"><img src="imgs/checkmark.png" alt=""></button>
                    </div>
                </div>
            </div>
            `);

            document.getElementById(`extraOrderItemClearBtn-${control.id}`).addEventListener("click", () => {
                control.Clear();
                renderOrderItemsToAddExtraControls();
            });

            document.getElementById(`extraOrderItemCompleteBtn-${control.id}`).addEventListener("click", () => {
                control.CompleteExtraDetails();
                renderOrderItemsToAddExtraControls();
            });

            document.getElementById(`orderItemsToAddExtraCheckbox-${control.id}`).addEventListener("change", function () {
                if (this.checked) {
                    control.IsChecked = true;
                    renderOrderItemsToAddExtraControls();
                } else {
                    control.IsChecked = false;
                    renderOrderItemsToAddExtraControls();
                }
            });
        }
    }
}

async function AddExtraToOrderItem(orderItemId, table) {
    try {
        const item = await GetOrderItemById(orderItemId);
        const extraItems = await GetAllExtraDetailsOrderItem();
        ExtraOrderItemBox.innerHTML = "";
        ExtraOrderItemBox.insertAdjacentHTML("beforeend", `
        <div class="closeBtn"><button id="extraOrderItemBoxCloseBtn"><img src="imgs/cross.png" alt=""></button></div>
        <div class="checkAll"><input type="checkbox" name="" id="checkAllOrderItemsToAddExtra"> All</div>
        <div id="orderItemsToAddExtra" class="orderItemsToAddExtra"></div>
        <div id="extraOrderItems" class="extraOrderItems"></div>
        <button id="extraOrderItemBoxCompleteBtn"><img src="imgs/checkmark.png" alt=""></button>
    `);

        controls = [];
        controls.push(new OrderItemsToAddExtraControl(item.id, item.orderId, item.name, item.price, item.description, item.printerName, item.status));

        ExtraOrderItemBox.classList.remove("hidden");
        document.getElementById("extraOrderItemBoxCloseBtn").addEventListener("click", () => {
            ExtraOrderItemBox.classList.add("hidden");
        });

        renderOrderItemsToAddExtraControls();

        const extraOrderItems = document.getElementById("extraOrderItems");
        extraOrderItems.innerHTML = "";
        for (const item of extraItems) {
            extraOrderItems.insertAdjacentHTML("beforeend", `
                    <div class="extraOrderItem">
                        <button id="extraOrderItemBtn-${item.id}">${item.extraDetails}<br>${item.extraPrice}₺</button>
                    </div>  
            `);

            document.getElementById(`extraOrderItemBtn-${item.id}`).addEventListener("click", async () => {
                for (const control of controls) {
                    if (control.IsComplete !== true && control.IsChecked === true) {
                        control.AddExtra(item.extraPrice, item.extraDetails)
                        renderOrderItemsToAddExtraControls();
                    }
                }
            });
        }

        const checkAllOrderItemsToAddExtra = document.getElementById("checkAllOrderItemsToAddExtra").addEventListener("change", function () {
            if (this.checked) {
                for (const control of controls) {
                    if (control.IsComplete === false) {
                        control.Check();
                        renderOrderItemsToAddExtraControls();
                    }
                }
            } else {
                for (const control of controls) {
                    if (control.IsComplete === false) {
                        control.UnCheck();
                        renderOrderItemsToAddExtraControls();
                    }
                }
            }
        });
        const extraOrderItemBoxCompleteBtn = document.getElementById("extraOrderItemBoxCompleteBtn").addEventListener("click", async () => {
            for (const control of controls) {
                await control.Save();
            }
            ExtraOrderItemBox.classList.add("hidden");
            await renderTableBox(table);
        });

    } catch (err) {
        alert("⚠️ " + err.message);
    }
}

AddExtraToOrder.addEventListener("click", async () => {
    if (currentOrder == null || OrderItemsEle.innerHTML == "")
        return alert("ℹ️ No order to cansel");

    controls = [];
    const extraItems = await GetAllExtraDetailsOrderItem();
    ExtraOrderItemBox.innerHTML = "";
    ExtraOrderItemBox.insertAdjacentHTML("beforeend", `
        <div class="closeBtn"><button id="extraOrderItemBoxCloseBtn"><img src="imgs/cross.png" alt=""></button></div>
        <div class="checkAll"><input type="checkbox" name="" id="checkAllOrderItemsToAddExtra"> All</div>
        <div id="orderItemsToAddExtra" class="orderItemsToAddExtra"></div>
        <div id="extraOrderItems" class="extraOrderItems"></div>
        <button id="extraOrderItemBoxCompleteBtn"><img src="imgs/checkmark.png" alt=""></button>
    `);
    ExtraOrderItemBox.classList.remove("hidden");

    document.getElementById("extraOrderItemBoxCloseBtn").addEventListener("click", () => {
        ExtraOrderItemBox.classList.add("hidden");
    });

    for (const item of orderItems) {
        controls.push(new ClassOrderItemsToAddExtraControl(item.id, item.orderId, item.name, item.price, item.description, item.printerName, item.status));
    }

    renderOrderItemsToAddExtraControls();

    const extraOrderItems = document.getElementById("extraOrderItems");
    extraOrderItems.innerHTML = "";
    for (const item of extraItems) {
        extraOrderItems.insertAdjacentHTML("beforeend", `
                <div class="extraOrderItem">
                    <button id="extraOrderItemBtn-${item.id}">${item.extraDetails}<br>${item.extraPrice}₺</button>
                </div>  
        `);

        document.getElementById(`extraOrderItemBtn-${item.id}`).addEventListener("click", async () => {
            for (const control of controls) {
                if (control.IsComplete !== true && control.IsChecked === true) {
                    control.AddExtra(item.extraPrice, item.extraDetails)
                    renderOrderItemsToAddExtraControls();
                }
            }
        });
    }

    const checkAllOrderItemsToAddExtra = document.getElementById("checkAllOrderItemsToAddExtra").addEventListener("change", function () {
        if (this.checked) {
            for (const control of controls) {
                if (control.IsComplete === false) {
                    control.Check();
                    renderOrderItemsToAddExtraControls();
                }
            }
        } else {
            for (const control of controls) {
                if (control.IsComplete === false) {
                    control.UnCheck();
                    renderOrderItemsToAddExtraControls();
                }
            }
        }
    });

    const extraOrderItemBoxCompleteBtn = document.getElementById("extraOrderItemBoxCompleteBtn").addEventListener("click", async () => {
        for (const control of controls) {
            await control.Save();
        }
        renderOrderItems();
        ExtraOrderItemBox.classList.add("hidden");
    });
});

SendOrderEle.addEventListener("click", async () => {
    if (currentOrder == null || OrderItemsEle.innerHTML == "")
        return alert("ℹ️ No order to sand");

    try {

        Loading.classList.remove("hidden");
        await currentOrder.Add();
        let total = 0;
        for (const item of orderItems) {
            item.orderId = currentOrder.id;
            total += item.price;
            await item.Save();
        }
        currentOrder.total = total;
        await UpdateOrder(currentOrder.id, currentOrder.status, currentOrder.payment, currentOrder.orderedName, currentOrder.total, currentTable.number, currentOrder.createdAt);
        await UpdateTable(currentTable.id, currentTable.number, currentTable.isAvailable, "Processing");       
        await AddOrderToPrint(currentOrder.id, currentOrder.status, currentOrder.payment, currentOrder.orderedName, currentOrder.total, currentTable.number, Notes.value, currentOrder.createdAt); 
        location.reload();      
         
    }
    catch (err) {
        alert("⚠️ " + err.message);
    }
});

Logout.addEventListener("click", () => {
    location.href = "./login.html";
});

function formatShortDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
