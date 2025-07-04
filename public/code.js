window.addEventListener("DOMContentLoaded", function () {
    const app = document.querySelector(".app");
    const socket = io();

    let uname;

    const onlineCountElement = document.getElementById("online-count");
    const statusDot = document.querySelector(".status-dot");

    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        let username = app.querySelector(".join-screen #username").value.trim();
        if (username.length === 0) return;

        socket.emit("newuser", username);
        uname = username;

        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");

        app.querySelector(".chat-screen #message-input").focus();
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value.trim();
        if (message.length === 0) return;

        renderMessage("my", { username: uname, text: message });
        socket.emit("chat", { username: uname, text: message });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        window.location.reload();
    });

    socket.on("update", function (update) {
        renderMessage("update", update);
    });

    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    socket.on("online-users", function (count) {
        onlineCountElement.innerText = count;
        if (count > 0) {
            statusDot.classList.add("online");
        } else {
            statusDot.classList.remove("online");
        }
    });

    function renderMessage(type, message) {
        const messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");

        if (type === "my" || type === "other") {
            el.className = `message ${type === "my" ? "my-message" : "other-message"}`;
            el.innerHTML = `
                <div>
                    <div class="name"></div>
                    <div class="text"></div>
                </div>
            `;
            el.querySelector(".name").innerText = type === "my" ? "You" : message.username;
            el.querySelector(".text").innerText = message.text;
        } else if (type === "update") {
            el.className = "update";
            el.innerText = typeof message === "string" ? message : JSON.stringify(message);
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
});
