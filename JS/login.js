import { post } from "./core/apiClient.js";

async function CheckUser(username, password) {
    const result = await post("/Users/CheckUser", {
        username,
        password,
    });
    return result;
}

const UserName = document.getElementById("username");
const Password = document.getElementById("password");
const LoginBtn = document.getElementById("loginBtn");
const ErrorMessage = document.getElementById("errorMessage");

LoginBtn.addEventListener("click", async () => {
    try {
        let user = await CheckUser(UserName.value, Password.value);
        location.href = `index.html?UseingSystemName=${encodeURIComponent(user.name)}`;
    }
    catch (err) {
        ErrorMessage.innerText = err.message;
    }
});
