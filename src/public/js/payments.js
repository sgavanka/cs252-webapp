var addPayment = function(groupKey) {
    console.log("button clicked!! functionality to add a payment");
    var fromUserInput = document.createElement("select");
    var toUserInput = document.createElement("select");
    fromUserInput.setAttribute("id", "fromUser");
    toUserInput.setAttribute("id", "toUser");
    databaseRef.child("groups").child(groupKey).child("users").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var username = childSnapshot.val();
            var option = document.createElement("option");
            option.text = username.fullName;
            fromUserInput.add(option);
            toUserInput.add(option);
            console.log("username is: " + option.text);
        });
    });
    var amountInput = document.createElement("input");
    amountInput.setAttribute("id", "amount");
    var submitPaymentButton = document.createElement("button");
    submitPaymentButton.appendChild(document.createTextNode("Add payment"));
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
        var lastPushed = paymentsRef.push(payment);
        databasePayment.child(lastPushed.key).set({ amount: amt });
    });
    groupWrapper.appendChild(fromUserInput);
    groupWrapper.appendChild(toUserInput);
    groupWrapper.appendChild(amountInput);
    groupWrapper.appendChild(submitPaymentButton);
};
var displayPayments = function(groupKey) {
    var lineBreak = document.createElement("br");
    groupWrapper.appendChild(lineBreak);
    /*var paymentDiv = document.createElement("div");
    paymentDiv.id = "list-of-payments";
    var text = document.createTextNode("from user => amount => to user");
    console.log("from user => amount => to user");
    paymentDiv.appendChild(text);*/
};