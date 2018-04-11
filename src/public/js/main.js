let logoutButton;

window.onload = function() {
    logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", function() {
        logout();         
    });
}

// Called when user clicks the logout button in main.js. Logs the user out and brings them to index.html
// The function firebase.auth().onAuthStateChanged in global.js is automatically called when the user's state changes.
logout = function() {
    firebase.auth().signOut().then(function() {
        window.location.assign("index.html");
    }).catch(function(error) {
        alert(error);
        window.location.assign("index.html");
    });
}

createGroup = function() {
    
}