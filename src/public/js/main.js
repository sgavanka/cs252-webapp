var databaseRef = firebase.database().ref();
var groupsRef = databaseRef.child("groups");
var paymentsRef = databaseRef.child("payments");
var usersRef = databaseRef.child("users");
var myGroupsRef;
var user;
let addUserToGroupButton;
let cancelCreateGroupButton;
let createGroupButton;
let currentGroupKey;
let groupDetailsWrapper;
let groupsList;
let groupNameInput;
let groupWrapper;
let logoutButton;
let submitGroupButton;
let totalIncomingSpan;
let totalOutgoingSpan;
let usersToAddToGroupList;
let userToAddToGroupInput;

window.onload = function() {
    addUserToGroupButton = document.getElementById("add-user-to-group-button");
    addUserToGroupButton.addEventListener("click", function() {
        addUserToGroup();
    });
    cancelCreateGroupButton = document.getElementById("cancel-create-group-button");
    cancelCreateGroupButton.addEventListener("click", function() {
        cancelCreateGroup();
    });
    createGroupButton = document.getElementById("create-group-button");
    createGroupButton.addEventListener("click", function() {
        createGroup();
    });
    groupsList = document.getElementById("groups-wrapper");
    groupNameInput = document.getElementById("group-name-input");
    logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", function() {
        logout();
    });
    submitGroupButton = document.getElementById("submit-group-button");
    submitGroupButton.addEventListener("click", function() {
        submitGroup();
    });
    totalOutgoingSpan = document.getElementById("total-owed-span");
    totalIncomingSpan = document.getElementById("total-owed-to-you-span");
    usersToAddToGroupList = document.getElementById("users-to-add-to-group-list");
    userToAddToGroupInput = document.getElementById("user-to-add-to-group-input");
    groupDetailsWrapper = document.getElementById("group-details-wrapper");
    groupWrapper = document.getElementById("group-wrapper");

    // Checks for user with the specified email in the database.
    // If the user exists, add that user's full name to the usersToAddToGroup list.
    addUserToGroup = function() {
        usersRef.orderByChild('email').equalTo(userToAddToGroupInput.value).once('value', function(snapshot) {
            if (snapshot.val()) {
                if (!document.getElementById(Object.keys(snapshot.val())[0])) {
                    if (user.firebaseUser.uid != Object.keys(snapshot.val())[0]) {
                        usersRef.child(Object.keys(snapshot.val())[0]).once('value', function(childSnapshot) {
                            let userToAdd = document.createElement("li");
                            userToAdd.id = Object.keys(snapshot.val())[0];
                            userToAdd.appendChild(document.createTextNode(childSnapshot.val().fullName));
                            let deleteButton = document.createElement("BUTTON");
                            let deleteButtonText = document.createTextNode("x");
                            deleteButton.appendChild(deleteButtonText);
                            deleteButton.addEventListener("click", function() {
                                usersToAddToGroupList.removeChild(userToAdd);
                            });
                            userToAdd.appendChild(deleteButton);
                            usersToAddToGroupList.appendChild(userToAdd);
                            userToAddToGroupInput.value = "";
                        });
                    } else {
                        alert("You cannot add yourself to the group.");
                    }
                } else {
                    alert("You have already added this person to the group.");
                }
            } else {
                alert("The specified user does not exist.");
            }
        });
    }

    // Hides the group details wrapper and resets any values within it.
    cancelCreateGroup = function() {
        groupDetailsWrapper.classList.add("hidden");
        groupNameInput.value = "";
        userToAddToGroupInput.value = "";

        // Remove all items from the usersToAddToGroup list
        while (usersToAddToGroupList.firstChild) {
            usersToAddToGroupList.removeChild(usersToAddToGroupList.firstChild);
        }
    }

    // Shows the group details wrapper
    createGroup = function() {
        groupDetailsWrapper.classList.remove("hidden");
        let currentUserFullName = document.createElement("li");
        currentUserFullName.appendChild(document.createTextNode(user.fullName));
        usersToAddToGroupList.appendChild(currentUserFullName);
    }

    // Called when the user clicks the logout button. Logs the user out and brings them to index.html
    // The function firebase.auth().onAuthStateChanged in global.js is automatically called when the user's state changes.
    logout = function() {
        firebase.auth().signOut().then(function() {
            window.location.assign("index.html");
        }).catch(function(error) {
            alert(error);
            window.location.assign("index.html");
        });
    }

    // Pushes the newly created group to the database
    submitGroup = function() {
        if (usersToAddToGroupList.childNodes.length > 0) {
            if (groupNameInput.value != "") {
                let group = groupsRef.push();
                group.set({ groupName: groupNameInput.value });

                // Add this user to the newly created group.
                user.databaseRef.child("groups").child(group.key).set({ groupName: groupNameInput.value, owner: "true" });
                group.child('users').child(user.firebaseUser.uid).set({ fullName: user.fullName });

                for (var i = 1; i < usersToAddToGroupList.childNodes.length; i++) {
                    // Add the ith user in the list of users to add to the group.
                    group.child('users').child(usersToAddToGroupList.childNodes[i].id).set({ fullName: document.getElementById(usersToAddToGroupList.childNodes[i].id).value });
                    usersRef.child(usersToAddToGroupList.childNodes[i].id).child("groups").child(group.key).set({ groupName: groupNameInput.value });
                }
                groupDetailsWrapper.classList.add("hidden");
                groupNameInput.value = "";
                userToAddToGroupInput.value = "";

                // Remove all items from the usersToAddToGroup list
                while (usersToAddToGroupList.firstChild) {
                    usersToAddToGroupList.removeChild(usersToAddToGroupList.firstChild);
                }
            } else {
                alert("Group Name cannot be empty");
            }
        } else {
            alert("You must add at least one member to the group.");
        }
    }

    // When user changes, reset user properties to the values corresponding to that user from the database.
    firebase.auth().onAuthStateChanged(function(changedUser) {
        if (changedUser) {
            user = new Object();

            // firebaseUser is the same as firebase.auth().currentuser.
            user.firebaseUser = changedUser;
            user.key = changedUser.key;
            // databaseRef is the reference to this user's node in the database.
            user.databaseRef = usersRef.child(user.firebaseUser.uid);

            myGroupsRef = user.databaseRef.child("groups");

            // When the user is added to a group
            myGroupsRef.on("child_added", function(snapshot) {
                addGroup(snapshot);
            });

            // When a group is removed
            myGroupsRef.on("child_removed", function(snapshot) {
                // Remove the removed group from the GUI
                let groupToRemove = document.getElementById(snapshot.key);
                groupsList.removeChild(groupToRemove);

                // TODO delete all of the payments from the group
            });

            // When something in an existing group changes -- i think this would include if the name changes, if a user is added, or if a payment is made
            myGroupsRef.on("child_changed", function(snapshot) {
                alert("group changed");
            });

            // Sets the email and full name of this user to the values stored in the database.
            // TODO - Eventually will set more values here such as amount owed, groups, friends, etc.
            user.databaseRef.on('value', function(snapshot) {
                user.email = snapshot.val().email;
                user.fullName = snapshot.val().fullName;
                totalOutgoingSpan.innerHTML = snapshot.val().totalOutgoing;
                totalIncomingSpan.innerHTML = snapshot.val().totalIncoming;

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
            });
        } else {
            // If the user logged out, set the user object to null.
            user = null;
            window.location.assign("index.html");
        }
    });

    var showGroup = function(groupKey, groupName, deleteButton) {
        if (currentGroupKey && currentGroupKey != groupKey) {
            closeGroup(currentGroupKey);
        } else if (currentGroupKey && currentGroupKey == groupKey) {
            return;
        }
        console.log("Would open group with id of " + groupKey);
        groupWrapper.appendChild(document.createTextNode(groupName));
        if (deleteButton) {
            groupWrapper.appendChild(deleteButton);
        }
        let closeButton = document.createElement("button");
        // closeButton.classList.add("group-button");
        closeButton.appendChild(document.createTextNode("Close"));
        closeButton.addEventListener("click", function() {
            closeGroup(groupKey);
        })
        groupWrapper.appendChild(closeButton);
        groupWrapper.classList.remove("hidden");
        currentGroupKey = groupKey;
    }

    var closeGroup = function(groupKey) {
        if (currentGroupKey == groupKey) {
            console.log("Would close group with id of " + groupKey);
            currentGroupKey = null;
            groupWrapper.classList.add("hidden");
            while (groupWrapper.firstChild) {
                groupWrapper.removeChild(groupWrapper.firstChild);
            }
        }
    }

    var deleteGroup = function(groupKey) {
        groupsRef.child(groupKey).child("users").once("value", function(snapshot) {
            closeGroup(groupKey);
            snapshot.forEach(function(childSnapshot) {
                usersRef.child(childSnapshot.key).child("groups").child(groupKey).remove();
            });
        }).then(function() {
            groupsRef.child(groupKey).remove();
        });
    }

    var addGroup = function(snapshot) {
        let groupToAdd = document.createElement("button");
        groupToAdd.id = snapshot.key;
        groupToAdd.classList.add("group-button");
        groupToAdd.appendChild(document.createTextNode(snapshot.val().groupName));
        let deleteButton;
        if (snapshot.val().owner == "true") {
            deleteButton = document.createElement("button");
            // deleteButton.classList.add("group-button");
            deleteButton.appendChild(document.createTextNode("Delete Group"));
            deleteButton.addEventListener("click", function() {
                deleteGroup(snapshot.key);
                deleteButton.remove();
            });
        }
        groupToAdd.addEventListener("click", function() {
            showGroup(snapshot.key, snapshot.val().groupName, deleteButton);
        });
        groupsList.appendChild(groupToAdd);
    }
}