import { get, put } from "../core/apiClient.js";

export async function getTableById(id) {
    return await get("/Tables/GetBy/" + id);
}

export async function getAllTables() {
    return await get("/Tables/GetAll");
}

export async function UpdateTable(id, number, isAvailable, status) {
    const result = await put("/Tables/EditTable", {
        id,
        number,
        isAvailable,
        status,
    });
    return result;
}
