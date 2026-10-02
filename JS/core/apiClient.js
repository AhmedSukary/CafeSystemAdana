const API_BASE = "https://localhost:7204/api";

async function request(url, method, body) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };

    if (body)
        options.body = JSON.stringify(body);

    const response = await fetch(API_BASE + url, options);

    const data = await response.json();

    if (!response.ok) {
        return Promise.reject({
            status: response.status,
            code: data.code,
            message: data.message
        });
    }

    return data;
}

export function get(url) {
    return request(url, "GET");
}

export function post(url, data) {
    return request(url, "POST", data);
}

export function put(url, data) {
    return request(url, "PUT", data);
}