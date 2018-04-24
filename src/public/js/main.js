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
let searchButton;
let searchInput;
let paymentButton;
let addingUser = false;

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

    searchButton = document.getElementById("search-button");
    searchInput = document.getElementById("search-input");
    searchButton.addEventListener("click", function() {
        searchForGroup();
    });

    var searchForGroup = function() {
        user.databaseRef.child("groups").orderByChild("groupName").equalTo(searchInput.value).once('value', function(snapshot) {
            console.log(snapshot.val());
            if (snapshot.val()) {
                let foundGroup = document.getElementById(Object.keys(snapshot.val())[0]);
                foundGroup.click();
            }
        });
    }

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
        if (currentGroupKey) {
            closeGroup(currentGroupKey);
        }
        groupDetailsWrapper.classList.remove("hidden");
        while (usersToAddToGroupList.firstChild) {
            usersToAddToGroupList.removeChild(usersToAddToGroupList.firstChild);
        }
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
        if (usersToAddToGroupList.childNodes.length > 1) {
            if (groupNameInput.value != "") {
                let group = groupsRef.push();
                group.set({ groupName: groupNameInput.value, payments: false });

                // Add this user to the newly created group.
                user.databaseRef.child("groups").child(group.key).set({ groupName: groupNameInput.value, owner: "true", totalIncoming: 0, totalOutgoing: 0 });
                group.child('users').child(user.firebaseUser.uid).set({ fullName: user.fullName });

                for (var i = 1; i < usersToAddToGroupList.childNodes.length; i++) {
                    // Add the ith user in the list of users to add to the group.
                    group.child('users').child(usersToAddToGroupList.childNodes[i].id).set({ fullName: usersToAddToGroupList.childNodes[i].innerText.slice(0, -1) });
                    usersRef.child(usersToAddToGroupList.childNodes[i].id).child("groups").child(group.key).set({ groupName: groupNameInput.value, totalIncoming: 0, totalOutgoing: 0 });
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
                // groupsRef.child(snapshot.key).child("payments").on("child_added", function(childSnapshot) {
                // console.log("payment added");
                // });
            });

            // When a group is removed
            myGroupsRef.on("child_removed", function(snapshot) {
                // Remove the removed group from the GUI
                let groupToRemove = document.getElementById(snapshot.key);
                groupsList.removeChild(groupToRemove);

                if (currentGroupKey != null && currentGroupKey == snapshot.key) {
                    closeGroup(currentGroupKey);
                }
                // TODO delete all of the payments from the group
            });

            // When something in an existing group changes -- i think this would include if the name changes, if a user is added, or if a payment is made
            myGroupsRef.on("child_changed", function(snapshot) {
                // alert("group changed");
            });

            // Sets the email and full name of this user to the values stored in the database.
            // TODO - Eventually will set more values here such as amount owed, groups, friends, etc.
            user.databaseRef.on('value', function(snapshot) {
                user.email = snapshot.val().email;
                user.fullName = snapshot.val().fullName;
                // totalOutgoingSpan.innerHTML = snapshot.val().totalOutgoing;
                // totalIncomingSpan.innerHTML = snapshot.val().totalIncoming;

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
            // window.location.assign("index.html");
        }
    });

    var showGroup = function(groupKey, groupName, deleteButton) {
        if (currentGroupKey && currentGroupKey != groupKey) {
            closeGroup(currentGroupKey);
        } else if (currentGroupKey && currentGroupKey == groupKey) {
            return;
        }
        console.log("Would open group with id of " + groupKey);

        // groupWrapper.appendChild(document.createTextNode(groupName));
        let topName = document.createElement("div");
        topName.id = "topName";
        topName.appendChild(document.createTextNode(groupName));
        let drop = document.createElement("div");
        let dropBtn = document.createElement("div");
        let dropDown = document.createElement("div");
        let createPay = document.createElement("div");
        let paymentName = document.createElement("div");
        paymentName.appendChild(document.createTextNode("Payments"));
        paymentName.classList.add("payHeader");
        drop.classList.add("dropdown");
        dropBtn.classList.add("dropbtn");
        dropDown.classList.add("dropdown-content");
        createPay.classList.add("addPayment")
        drop.appendChild(dropBtn);
        dropBtn.appendChild(dropDown);
        topName.appendChild(drop);


        

        let userList = document.createElement("ul");
        userList.classList.add("user-list");
        let addUser = document.createElement("button");
        addUser.appendChild(document.createTextNode("Add User"));
        addUser.addEventListener("click", function() {
            let emailInput = document.createElement("input");
            let submitButton = document.createElement("button");
            let cancelButton = document.createElement("button");
            cancelButton.appendChild(document.createTextNode("Cancel"));
            cancelButton.addEventListener("click", function() {
                groupWrapper.removeChild(emailInput);
                groupWrapper.removeChild(submitButton);
                groupWrapper.removeChild(cancelButton);
            })
            submitButton.appendChild(document.createTextNode("Add"));
            submitButton.addEventListener("click", function() {
                usersRef.orderByChild('email').equalTo(emailInput.value).once('value', function(snapshot) {
                    if (snapshot.val()) {
                        if (user.firebaseUser.uid != Object.keys(snapshot.val())[0]) {
                            usersRef.child(Object.keys(snapshot.val())[0]).once('value', function(childSnapshot) {
                                usersRef.child(childSnapshot.key).child("groups").child(groupKey).set({ groupName: groupName, totalIncoming: 0, totalOutgoing: 0 });
                                groupsRef.child(groupKey).child('users').child(childSnapshot.key).set({ fullName: childSnapshot.val().fullName });
                                groupWrapper.removeChild(emailInput);
                                groupWrapper.removeChild(submitButton);
                                groupWrapper.removeChild(cancelButton);
                            });
                        } else {
                            alert("You cannot add yourself to the group.");
                        }
                    } else {
                        alert("The specified user does not exist.");
                    }
                });
            });
            groupWrapper.appendChild(emailInput);
            groupWrapper.appendChild(submitButton);
            groupWrapper.appendChild(cancelButton);
        });


        groupsRef.child(groupKey).child("users").on("child_added", function(childSnapshot) {
            let userLI = document.createElement("li");
            userLI.classList.add("user-list-item");
            userLI.id = childSnapshot.key;
            userLI.appendChild(document.createTextNode(childSnapshot.val().fullName));
            let deleteButton = document.createElement("div");
            deleteButton.appendChild(document.createTextNode("X"));
            deleteButton.addEventListener("click", function() {
                usersRef.child(childSnapshot.key).child("groups").child(groupKey).remove();
                groupsRef.child(groupKey).child("users").child(childSnapshot.key).remove();
            });
            deleteButton.classList.add("user-delete-button");
            userLI.appendChild(deleteButton);
            userList.appendChild(userLI);
        });

        groupsRef.child(groupKey).child("users").on("child_removed", function(childSnapshot) {
            userList.removeChild(document.getElementById(childSnapshot.key));
        });

        groupWrapper.appendChild(addUser);
        groupWrapper.appendChild(userList);

        let closeButton = document.createElement("button");
        closeButton.appendChild(document.createTextNode("Close"));
        closeButton.addEventListener("click", function() {
            closeGroup(groupKey);
        });

        paymentButton = document.createElement("button");
        paymentButton.setAttribute("id", "add-payment-button");
        paymentButton.appendChild(document.createTextNode("Add payment"));
        paymentButton.classList.add("payButton");

        paymentButton.addEventListener("click", function() {
            //payments.js
            paymentButton.setAttribute('disabled', 'disabled');
            addPayment(groupKey,createPay);
        });
 
        closeButton.classList.add("dropButton");
        groupWrapper.appendChild(topName);
        createPay.appendChild(paymentName);
        createPay.appendChild(paymentButton);
        groupWrapper.appendChild(createPay);
        dropDown.appendChild(closeButton);
         if (deleteButton) {
            dropDown.appendChild(deleteButton);
            deleteButton.classList.add("dropButton")
        }

        groupDetailsWrapper.classList.add("hidden");
        groupWrapper.classList.remove("hidden");
        //functionality in payments.js
        createPay.appendChild(displayPayments(groupKey));
    
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
        let groupToAdd = document.createElement("div");
        groupToAdd.id = snapshot.key;
        groupToAdd.classList.add("group-button");
        let br = document.createElement("br");
        let innerDiv1 = document.createElement("span");
        let innerDiv2 = document.createElement("span");
        groupToAdd.appendChild(document.createTextNode(snapshot.val().groupName));
        groupToAdd.appendChild(br);
        groupToAdd.appendChild(innerDiv1);
        groupToAdd.appendChild(innerDiv2);
        innerDiv1.id = snapshot.key;
        innerDiv1.classList.add("innerDiv1");
        innerDiv2.id = snapshot.key;
        innerDiv2.classList.add("innerDiv2");
        innerDiv1.appendChild(document.createTextNode("You Owe: $0"));
        innerDiv2.appendChild(document.createTextNode("You are Owed: $0"));

        groupsRef.child(snapshot.key).child("payments").on("child_added", function(childSnapshot) {
            user.databaseRef.child("groups").child(snapshot.key).on("value", function(childChildSnapshot) {
                innerDiv1.innerHTML = "You Owe: $" + childChildSnapshot.val().totalOutgoing;
                innerDiv2.innerHTML = "You are Owed: $" + childChildSnapshot.val().totalIncoming;
            });
        });

        groupsRef.child(snapshot.key).child("payments").on("child_removed", function(childSnapshot) {
            user.databaseRef.child("groups").child(snapshot.key).on("value", function(childChildSnapshot) {
                innerDiv1.innerHTML = "You Owe: $" + childChildSnapshot.val().totalOutgoing;
                innerDiv2.innerHTML = "You are Owed: $" + childChildSnapshot.val().totalIncoming;
            });
        });

        let deleteButton;
        if (snapshot.val().owner == "true") {
            deleteButton = document.createElement("button");
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