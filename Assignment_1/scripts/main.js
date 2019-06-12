//
// Front-End code corresponding to a task management web application.
//
// Author: Jorge Monge
// Date: June 2019
//


// Global variables
let itemsArray = [];
let item = "";

/*
TODO: Handle what happens when the user does not introduce an order value

TODO: Upon form submission, the item appears in the page.
    - Duplicate the template HTML
    - Populate it with the task data.

TASK ORDER: If a task exist in that position, it will be inserted there, and
 old tasks will be moved forward one position.
TODO: 

1. Upon submission, the object created will be appended
to alist of objects (DONE)

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
    constructor(id, order, category, name, dueDate, isUrgent, description) {
        this.id = id;
        this.order = order;
        this.category = category;
        this.name = name;
        this.dueDate = dueDate;
        this.isUrgent = isUrgent;
        this.description = description;
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



// CREATE THE TO-DO LIST
let toDoList = new TodoList("todoList-ICT443");

//let todo_item_list_container = document.querySelector("#todo_item_list_container");

let toDoItem;


// NEW TASK
let jumbotronHeader = document.querySelector("header");
let newTaskForm = document.querySelector("#global_container_form");

let newTaskBtn = document.querySelector("header button#new_task_btn");
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
taskCategorySelect.addEventListener("change", function () {
    taskCategoryIndex = taskCategorySelect.selectedIndex;
    // Concatenate cat. group + category for the value
    taskCategorySelect.options[taskCategoryIndex].value =
        GroupValuePlusSelectValue("task_category_input_id");
});


// Add item to toDoList on Submit Form.
// Insert HTML for new item
newTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Hide the form. Show the header.
    hideElemShowElem(newTaskForm, jumbotronHeader);

    // Store the form data in variables
    let taskOrder = parseInt(document.querySelector("#task_order_input_id").value);
    let taskCategory = taskCategorySelect.value;
    let taskName = document.querySelector("#task_name_input_id").value;
    let taskDueDateWithTimeZone = getDueDateWithTimeZone(document.querySelector("#task_due_date_input_id").value);
    let taskIsUrgent = document.querySelector("#task_is_urgent_id").checked;
    let taskDescription = document.querySelector("#task_description_input_id").value;

    // Check whether there is a task with the same order value
    let orderValueExists = false;
    if (toDoList.items.length > 0) {
        orderValueExists = checkSameOrderValueInTasks(toDoList, taskOrder);
    } 
    
    /* If TRUE (a task exist with same order value as the one entered):
        - Add 1 to order value of all tasks objects with order value >= order value of new task.
        - Parse the HTML task elements and, for all tasks objects with order value >= order value
          of new task, edit the task order number to represent <old order number> + 1. */

    if (orderValueExists) {
        increaseOrderValue(toDoList, taskOrder);
        //increaseOrderValueInHtml(taskOrder);
    } 
    
    // Now that we have created (if the same taskOrder existed already)
    // a "slot" in the list of tasks for the new task, let's create
    // a new instance of the ToDoItem object    
    toDoItem = new ToDoItem(
        maxId(toDoList.items) + 1, // sequential, internal ID
        taskOrder,
        taskCategory,
        taskName,
        taskDueDateWithTimeZone,
        taskIsUrgent,
        taskDescription
    );

    // Add item to list of items
    toDoList.addItem(toDoItem);

    // Create the HTML corresponding to the new task
    let prototype_html_card = document.querySelector(".todo_item_card_prototype");
    let newItemHtml = createNewItemHtml(prototype_html_card, toDoItem);
    newItemHtml.classList.remove("d-none");
    console.log(prototype_html_card.parentNode);
    prototype_html_card.parentNode.appendChild(newItemHtml);

    // Append the new task HTML to the page in
    // the correct insertion point
    document.app
    //insertNewItemHtml(newItemHtml);
});


let remove_all_tasks_btn = document.querySelector("#delete_tasks_btn");


//
// HIDE ALL THE TASKS UPON A BUTTON CLICK
//
let hide_all_tasks_btn = document.querySelector("#hide_tasks_btn");
let todo_item_list_container = document.querySelector("#todo_item_list_container");
hide_all_tasks_btn.addEventListener("click", () => {

    if (hide_all_tasks_btn.classList.contains("action_hide")) {
        hide_all_tasks_btn.innerHTML = "Show All";
        hideElem(todo_item_list_container);
    } else {
        hide_all_tasks_btn.innerHTML = "Hide All";
        showElem(todo_item_list_container)
    }

    hide_all_tasks_btn.classList.toggle("action_hide");

});


