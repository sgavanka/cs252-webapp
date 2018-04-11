var database = firebase.database().ref();
var firebaseUser;
var userRef;
var email;
var fullName;

// When user changes, reset user and userRef vars as well as user properties.
firebase.auth().onAuthStateChanged(function(newUser) {
    if (newUser) {
        firebaseUser = newUser;
        userRef = database.child("users").child(firebaseUser.uid);
        userRef.once('value', function(snapshot) {
            email = snapshot.val().email;
            fullName = snapshot.val().fullName;
        });
    } else {
        firebaseUser = null;
        userRef = null;
        fullName = null;
    }
});

// Called when user clicks the logout button in main.js
// Logs the user out and brings them to index.html
logout = function() {
    firebase.auth().signOut().then(function() {
        window.location.assign("index.html");
    }).catch(function(error) {
        alert(error);
    });
}