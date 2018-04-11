var databaseRef = firebase.database().ref();
var groupsRef = databaseRef.child("groups");
var paymentsRef = databaseRef.child("payments");
var usersRef = databaseRef.child("users");
var user;

// When user changes, reset user properties to the values corresponding to that user from the database.
firebase.auth().onAuthStateChanged(function(changedUser) {
    if (changedUser) {
        user = new Object();

        // firebaseUser is the same as firebase.auth().currentuser.
        // Can do user.firebaseUser.uid to get this users uid.
        user.firebaseUser = changedUser;

        // databaseRef is the reference to this user's node in the database.
        user.databaseRef = usersRef.child(user.firebaseUser.uid);

        // Sets the email and full name of this user to the values stored in the database.
        // TODO - Eventually will set more values here such as amount owed, groups, friends, etc.
        user.databaseRef.on('value', function(snapshot) {
            user.email = snapshot.val().email;
            user.fullName = snapshot.val().fullName;

            // Setup all of the users groups stored in the database and store that data locally
            user.groups = new Array();
            user.databaseRef.child("groups").on('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let group = new Object();

                    // set attributes of group from database here such as name, members, payments, etc.
                    group.name = childSnapshot.val().groupName;

                    // add this group to the user's local array of groups
                    user.groups.push(group);
                })
            })
            console.log(user);
        });
    } else {
        // If the user logged out, set the user object to null.
        user = null;
    }
});