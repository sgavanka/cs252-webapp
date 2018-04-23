let groupPaymentsDiv;
var addPayment = function(groupKey) {
    //TODO: fix selection box for fromUser
    //functionality to add a payment to a group
    console.log("button clicked!! functionality to add a payment");
    var fromUserInput = document.createElement("select");
    var toUserInput = document.createElement("select");
    fromUserInput.setAttribute("id", "fromUser");
    toUserInput.setAttribute("id", "toUser");
    databaseRef.child("groups").child(groupKey).child("users").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var username = childSnapshot.val();
            var option1 = document.createElement("option");
            var option2 = document.createElement("option");
            option1.text = username.fullName;
            option2.text = username.fullName;
            fromUserInput.add(option1);
            toUserInput.add(option2);
            console.log("username is: " + option.text);
        });
    });
    var amountInput = document.createElement("input");
    amountInput.setAttribute("id", "amount");
    amountInput.setAttribute("type", "number");
    var submitPaymentButton = document.createElement("button");
    submitPaymentButton.appendChild(document.createTextNode("Add payment"));
    //pushes to the database
    submitPaymentButton.addEventListener("click", function() {
        var fUser = document.getElementById("fromUser").value;
        var tUser = document.getElementById("toUser").value;
        var amt = document.getElementById("amount").value;
        console.log(fUser + " " + tUser + " " + amt);
        var databasePayment = databaseRef.child("groups").child(groupKey).child("payments");
        var payment = {
            fromUser: fUser,
            toUser: tUser,
            amount: amt
        };
        //main payment is stored in the payments node, only amount is stored in the group. 
        //Key of node in payments and the one in group are the same for ease of access
        var lastPushed = paymentsRef.push(payment);
        databasePayment.child(lastPushed.key).set({ amount: amt });
        databaseRef.child("users").once("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().fullName == fUser) {
                    var prevTotal = childSnapshot.val().totalOutgoing;
                    var newTotal = +prevTotal + +amt;
                    console.log("new total is: " + newTotal);
                    childSnapshot.getRef().update({ totalOutgoing: newTotal });
                } else if (childSnapshot.val().fullName == tUser) {
                    var prevTotal = childSnapshot.val().totalIncoming;
                    var newTotal = +prevTotal + +amt;
                    console.log("new total is: " + newTotal);
                    childSnapshot.getRef().update({ totalIncoming: newTotal });
                }
            });
        });
    });
    groupWrapper.appendChild(fromUserInput);
    groupWrapper.appendChild(toUserInput);
    groupWrapper.appendChild(amountInput);
    groupWrapper.appendChild(submitPaymentButton);
};
var displayPayments = function(groupKey) {
    var lineBreak = document.createElement("br");
    groupPaymentsDiv = document.createElement("div");
    groupWrapper.appendChild(lineBreak);
    //Iterates through the database when a child is added and displays list of payments
    //TODO: child_removed
    databaseRef.child("groups").child(groupKey).child("payments").on("child_added", function(snapshot) {
        console.log("child added!");
        var currKey = snapshot.key;
        paymentsRef.child(currKey).on("value", function(childSnapshot) {
            var payment = childSnapshot.val();
            var paymentDiv = document.createElement("li");
            paymentDiv.setAttribute("id", childSnapshot.key);
            paymentDiv.appendChild(document.createTextNode(payment.fromUser + " owes " + payment.toUser + ": " + payment.amount));
            groupPaymentsDiv.appendChild(paymentDiv);
        });
    });
    groupWrapper.appendChild(groupPaymentsDiv);
};
//functionality to delete edit from database, will remove from list as well as the main payment node(will work once UI button is implemented)
var deletePayment = function(groupKey, paymentId) {
    databaseRef.child("groups").child(groupKey).child("payments").child(paymentId).removeValue();
    groupPaymentsDiv.removeChild(paymentId);
    paymentsRef.child(paymentId).removeValue();
};