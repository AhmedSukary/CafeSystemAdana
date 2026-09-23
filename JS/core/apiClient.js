const API_BASE = "https://cafesystemapiadana.runasp.net/api";

function getToken() {
    return localStorage.getItem("accessToken");
}
function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

function logout() {
    localStorage.clear();
    window.location.href = "/login.html";
}

async function refreshToken() {
    try {
        const response = await fetch(API_BASE + "/Auth/Refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refreshToken: getRefreshToken()
            })
        });

        if (!response.ok) {
            logout();
            return false;
        }

        const data = await response.json();

        localStorage.setItem("userId", data.userId);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        return true;

    } catch {
        return false;
    }
}

async function request(url, method, body, retry = true) {

    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    const token = getToken();

    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + url, options);

    if (response.status === 401 && retry) {

        const refreshed = await refreshToken();

        if (refreshed) {
            return request(url, method, body, false);
        }
    }

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

export function del(url) {
    return request(url, "DELETE");
}
