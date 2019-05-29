
// Global variables
let itemsArray = [];
let item = "";

// Get the shopping list items from the database
let url = 'server_code.php';
let httpMethod = 'GET';

httpPerformRequest(url, httpMethod, null)
    .then(res => console.log(res))

async function httpPerformRequest(url, httpMethod, httpBody) {
    // This function is supposed to make an HTTP request to the back-end
    // and receive a JSON response.
    return (await fetch(url, {
        method: httpMethod,
        mode: 'no-cors',
        headers: {
            // Informs the server about the types of data that can be sent back
            'Accept': "application/json"
        },
        body: httpBody
    }));
}

/*
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
*/
