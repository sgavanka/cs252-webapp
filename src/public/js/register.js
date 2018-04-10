var registerEmail;
var registerName;
var registerPassword;
var registerConfirmPassword;
var registerButton;

window.onload = function() {
    registerEmail = document.getElementById("register-email");
    registerName = document.getElementById("register-name");
    registerPassword = document.getElementById("register-password");
    registerConfirmPassword = document.getElementById("register-confirm-password");
    registerButton = document.getElementById("register-button");
    registerButton.addEventListener("click", function() {
        register();
    });
}

register = function() {
    firebase.auth().createUserWithEmailAndPassword(registerEmail.value, registerPassword.value).then(function() {
        var user = firebase.auth().currentUser;
        if (user) {
            firebase.database().ref().child("users").child(user.uid).set({ email: registerEmail.value, fullName: registerName.value });
        } else {
            alert("Error registering account");
        }
    }).catch(function(error) {
        if (error != null) {
            alert(error.message);
        }
    });
}