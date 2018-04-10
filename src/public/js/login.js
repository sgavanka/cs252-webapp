let loginEmail;
let loginPassword;
let loginButton

window.onload = function() {
    loginEmail = document.getElementById("login-email");
    loginPassword = document.getElementById("login-password");
    loginButton = document.getElementById("login-button");
    loginButton.addEventListener('click', function() {
        login();
    });
}

login = function() {
    firebase.auth().signInWithEmailAndPassword(loginEmail.value, loginPassword.value).then(function() {
        window.location.assign("main.html");
    }).catch(function(error) {
        if (error != null) {
            alert(error.message);
        }
    });
}