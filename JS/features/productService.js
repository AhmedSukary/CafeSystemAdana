import {get} from "../core/apiClient.js";

export async function getAllByCategoryById(id) {
    return await get("/Products/GetAllByCategory/" + id);
}
