//
// Front-End code corresponding to a task management web application.
//
// Author: Jorge Monge
// Date: June 2019
//


// Global variables
let itemsArray = [];
let item = "";

// OBJECT that models a to-do task (item)
class ToDoItem {
    constructor(id, order, categoryGroup, category, name, dueDate, isUrgent, description) {
        this.id = id;
        this.order = order;
        this.categoryGroup = categoryGroup
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

let jumbotronHeader = document.querySelector("header");
let newTaskButton = document.querySelector("#new_task_btn");
let newTaskFormContainer = document.querySelector("#global_container_form");
let newTaskForm = document.querySelector("#new_task_form_id");
let hide_all_tasks_btn = document.querySelector("#hide_tasks_btn");
let todo_item_list_container = document.querySelector("#todo_item_list_container");
let maxOrderValue = 0;
let editTask = false;
let editTaskId = null;
let editedTaskDelete = null;
let deleteTaskBtn = document.querySelector("#delete_task_button");


//
// NEW TASK BTN CLICK // HIDE ALL BTN CLICK // DELETE ALL BTN CLICK
//
document.addEventListener("click", (e) => {

    if (e.target && e.target.id == "new_task_btn") { // 'New Task' button

        // Clear the form values
        clearFormValues(newTaskForm);

        // Pre-fills the order value with the next order number
        maxOrderValue = !editTask ? maxValue(toDoList.items, "order"): maxValue(toDoList.items, "order") - 1;
        populateOrderValue(maxOrderValue);

        // Modify input validation to allow ONLY
        // 0 < newOrderValue <= (max(ExistingOrderValues) + 1)
        // In other words, we are NOT ALLOWING GAPS in the order values,
        // you either enter the next value, or substitute one of the existing ones.
        let taskOrderInput = document.querySelector("#task_order_input_id");
        taskOrderInput.setAttribute("max", maxOrderValue + 1);

        // Pre-fills the date input with today's date
        let todayLocale = new Date().toLocaleDateString();
        document.querySelector("#task_due_date_input_id").valueAsDate = new Date(Date.parse(todayLocale));

        // Hide the Jumbotron header, show the form
        hideElemShowElem(jumbotronHeader, newTaskFormContainer);

    }
    else if (e.target && e.target.id == "hide_tasks_btn") { // 'Hide All' button

        if (e.target.classList.contains("action_hide")) {
            e.target.innerHTML = "Show All";
            hideElem(todo_item_list_container);
        } else {
            e.target.innerHTML = "Hide All";
            showElem(todo_item_list_container)
        }
        e.target.classList.toggle("action_hide");

    }
    else if (e.target && e.target.id == "delete_tasks_btn") { // 'Delete All' button

        deleteAllTasks(toDoList);
        deleteAllTaskHtmlElems();
        enableDisableShowAllDeleteAllBtns(toDoList.items)

    }
});


//
// SUBMIT FORM
//

let delete_all_tasks_btn = document.querySelector("#delete_tasks_btn");
let prototype_html_card = document.querySelector(".todo_item_card_prototype");

newTaskFormContainer.addEventListener("submit", function (event) {
    event.preventDefault();

    // Handle the case when the form is opened to edit a pre-existing task
    if (editTask) {

        // The edited data has been submitted. We can delete the old task
        // Update the list of tasks
        console.log("taskId:", editTaskId);
        toDoList.items = itemsWithoutDeletedTask(toDoList.items, editTaskId);
        // Since we have deleted a task, we need to update the order values
        // of the tasks after the one deleted.
        let editedTaskOrderDelete = editedTaskDelete.parentNode.parentNode.getAttribute("data-order");
        decreaseOrderValue(toDoList, editedTaskOrderDelete);
        // Re-draw the task cards
        deleteAllTaskHtmlElems();
        redrawTaskCards(toDoList)

    }

    editTask = false;

    // Hide the form. Show the header.
    hideElemShowElem(newTaskFormContainer, jumbotronHeader);

    // Store the form data in variables
    let taskOrder = parseInt(document.querySelector("#task_order_input_id").value);
    let taskCategoryGroup = categoryGroup("task_category_input_id");
    let taskCategory = document.querySelector("#task_category_input_id").value;
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
    var toDoItem = new ToDoItem(
        !editTask ? maxValue(toDoList.items, "id") + 1 : editTaskId, // sequential, internal ID
        taskOrder,
        taskCategoryGroup,
        taskCategory,
        taskName,
        taskDueDateWithTimeZone,
        taskIsUrgent,
        taskDescription
    );

    // Add item to list of items
    toDoList.addItem(toDoItem);

    // Order tasks in toDoList.items (an array of objects)
    // according to the task order values
    toDoList.items.sort((a, b) => { return a.order - b.order });

    // Delete all the task HTML elems.
    deleteAllTaskHtmlElems();

    // Redraw, from scratch, all the HTML task cards.
    redrawTaskCards(toDoList);

    // Enable 'Hide All' and 'Delete All' buttons
    enableDisableShowAllDeleteAllBtns(toDoList.items);

});


//
// CLEAR NEW-TASK FORM // CANCEL FORM SUBMISSION
//
document.addEventListener("click", (e) => {
    
    if (e.target && e.target.id == "new_task_form_clear_btn") { // 'Clear' form button
        clearFormValues(newTaskForm);
        // Pre-fills the order value with the next logical number
        maxOrderValue = maxValue(toDoList.items, "order");
        populateOrderValue(maxOrderValue);
    } 
    else if (e.target && e.target.id == "new_task_form_cancel_btn") { // 'Cancel' form button

        hideElemShowElem(newTaskFormContainer, jumbotronHeader);

    }

});


//
// EDIT A TASK / DELETE A TASK (ACTIONS AVAILABLE WITHIN THE TASK CARD)
//

document.addEventListener("click", (e) => {

    if (e.target && e.target.id == "edit_task_btn") { // EDIT task

        // Get the ID of the task to edit/delete
        editTaskId = e.target.parentNode.parentNode.getAttribute("data-id");
        editTask = true;
        editedTaskDelete = e.target;
        scrollToTop();
        // Show the form
        newTaskButton.click();
        // Fill the form with the task data
        fillFormTaskData(toDoList.items, editTaskId);

    }
    else if (e.target && e.target.id == "delete_task_btn") { // DELETE task

        var taskId = e.target.parentNode.parentNode.getAttribute("data-id");
        
        // Update the list of tasks
        toDoList.items = itemsWithoutDeletedTask(toDoList.items, taskId);
        // Check if lists of tasks if empty => Disable some buttons
        enableDisableShowAllDeleteAllBtns(toDoList.items)
        // Since we have deleted a task, we need to update the order values
        // of the tasks after the one deleted.
        let taskOrderDelete = e.target.parentNode.parentNode.getAttribute("data-order");
        decreaseOrderValue(toDoList, taskOrderDelete);
        // Re-draw the task cards
        deleteAllTaskHtmlElems();
        redrawTaskCards(toDoList)
    }

})



//
//
// FUNCTION DEFINITIONS 
//
//

function maxValue(toDoListItems, property) {
    let maxValue = 0;
    for (elm of toDoListItems) {
        if (elm[property] > maxValue) {
            maxValue = elm[property];
        }
    }
    return maxValue;
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

function clearFormValues(formElem) {
    formElem.reset();
}

function populateOrderValue(maxOrderValue) {
    newTaskFormContainer.querySelector("#task_order_input_id").value = maxOrderValue + 1;
}

function categoryGroup(selectId) {

    let selectElem = document.getElementById(selectId);
    let selectElemIndex = selectElem.selectedIndex;
    let groupValue = selectElem.options[selectElemIndex].parentNode.label;
    return groupValue;
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

    return check ? true : false;
}

function increaseOrderValue(toDoList, taskOrder) {
    /*
    TODOLIST
    An instance of a ToDoList class.
    TASKORDER
    An integer representing a task order

    PURPOSE
    The function iterates the tasks within the toDoList object
    (the first function argument), and adds 1 to the order value of
    all tasks with order value >= taskOrder (the second function argument)
    */

    toDoList.items.forEach((e) => {
        if (e.order >= taskOrder) {
            e.order += 1;
        }
    });
}

function decreaseOrderValue(toDoList, taskOrder) {
    /*
    TODOLIST
    An instance of a ToDoList class.
    TASKORDER
    An integer representing a task order

    PURPOSE
    The function iterates the tasks within the toDoList object
    (the first function argument), and substracts 1 to the order value of
    all tasks with order value > taskOrder (the second function argument)
    */

    toDoList.items.forEach((e) => {
        if (e.order > taskOrder) {
            e.order -= 1;
        }
    });
}

function enableDisableShowAllDeleteAllBtns(toDoListItems) {

    if (toDoListItems.length === 0) {
        hide_all_tasks_btn.disabled = true;
        delete_all_tasks_btn.disabled = true;
    } else {
        hide_all_tasks_btn.disabled = false;
        delete_all_tasks_btn.disabled = false;
    }

}

function redrawTaskCards(toDoList) {
    let newItemHtml;
    toDoList.items.forEach((taskObject) => {
        newItemHtml = createNewItemHtml(prototype_html_card, taskObject);
        newItemHtml.classList.remove("d-none");
        newItemHtml.classList.remove("todo_item_card_prototype");
        prototype_html_card.parentNode.appendChild(newItemHtml);
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
    let b = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_category");
    b.appendChild(document.createTextNode(`${toDoItem.categoryGroup} | ${toDoItem.category}`));
    // Task name
    let c = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_name");
    c.appendChild(document.createTextNode(toDoItem.name));
    // Due date
    let d = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_dueDate");
    let year = toDoItem.dueDate.getFullYear();
    let month = (toDoItem.dueDate.getMonth() + 1).toString().padStart(2, "0");
    let day = toDoItem.dueDate.getDate();
    d.appendChild(document.createTextNode(`${year}-${month}-${day}`));
    // Urgent
    let urgentCheckBox = toDoItem.isUrgent ?
        '<i class="far fa-check-square"></i>' :
        '<i class="far fa-square"></i>';
    let e = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_isUrgent");
    //e.appendChild(document.createTextNode(toDoItem.isUrgent));
    e.innerHTML = urgentCheckBox;
    // Description
    let f = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_description");
    f.appendChild(document.createTextNode(toDoItem.description));
    // Add class if task is urgent
    if (toDoItem.isUrgent) {
        a.classList.add("urgent");
    }

    return newHtmlCard;
}

function addRemoveUrgentClass()  {
    let itemCard = document.querySelector("div.todo_item_container");

}
function deleteAllTasks(toDoList) {

    toDoList.items = [];

}

function itemsWithoutDeletedTask(toDoListItems, taskId) {
    /*
    From an array of tasks (toDoListItems), remove the task whose
    order value = 'orderValue'
    */
    let newToDoListItems = [];
    for (elem of toDoListItems) {
        if (elem.id != taskId) {
            newToDoListItems.push(elem);
        }
    }
    return newToDoListItems;
}

function deleteAllTaskHtmlElems() {

    let taskHtmlElems = Array.from(document.querySelectorAll(".todo_item_supercontainer"));
    let taskHtmlElemsNotPrototype = taskHtmlElems.filter(elm =>
        !elm.classList.contains("todo_item_card_prototype"));

    for (let elem of taskHtmlElemsNotPrototype) {
        elem.parentNode.removeChild(elem);
    }
}

function fillFormTaskData(toDoListItems, taskId) {

    for (elem of toDoListItems) {
        
        if (elem.id == taskId) {
            document.querySelector("#task_order_input_id").value = elem.order;
            document.querySelector("#task_category_input_id").value = elem.category;
            document.querySelector("#task_name_input_id").value = elem.name;
            document.querySelector("#task_due_date_input_id").valueAsDate = new Date(Date.parse(elem.dueDate));
            document.querySelector("#task_is_urgent_id").checked = elem.isUrgent;
            document.querySelector("#task_description_input_id").value = elem.description;
            break;
        }
    }
}

function scrollToTop() {
    scroll(0,0);
}