//
// EDIT A TASK
//
let editTaskBtn = document.querySelector("i.fa-edit");
editTaskBtn.addEventListener("click", () => {
    console.log("Editing a task");
});


//
// DELETE A TASK
//
let deleteTaskBtn = document.querySelector("i.fa-trash-alt");
deleteTaskBtn.addEventListener("click", () => {
    console.log("Deleting a task");
});










remove_all_tasks_btn.addEventListener("click", function () {

    console.table(toDoList);

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
    */

});




//
// FUNCTION DEFINITIONS 
//

function maxId(toDoListItems) {
    let maxId = 0;
    for (elm of toDoListItems) {
        if (elm.id > maxId) {
            maxId = elm.id;
        }
    }
    return maxId;
}

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

function getDueDateWithTimeZone(dateString = '1970-01-01') {
    /*
    The due date is obtained from the form as a string (like '2019-06-11'). When that string
    is converted to a Date object, the string is taken as corresponding to local
    (computer system) time zone. For instance, in Eastern Canada (GMT-6), a user could
    epoch IN UTC. Its representation could be something like '2019-06-12 00:00:00 GMT'.
    
    Then, when we parse the date back to a string (for instance, when generating the HTML for the
    tasks), the date would be "stringified" to the local time zone. Its representation could be 
    something like 'Tue Jun 11 2019 18:00:00 GMT-0600 (Mountain Daylight Time)'.

    As it can be seen, a date entered as day 12, could end up appearing in a task card as day 11.
    */

    let timeOffsetHours = (new Date().getTimezoneOffset() / 60).toString();
    let taskDueDateWithTimeZone =
        new Date(`${dateString} 00:00:00 -${timeOffsetHours.padStart(2, "0")}00`);
    
        return taskDueDateWithTimeZone;
}

function checkSameOrderValueInTasks(toDoList, taskOrder) {
    /*
    TODOLIST
    toDoList object, whose ToDoItem objects will be iterated to check
    whether any of them has the same task order value as the second 
    function parameter.
    TASKORDER
    The task order value of the task input from the form.

    PURPOSE
    To check whether the task order value entered for the new task already
    exists in any of the previously entered tasks.
    */
    let check = false;
    toDoList.items.forEach((e) => {
        if (e.order == taskOrder) {
            check = true;
        }
    });

    return check ? true: false;
    }

function increaseOrderValue(toDoList, taskOrder) {
        /*
        TODOLIST
        An instance of a ToDoList class.
        TASKORDER
        An integer representing a task order

        PURPOSE
        The function iterates the tasks within the toDoList object
        (the first function argument), and adds 1 to order value of
        all tasks with order value >= taskOrder (the second function argument)
        */

       let check = false;
       toDoList.items.forEach((e) => {
           if (e.order >= taskOrder) {
               e.order += 1;
           }
       });
    }
    
function createNewItemHtml(prototype_html_card, toDoItem) {
    
    let newHtmlCard = prototype_html_card.cloneNode(true);
    // Task ID, task Order
    let a = newHtmlCard.querySelector(".todo_item_card_prototype>div");
    a.setAttribute("data-id", toDoItem.id);
    a.setAttribute("data-order", toDoItem.order);
    a.setAttribute("data-before-content", toDoItem.order);
    // Task category
    b = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_category");
    b.appendChild(document.createTextNode(toDoItem.category));
    // Task name
    let c = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_name");
    c.appendChild(document.createTextNode(toDoItem.name));
    // Due date
    let d = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_dueDate");
    let year = toDoItem.dueDate.getFullYear();
    let month = toDoItem.dueDate.getMonth() + 1;
    let day = toDoItem.dueDate.getDate();
    d.appendChild(document.createTextNode(`${year}-${month}-${day}`));
    // Urgent
    let e = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_isUrgent");
    e.appendChild(document.createTextNode(toDoItem.isUrgent));
    // Description
    let f = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_description");
    f.appendChild(document.createTextNode(toDoItem.description));

    return newHtmlCard;
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