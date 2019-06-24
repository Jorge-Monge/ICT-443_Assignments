//
// Front-End code corresponding to a task management web application.
//
// Author: Jorge Monge
// Date: June 2019
//

// TODO: When editing a form, if the category is changed, the value 'undefined' is hardcoded.
/*
Working out
Photo by Victor Freitas on Unsplash
Groceries
Photo by Chantal Garnier on Unsplash
Phone
Photo by Björn Antonissen on Unsplash
Meeting
Photo by Campaign Creators on Unsplash
*/



let itemsArray = [];
let item = "";
let taskCategoryGroup;
let taskCategory;
let taskCategorySelector = document.querySelector("#task_category_input_id");
let showHideAllBtn = document.querySelector("#hide_tasks_btn");
let prototype_html_card = document.querySelector(".todo_item_card_prototype");
//let itemCards = document.querySelectorAll("div.todo_item_container");
let draggedCardObject;
//let draggedOrderValue;
//let draggedCardId;


let taskBeingEdited = null;

// OBJECT that models a to-do task (item)
class ToDoItem {
    constructor(id, order, categoryGroup, category, dueDate, isUrgent, description) {
        this.id = id;
        this.order = order;
        this.categoryGroup = categoryGroup
        this.category = category;
        this.dueDate = dueDate;
        this.isUrgent = isUrgent;
        this.description = description;
    }
}

class DefaultToDoItem extends ToDoItem {
    constructor(id, order, categoryGroup, category, dueDate,
        isUrgent, description, name) {
        super(id, order, categoryGroup, category, dueDate, isUrgent, description);
        this.name = name;
    }
}

class GroceryItem extends ToDoItem {
    constructor(id, order, categoryGroup, category, dueDate,
        isUrgent, description, grocery_item_name, grocery_quantity) {
        super(id, order, categoryGroup, category, dueDate, isUrgent, description);
        this.grocery_item_name = grocery_item_name;
        this.grocery_quantity = grocery_quantity;
    }
}

class WorkingOut extends ToDoItem {
    constructor(id, order, categoryGroup, category, dueDate,
        isUrgent, description, activity, distance_time) {
        super(id, order, categoryGroup, category, dueDate, isUrgent, description);
        this.activity = activity;
        this.distance_time = distance_time;
    }
}

class PhoneCall extends ToDoItem {
    constructor(id, order, categoryGroup, category, dueDate,
        isUrgent, description, person, number) {
        super(id, order, categoryGroup, category, dueDate, isUrgent, description);
        this.person = person;
        this.number = number;
    }
}

class Meeting extends ToDoItem {
    constructor(id, order, categoryGroup, category, dueDate,
        isUrgent, description, attendees) {
        super(id, order, categoryGroup, category, dueDate, isUrgent, description);
        this.attendees = attendees;
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


// CREATE THE TO-DO LIST, IF IT IS NOT ALREADY STORED IN LOCAL STORAGE
//window.localStorage.removeItem("toDoList");
if (fetchFromLocalStorage("toDoList")) {
    var toDoList = fetchFromLocalStorage("toDoList");
    for (elm of toDoList.items) {
        let secondsSinceEpoch = Date.parse(elm.dueDate);
        elm.dueDate = new Date(secondsSinceEpoch);
    }
    console.log(toDoList);
    redrawTaskCards(toDoList);
} else {
    var toDoList = new TodoList("todoList-ICT443");
}


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

        if (editTask) {
            console.log(taskBeingEdited);
            let changeEvent = new Event("change");
            taskCategorySelector.value = taskBeingEdited.category;
            taskCategorySelector.dispatchEvent(changeEvent);


            taskCategorySelector.value = null;
        } else {
            //console.log("I am not in an EDIT SESSION");
            // Clears previous category selections, if NOT IN EDITING SESSION
            let changeEvent = new Event("change");
            taskCategorySelector.dispatchEvent(changeEvent);
            taskCategorySelector.value = null;
        }

        // Pre-fills the order value with the next order number
        maxOrderValue = !editTask ? maxValue(toDoList.items, "order") : maxValue(toDoList.items, "order") - 1;
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

        if (e.target.classList.contains("cards_hidden")) { // Cards are hidden when button clicked
            e.target.innerHTML = "Hide All";
            e.target.classList.remove("cards_hidden");
            showElem(todo_item_list_container);

        } else { // Cards are displayed when button clicked
            e.target.innerHTML = "Show All";
            e.target.classList.add("cards_hidden");
            hideElem(todo_item_list_container);
        }


    }
    else if (e.target && e.target.id == "delete_tasks_btn") { // 'Delete All' button

        deleteAllTasks(toDoList);
        deleteAllTaskHtmlElems();
        enableDisableShowAllDeleteAllBtns(toDoList.items)

    }
});

