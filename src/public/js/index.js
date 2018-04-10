let loginButton;
let registerButton;

window.onload = function() {
    let user = firebase.auth().currentUser;
    // If logged in, redirect user to the main page
    if (user) {
        window.location.assign("main.html");
    } else {
        loginButton = document.getElementById("login-button");
        registerButton = document.getElementById("register-button");
        loginButton.addEventListener('click', function() {
            window.location.assign("login.html");
        });
        registerButton.addEventListener('click', function() {
            window.location.assign("register.html");
        });
    }
}