import { get, post, put } from "../core/apiClient.js";

export async function GetTableUnpaidOrderByTableNumber(tableNumber) {
    return await get("/Order/GetTableUnpaidOrder/" + tableNumber);
}

export async function GetAllOrderItemsByOrderId(orderId) {
    return await get("/Order/GetAllOrderItemsBy/" + orderId);
}

export async function GetAllExtraDetailsOrderItem() {
    return await get("/Order/GetAllExtraDetailsOrderItem");
}

export async function GetOrderItemById(id) {
    return await get("/Order/GetOrderItemBy/" + id);
}

export async function AddOrderToPrint(id, status, payment, orderedName, total, tableId, tableNumber, notes, orderItemsToPrint) {
    const result = await post("/Order/AddOrderToPrint", {
        id,
        status,
        payment,
        orderedName,
        total,
        tableId,
        tableNumber,
        notes,
        orderItemsToPrint,
    });
    return result;
}

export async function UpdateOrder(id, status, payment, orderedName, total, tableNumber, createdAt) {
    const result = await put("/Order/EditOrder", {
        id,
        status,
        payment,
        orderedName,
        total,
        tableNumber,
        createdAt,
    });
    return result;
}

export async function UpdateItem(id, orderId, name, description, price, printerName, status) {
    const result = await put("/Order/EditOrderItem", {
        id,
        orderId,
        name,
        description,
        price,
        printerName,
        status,
    });
    return result;
}