//
// TASK CATEGORY DROPDOWN LISTENER
//
//taskCategorySelector = document.querySelector("#task_category_input_id");
taskCategorySelector.addEventListener("change", function (event) {
    taskCategory = taskCategorySelector.value;
    taskCategoryGroup = categoryGroup("task_category_input_id");
    //console.log(newTaskFormContainer);
    //console.log(taskCategoryGroup);
    //console.log(taskCategory);
    modifyFormAccordingCategory(newTaskFormContainer, taskCategoryGroup, taskCategory);
});


//
// SUBMIT FORM
//

let delete_all_tasks_btn = document.querySelector("#delete_tasks_btn");

newTaskFormContainer.addEventListener("submit", function (event) {
    event.preventDefault();

    // Handle the case when the form is opened to edit a pre-existing task
    if (editTask) {

        // The edited data has been submitted. We can delete the old task
        // Update the list of tasks
        //console.log("taskId:", editTaskId);
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
    taskCategoryGroup = categoryGroup("task_category_input_id");
    //taskCategory = document.querySelector("#task_category_input_id").value;
    taskCategory = taskCategorySelector.value;
    let taskName = document.querySelector("#task_name_input_id").value;
    let taskGroceryItemName = document.querySelector("#grocery_item_name_input_id").value;
    let taskGroceryQty = document.querySelector("#grocery_quantity_input_id").value;
    let taskWorkingOutActivity = document.querySelector("#activity_input_id").value;
    let taskActivityKmsTime = document.querySelector("#distance_time_input_id").value;
    let taskPhoneCallPerson = document.querySelector("#person_name_input_id").value;
    let taskPhoneCallNumber = document.querySelector("#telephone_number_input_id").value;
    let taskMeetingAttendees = document.querySelector("#attendees_input_id").value;
    let taskDueDateWithTimeZone = getDueDateWithTimeZone(document.querySelector("#task_due_date_input_id").value);
    let taskIsUrgent = document.querySelector("#task_is_urgent_id").checked;
    let taskDescription = document.querySelector("#task_description_input_id").value;

    let formDataObject = {
        taskId: !editTask ? maxValue(toDoList.items, "id") + 1 : editTaskId, // sequential, internal ID
        taskOrder: taskOrder,
        taskCategoryGroup: taskCategoryGroup,
        taskCategory: taskCategory,
        taskName: taskName,
        taskGroceryItemName: taskGroceryItemName,
        taskGroceryQty: taskGroceryQty,
        taskWorkingOutActivity: taskWorkingOutActivity,
        taskActivityKmsTime: taskActivityKmsTime,
        taskPhoneCallPerson: taskPhoneCallPerson,
        taskPhoneCallNumber: taskPhoneCallNumber,
        taskMeetingAttendees: taskMeetingAttendees,
        taskDueDateWithTimeZone: taskDueDateWithTimeZone,
        taskIsUrgent: taskIsUrgent,
        taskDescription: taskDescription
    }

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
    // a new instance of the appropriate object   
    var toDoItem = getAppropriateTaskObjectInstance(formDataObject);
    //console.log("toDoItem returned from the Class constructor");
    //console.log(toDoItem);

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

    // If the tasks were hidden when the new task was submitted,
    // then display them
    if (showHideAllBtn.classList.contains("cards_hidden")) {
        showHideAllBtn.classList.remove("cards_hidden");
        showHideAllBtn.innerHTML = "Hide All";
        showElem(todo_item_list_container);
    }


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

        editTask = false;
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
        editedTaskDelete = e.target;
        // Storing the task object corresponding to the card being edited,
        // so that we can re-draw the form correctly
        /*var editedTaskCategory = 
            document.querySelector(`[data-id='${editTaskId}'] div.todo_item_category`).innerHTML;*/
        for (let elem of toDoList.items) {
            if (elem.id == editTaskId) {
                taskBeingEdited = elem;
            }
        }
        scrollToTop();
        // Show the form
        editTask = true; // Pass this information to the New Task operation
        newTaskButton.click();
        // Fill the form with the task data
        /*
        console.log("Editing a task...");
        console.log("toDoList.items:");
        console.log(toDoList.items);
        console.log("editTaskId", editTaskId);
        */
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
        redrawTaskCards(toDoList);
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

function modifyFormAccordingCategory(newTaskFormContainer, taskCategoryGroup, taskCategory) {

    switch (`${taskCategoryGroup}-${taskCategory}`) {
        case "Personal-Groceries":
            hideFormElems("[data-customHide='true']");
            showFormElems("[data-tasktype='groceries']");
            break;
        case "Personal-Working Out":
            hideFormElems("[data-customHide='true']");
            showFormElems("[data-tasktype='working_out']");
            break;
        case "Work-Phone Call":
            hideFormElems("[data-customHide='true']");
            showFormElems("[data-tasktype='phone_call']");
            break
        case "Work-Meeting":
            hideFormElems("[data-customHide='true']");
            showFormElems("[data-tasktype='meeting']");
            break;
        case "DefaultToDoItem":
            hideFormElems("[data-customHide='true']");
            showFormElems("[data-tasktype='default']");
            break;
        default:
            hideFormElems("[data-customHide='true']");
            showFormElems("[data-tasktype='default']");
    }
}

function getAppropriateTaskObjectInstance(formDataObject) {

    switch (`${formDataObject.taskCategoryGroup}-${formDataObject.taskCategory}`) {
        case "Personal-Groceries":

            var groceryItem = new GroceryItem(
                formDataObject.taskId, // sequential, internal ID
                formDataObject.taskOrder,
                formDataObject.taskCategoryGroup,
                formDataObject.taskCategory,
                formDataObject.taskDueDateWithTimeZone,
                formDataObject.taskIsUrgent,
                formDataObject.taskDescription,
                formDataObject.taskGroceryItemName,
                formDataObject.taskGroceryQty
            );
            return groceryItem;

        case "Personal-Working Out":
            //console.log("CASE WORKING OUT");
            var workingOut = new WorkingOut(
                formDataObject.taskId, // sequential, internal ID
                formDataObject.taskOrder,
                formDataObject.taskCategoryGroup,
                formDataObject.taskCategory,
                formDataObject.taskDueDateWithTimeZone,
                formDataObject.taskIsUrgent,
                formDataObject.taskDescription,
                formDataObject.taskWorkingOutActivity,
                formDataObject.taskActivityKmsTime
            );
            return workingOut;

        case "Work-Phone Call":

            var phoneCall = new PhoneCall(
                formDataObject.taskId, // sequential, internal ID
                formDataObject.taskOrder,
                formDataObject.taskCategoryGroup,
                formDataObject.taskCategory,
                formDataObject.taskDueDateWithTimeZone,
                formDataObject.taskIsUrgent,
                formDataObject.taskDescription,
                formDataObject.taskPhoneCallPerson,
                formDataObject.taskPhoneCallNumber
            );
            return phoneCall;

        case "Work-Meeting":

            var meeting = new Meeting(
                formDataObject.taskId, // sequential, internal ID
                formDataObject.taskOrder,
                formDataObject.taskCategoryGroup,
                formDataObject.taskCategory,
                formDataObject.taskDueDateWithTimeZone,
                formDataObject.taskIsUrgent,
                formDataObject.taskDescription,
                formDataObject.taskMeetingAttendees
            );
            return meeting;

        default:

            var defaultToDoItem = new DefaultToDoItem(
                formDataObject.taskId, // sequential, internal ID
                formDataObject.taskOrder,
                formDataObject.taskCategoryGroup,
                formDataObject.taskCategory,
                formDataObject.taskDueDateWithTimeZone,
                formDataObject.taskIsUrgent,
                formDataObject.taskDescription,
                formDataObject.taskName
            );
            return defaultToDoItem;

    }
}

function showFormElems(querySelector) {

    let y = document.querySelectorAll(querySelector);
    for (let elem of y) {
        elem.classList.remove("d-none");
    }
}

function hideFormElems(querySelector) {

    let x = document.querySelectorAll(querySelector);
    for (let elem of x) {
        elem.classList.add("d-none");
    }
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

    return check
    //return check ? true : false;
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
    console.log("Drawing the cards");
    console.log(toDoList);

    // Here the grocery item is correct.
    //console.log(toDoList);

    let newItemHtml;
    toDoList.items.forEach((taskObject) => {
        console.log("taskObject:", taskObject);
        newItemHtml = createNewItemHtml(prototype_html_card, taskObject);
        newItemHtml.classList.remove("d-none");
        newItemHtml.classList.remove("todo_item_card_prototype");
        prototype_html_card.parentNode.appendChild(newItemHtml);
    });
}

function dragStart(e) {
    this.parentNode.classList.add("hold");
    setTimeout(() => (this.classList.add("hidden")), 0);
    // Storing the element that is being dragged
    draggedCardHtml = e.target;
}

function dragEnd(e) {
    this.parentElement.classList.remove("hold");
    this.classList.remove("hidden");
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();  
    if (e.target.classList.contains("droppable")
        && draggedCardHtml.dataset.id != e.target.querySelector("div").dataset.id) {
        e.target.classList.add("card_hovered");
        e.target.querySelector("div").classList.add("hidden");
    }
}

function dragLeave(e) {
    if (e.target.classList.contains("droppable") 
        && draggedCardHtml.dataset.id != e.target.querySelector("div").dataset.id) {
        e.target.classList.remove("card_hovered");
        e.target.querySelector("div").classList.remove("hidden");
    }
}

function dragDrop() {

    let receivOrderValue = this.querySelector("div>div.droppable>div").dataset.order;

    // Temporarily storing the dragging object
    let draggedCardObject = toDoList.items.filter((arrayObject) => arrayObject.id === parseInt(draggedCardHtml.dataset.id));

    // Temporarily removing the dragging object from the list of tasks
    toDoList.items = itemsWithoutDeletedTask(toDoList.items, draggedCardHtml.dataset.id);
    
    // Fill the void left by the dragged card.
    decreaseOrderValue(toDoList, draggedCardHtml.dataset.order);

    // Create the void needed to accomodate the dragged card 
    increaseOrderValue(toDoList, receivOrderValue);

    // Add the dragged element back to the list of tasks.
    draggedCardObject[0].order = parseInt(receivOrderValue);
    toDoList.items.push(draggedCardObject[0]);

    // Order tasks in toDoList.items (an array of objects)
    // according to the task order values
    toDoList.items.sort((a, b) => { return a.order - b.order });
    
    // Re-draw the task cards
    deleteAllTaskHtmlElems();
    redrawTaskCards(toDoList)

}

function addDragEventsReceivingCard(domElem) {
    domElem.addEventListener("dragover", dragOver);
    domElem.addEventListener("drop", dragDrop);
    domElem.addEventListener("dragenter", dragEnter);
    domElem.addEventListener("dragleave", dragLeave);
}

function addDragEventsDraggingCard(domElem) {
    domElem.addEventListener("dragstart", dragStart);
    domElem.addEventListener("dragend", dragEnd);
}

function createNewItemHtml(prototype_html_card, toDoItem) {

    let toDoItemPrototype = toDoItem.constructor.name;
    console.log("Constructor Name:", toDoItemPrototype);

    // The prototype card is CLONED
    // The first DIV child of 'newHtmlCard' will be the drag-drop area
    let newHtmlCard = prototype_html_card.cloneNode(true);
    // Second child of the prototype card is the DOM element that
    // we want to make draggable.
    let droppableArea = newHtmlCard.querySelectorAll("div")[0];
    let newHtmlCardFill = newHtmlCard.querySelectorAll("div")[1];

    // Add DRAG EVENTS
    addDragEventsReceivingCard(droppableArea);
    addDragEventsDraggingCard(newHtmlCardFill);

    let toggableSections = newHtmlCard.querySelectorAll(".toggable_todo_item_section");
    for (let toggableSectionContainer of toggableSections) {
        if (toggableSectionContainer.classList.contains(toDoItemPrototype)) {
            toggableSectionContainer.classList.remove("d-none");
        }
    }

    // Task ID, task Order
    let a = newHtmlCard.querySelector(".todo_item_card_prototype>div>div");
    a.setAttribute("data-id", toDoItem.id);
    a.setAttribute("data-order", toDoItem.order);
    a.setAttribute("data-before-content", toDoItem.order);

    // Add a class referencing the Category, so that the background of the 
    // task card can be chosen appropriately
    a.classList.add(toDoItemPrototype);
    if (toDoItemPrototype != "DefaultToDoItem") {
        a.classList.add("special_task");
    }
    if (toDoItem.isUrgent) {
        for (let elem of a.querySelectorAll(".todo_item_section_heading")) {
            elem.classList.add("urgent_heading");
        };
    }

    // Task category
    let b = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_category");
    b.appendChild(document.createTextNode(`${toDoItem.categoryGroup} | ${toDoItem.category}`));


    if (toDoItemPrototype === "GroceryItem") {
        // Grocery item name
        let d = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_grocery_item_name");
        d.appendChild(document.createTextNode(toDoItem.grocery_item_name));
        // Grocery quantity
        let e = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_grocery_quantity");
        e.appendChild(document.createTextNode(toDoItem.grocery_quantity));
    }

    else if (toDoItemPrototype === "WorkingOut") {
        // WorkingOut Activity
        let f = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_workingout_activity");
        f.appendChild(document.createTextNode(toDoItem.activity));
        // WorkingOut Distance-Time
        let g = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_workingout_distance_time");
        g.appendChild(document.createTextNode(toDoItem.distance_time));
    }

    else if (toDoItemPrototype === "PhoneCall") {
        // PhoneCall Person
        let h = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_phonecall_personname");
        h.appendChild(document.createTextNode(toDoItem.person));
        // PhoneCall Number
        let j = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_phone_number");
        j.appendChild(document.createTextNode(toDoItem.number));
    }

    else if (toDoItemPrototype === "Meeting") {
        // Meeting
        let k = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_meeting_attendees");
        k.appendChild(document.createTextNode(toDoItem.attendees));
    }

    else if (toDoItemPrototype === "DefaultToDoItem") {
        // Task name
        let c = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_name");
        c.appendChild(document.createTextNode(toDoItem.name));
    }

    // Due date
    let m = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_dueDate");
    let year = toDoItem.dueDate.getFullYear();
    let month = (toDoItem.dueDate.getMonth() + 1).toString().padStart(2, "0");
    let day = toDoItem.dueDate.getDate();
    m.appendChild(document.createTextNode(`${year}-${month}-${day}`));
    // Urgent
    let urgentCheckBox = toDoItem.isUrgent ?
        '<i class="far fa-check-square"></i>' :
        '<i class="far fa-square"></i>';
    let n = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_isUrgent");
    //e.appendChild(document.createTextNode(toDoItem.isUrgent));
    n.innerHTML = urgentCheckBox;
    // Description
    let p = newHtmlCard.querySelector(".todo_item_card_prototype div.todo_item_description");
    p.appendChild(document.createTextNode(toDoItem.description));
    // Add class if task is urgent
    if (toDoItem.isUrgent) {
        a.classList.add("urgent");
    }

    // Store the list of tasks in Local Storage
    saveToLocalStorage("toDoList", toDoList);

    return newHtmlCard;
}

function deleteAllTasks(toDoList) {

    toDoList.items = [];

}

function saveToLocalStorage(key, object) {
    window.localStorage.setItem(key, JSON.stringify(object));
}

function fetchFromLocalStorage(key) {
    return JSON.parse(window.localStorage.getItem(key));
}

function itemsWithoutDeletedTask(toDoListItems, taskId) {
    /*
    From an array of tasks (toDoListItems), remove the task whose
    id = 'taskId'
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
            console.log("taskId", taskId);
            document.querySelector("#task_order_input_id").value = elem.order;
            document.querySelector("#task_category_input_id").value = elem.category;
            document.querySelector("#task_name_input_id").value = elem.name;
            document.querySelector("#grocery_item_name_input_id").value = elem.grocery_item_name;
            document.querySelector("#grocery_quantity_input_id").value = elem.grocery_quantity;
            document.querySelector("#activity_input_id").value = elem.activity;
            document.querySelector("#distance_time_input_id").value = elem.distance_time;
            document.querySelector("#person_name_input_id").value = elem.person;
            document.querySelector("#telephone_number_input_id").value = elem.number;
            document.querySelector("#attendees_input_id").value = elem.attendees;
            document.querySelector("#task_due_date_input_id").valueAsDate = new Date(Date.parse(elem.dueDate));
            document.querySelector("#task_is_urgent_id").checked = elem.isUrgent;
            document.querySelector("#task_description_input_id").value = elem.description;
            break;
        }
    }
}

function scrollToTop() {
    scroll(0, 0);
}