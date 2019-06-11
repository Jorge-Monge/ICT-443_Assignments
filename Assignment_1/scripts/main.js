
// Global variables
let itemsArray = [];
let item = "";

// Get the shopping list items from the database
let url = 'server_code.php';
let httpMethod = 'POST';
let formData = new FormData();
formData.append('functionName', 'connectToDb');

/*

TODO: Upon form submission, the item appears in the page.
TASK ORDER: If a task exist in that position, it will be inserted there, and
 old tasks will be moved forward one position.
TODO: 
1. Upon submission, the object created will be appended
to alist of objects.

2. Upon submission, a new task card will be created,
and inserted in the appropriate position (parentNode.insertBefore()).
3. Elements after the inserted will need to increase their order value by 1.

DELETE TASK: 
1. Element is deleted.
2. Elements after the deleted will need to decrease their order value by 1.

*/



/*
httpPerformRequest(url, httpMethod, formData)
    .then(res => console.log(res))
*/

// OBJECT that models a to-do task (item)
class ToDoItem {
    constructor(id, order, name, description, dueDate, isUrgent, category) {
        this.id = id;
        this.order = order;
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.isUrgent = isUrgent;
        this.category = category;

    }
}

/* OBJECT that models a to-do task list
  (this is in preparation for an eventual linking between a
  users and their specific to-do task lists. For instance, 
  user A would be linked to list A, user B to list B...)
  */
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

let todo_item_list_container = document.querySelector("#todo_item_list_container");

let toDoItem;


// NEW TASK
let jumbotronHeader = document.querySelector("header");
let newTaskForm = document.querySelector("#global_container_form");

let newTaskBtn = document.querySelector("header button");
newTaskBtn.addEventListener("click", () => {
    hideElemShowElem(jumbotronHeader, newTaskForm);
});


let formCancelBtn = document.querySelector("#new_task_form_cancel_btn");
formCancelBtn.addEventListener("click", () => {
    hideElemShowElem(newTaskForm, jumbotronHeader);
});


// Make the Category input value appear as <Category Group> | <Category Value>
// whenever the Category select element changes.
//
let taskCategorySelect = document.querySelector("#task_category_input_id");
taskCategorySelect.addEventListener("change", function() {
    taskCategoryIndex = taskCategorySelect.selectedIndex;
    // Concatenate cat. group + category for the value
    taskCategorySelect.options[taskCategoryIndex].value = 
        GroupValuePlusSelectValue("task_category_input_id");
});


// Add item to toDoList on Submit Form.
// Insert HTML for new item
newTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    hideElemShowElem(newTaskForm, jumbotronHeader);
    let taskName = document.querySelector("#task_name_input_id").value;
    let taskDescription = document.querySelector("#task_description_input_id").value;
    /*
    JavaScript, without any information about the timezone, will consider the date as UTC,
    and will automatically perform a conversion to the current computer timezone.
    */
    let taskDueDate = document.querySelector("#task_due_date_input_id").value;
    //console.log(taskDueDate);

    // Only in order to store a valid date in the database:
    let timeOffsetHours = (new Date().getTimezoneOffset() / 60).toString();
    let taskDueDateWithTimeZone =
        new Date(`${taskDueDate} 00:00:00 -${timeOffsetHours.padStart(2, "0")}00`);

    let taskIsUrgentBool = document.querySelector("#task_is_urgent_id").checked;
    let taskIsUrgent = (taskIsUrgentBool) ? "&#9745;" : "&#9744;";
    let taskCategory = taskCategorySelect.value;
    let taskOrder = document.querySelector("#task_order_input_id").value;

    toDoItem = new ToDoItem(
        maxId(toDoList.items) + 1,
        taskOrder,
        taskName,
        taskDescription,
        taskDueDate,
        taskIsUrgent,
        taskCategory
    );

    toDoList.addItem(toDoItem);

    createNewItemHtml(toDoItem);
});


let remove_all_tasks_btn = document.querySelector("#remove_all_tasks_btn");

/*
remove_all_tasks_btn.addEventListener("click", function () {

    /*
    let a = 1;
    while (todo_item_list_container.firstChild) {
        console.log(todo_item_list_container.firstElementChild);
        a += 1;
        if (a===10) {
            break
        }
    }
    
    
    while (todo_item_list_container.firstElementChild &&
        todo_item_list_container.firstElementChild.classList.contains("todo_item_container")) {
        console.log(todo_item_list_container.firstElementChild);

        //todo_item_list_container.removeChild(todo_item_list_container.firstChild)

    } // while ends
    
});
*/



function hideElemShowElem(elem2Hide, elem2Show) {
    hideElem(elem2Hide);
    showElem(elem2Show);
}

function hideElem(elem2Hide) {
    elem2Hide.classList.add("d-none");
}

function showElem(elem2Show) {
    elem2Show.classList.remove("d-none");
}

function GroupValuePlusSelectValue(selectId) {

    /* ARGUMENT
        The id of a SELECT DOM element.
       PURPOSE
        To concatenate the value of the SELECT element plus the value (the label, that is it)
        of the OPTGROUP element that is the parent of the SELECT elem.
    */
    //
    let selectElem = document.getElementById(selectId);
    let selectElemIndex = selectElem.selectedIndex;
    let selectValue = selectElem.value;
    let groupValue = selectElem.options[selectElemIndex].parentNode.label;
    let selectValuePlusSelectGroupValue = `${groupValue} | ${selectValue}`;
    
    return selectValuePlusSelectGroupValue;
}

function createNewItemHtml(toDoItem) {

    let arrayLiElems = itemPropertiesLiElems(toDoItem);

    // Create <ul> element
    let todo_item_ul = document.createElement("ul");
    todo_item_ul.setAttribute("id", toDoItem.id);

    // Append <li>s as children of <ul>
    for (let e of arrayLiElems) {
        todo_item_ul.appendChild(e);
    }

    // Create <div> as a container of a to-do item
    let todo_item_container_div = document.createElement("div")
    todo_item_container_div.setAttribute("id", "todo_item_container_" + toDoItem.id);
    todo_item_container_div.setAttribute("class", "todo_item_container");

    // Append <ul> as child of the to-do item <div> container
    todo_item_container_div.appendChild(todo_item_ul);

    // Append the to-do item <div> container to the
    // to-do item list <div> container
    todo_item_list_container.appendChild(todo_item_container_div);
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

// Returns an array of HTML LI elements, each LI containing
// a property of a to-do item.
function itemPropertiesLiElems(toDoItem) {

    let textNode, todo_item_property_li;
    let arrayLiElems = [];

    for (let property in toDoItem) {
        console.log(property, toDoItem[property]);
        todo_item_property_li = document.createElement("li");
        todo_item_property_li.setAttribute("class", `todo_item_${property}`);
        todo_item_property_li.innerHTML = toDoItem[property];

        arrayLiElems.push(todo_item_property_li);
    }

    return arrayLiElems;
}