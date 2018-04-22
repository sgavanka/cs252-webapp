let databaseRef = firebase.database().ref();
let registerEmail;
let registerName;
let registerPassword;
let registerConfirmPassword;
let registerButton;

window.onload = function() {
    registerEmail = document.getElementById("register-email");
    registerName = document.getElementById("register-name");
    registerPassword = document.getElementById("register-password");
    registerConfirmPassword = document.getElementById("register-confirm-password");
    registerButton = document.getElementById("register-button");
    registerButton.addEventListener("click", function() {
        register();
    });
    registerEmail.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            register();
        }
    });
    registerName.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            register();
        }
    });
    registerPassword.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            register();
        }
    });
    registerConfirmPassword.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            register();
        }
    });

    register = function() {
    firebase.auth().createUserWithEmailAndPassword(registerEmail.value, registerPassword.value).then(function() {
        if (firebase.auth().currentUser) {
            // Push the newly created user's name and email to the database under a node with the same key as the user's uid.
            databaseRef.child("users").child(firebase.auth().currentUser.uid).set({ email: registerEmail.value, fullName: registerName.value, totalOutgoing: '0', totalIncoming: '0' });
            window.location.assign("main.html");
        }
    }).catch(function(error) {
        if (error != null) {
            alert(error.message);
        }
    });
}
}