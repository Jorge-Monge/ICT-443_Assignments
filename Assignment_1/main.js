
// Global variables
let itemsArray = [];
let item = "";

// Get the shopping list items from the database
let url = 'server_code.php';
let httpMethod = 'POST';
let formData = new FormData();
formData.append('functionName', 'connectToDb');

/*

TODO: Button to add a new item. It opens a form (kind of done)
TODO: Upon form submission, the item appears in the page.
TASK ORDER: If a task exist in that position, it will be inserted there, and
 old tasks will be moved forward one position.
*/



/*
httpPerformRequest(url, httpMethod, formData)
    .then(res => console.log(res))
*/

class ToDoItem {
    constructor(id, name, description, [year, month, day], isUrgent, categoryGroup, category, order) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.dueDate = new Date(year, month, day);
        this.isUrgent = isUrgent;
        this.categoryGroup = categoryGroup;
        this.category = category;
        this.order = order;
    }
}

class TodoList {
    constructor(name) {
        this.name = name;
        this.items = [];
        this.addItem = function (itemToAdd) {
            this.items.push(itemToAdd);
        }
        this.removeItem = function (itemToRemoveId) {
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].id === itemToRemoveId) {
                    this.items.splice(i, 1);
                }
            }
        }
    }
}

function maxId(toDoListItems) {
    let maxId = 0;
    for (elm of toDoListItems) {
        if (elm.id > maxId) {
            maxId = elm.id;
        }
    }
    return maxId;
}

// CREATE THE TO-DO LIST
let toDoList = new TodoList("todoList");

let newTaskForm = document.querySelector("#new_task_form_id");

let toDoItem;

// Add item to toDoList on Submit Form.
// Insert HTML for new item
newTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("click");
    let taskName = document.querySelector("#task_name_input_id").value;
    let taskDescription = document.querySelector("#task_description_input_id").value;
    let taskDueDate = document.querySelector("#task_due_date_input_id").value;
    let taskIsUrgent = document.querySelector("#task_is_urgent_id").checked;
    let taskCategorySelect = document.querySelector("#task_category_input_id");
    let taskCategoryIndex = taskCategorySelect.selectedIndex;
    let taskCategory = taskCategorySelect.value;
    let taskCategoryGroup = taskCategorySelect.options[taskCategoryIndex].parentNode.label;
    let taskOrder = document.querySelector("#task_order_input_id").value;
    
    toDoItem = new ToDoItem(
        maxId(toDoList.items) + 1,
        taskName,
        taskDescription,
        taskDueDate,
        taskIsUrgent,
        taskCategoryGroup,
        taskCategory,
        taskOrder);

    toDoList.addItem(toDoItem);

    createNewItemHtml(toDoItem);
});

function createNewItemHtml(toDoItem) {
    console.log("Creating HTML for new item");
    // Creates the Delete btn
}



// REMOVE ITEM IN THE TO-DO LIST
//let myList = new TodoList(todoList)
//todoList.removeItem(itemId);




/*
.addEventListener("click", function (event) {
    
    let myForm = document.querySelector('#new_task_form_id');
    let formData = new FormData(myForm);
    console.log(formData.entries());
    
}

)
*/

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
