
// Global variables
let itemsArray = [];
let item = "";

// Get the shopping list items from the database
let url = 'server_code.php';
let httpMethod = 'POST';
let formData = new FormData();
formData.append('functionName', 'connectToDb');

httpPerformRequest(url, httpMethod, formData)
    .then(res => console.log(res))


// FUNCTION DEFINITIONS    
async function httpPerformRequest(url, httpMethod, httpBody) {
    // This function is supposed to make an HTTP request to the back-end
    // and receive a JSON response.
    return (await fetch(url, {
        method: httpMethod,
        headers: {
            // Informs the server about the types of data that can be sent back
            'Accept': "application/json"
        },
        body: httpBody
    })).json(); // This was absolutely necessary to read the response
}
