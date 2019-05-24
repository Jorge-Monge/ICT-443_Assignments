
// Global variables
var itemsArray = [];
var item = "";

while (item !== "x") {
    item = prompt("Enter grocery item");
    if (item === "x") break;
    itemsArray.push(item);
}

var shoppingListDiv = document.getElementById("shopping_list");

for (var i = 0; i<itemsArray.length; i++) {
    console.log("Item number " + (i+1) + " is " + itemsArray[i]);
    shoppingListDiv.innerHTML += "Item number " + (i+1) + " is " + itemsArray[i] + "<br>";
}
