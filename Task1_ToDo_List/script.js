let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let editingIndex = -1;

displayTasks();


// =============================
// ADD / UPDATE TASK
// =============================

function addTask() {

    let title = document.getElementById("taskInput").value.trim();
    let description = document.getElementById("descriptionInput").value.trim();
    let priority = document.getElementById("priorityInput").value;
    let dueDate = document.getElementById("dueDateInput").value;

    if (title === "") {
        alert("Please enter a task!");
        return;
    }


    // UPDATE EXISTING TASK
    if (editingIndex !== -1) {

        tasks[editingIndex].title = title;
        tasks[editingIndex].description = description;
        tasks[editingIndex].priority = priority;
        tasks[editingIndex].dueDate = dueDate;

        editingIndex = -1;

        document.querySelector(".add-button").textContent = "+ Add Task";

    }

    // ADD NEW TASK
    else {

        let newTask = {
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            completed: false
        };

        tasks.push(newTask);
    }


    saveTasks();

    clearForm();

    displayTasks();
}


// =============================
// EDIT TASK
// =============================

function editTask(index) {

    let task = tasks[index];

    // Put task information into form

    document.getElementById("taskInput").value = task.title;

    document.getElementById("descriptionInput").value =
        task.description;

    document.getElementById("priorityInput").value =
        task.priority;

    document.getElementById("dueDateInput").value =
        task.dueDate;


    // Remember which task we are editing

    editingIndex = index;


    // Change button text

    document.querySelector(".add-button").textContent =
        "Update Task";


    // Scroll to form

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =============================
// DELETE TASK
// =============================

function deleteTask(index) {

    let answer = confirm(
        "Are you sure you want to delete this task?"
    );

    if (answer) {

        tasks.splice(index, 1);

        saveTasks();

        displayTasks();
    }
}


// =============================
// COMPLETE TASK
// =============================

function toggleTask(index) {

    tasks[index].completed =
        !tasks[index].completed;

    saveTasks();

    displayTasks();
}


// =============================
// DISPLAY TASKS
// =============================

function displayTasks() {

    let taskList =
        document.getElementById("taskList");

    taskList.innerHTML = "";


    tasks.forEach(function(task, index) {

        let li =
            document.createElement("li");


        // Completed

        if (task.completed) {

            li.classList.add("completed");
        }


        // CHECKBOX

        let checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.checked =
            task.completed;


        checkbox.addEventListener(
            "change",
            function() {

                toggleTask(index);
            }
        );


        // TASK INFO

        let taskInfo =
            document.createElement("div");

        taskInfo.className =
            "task-info";


        // TITLE

        let title =
            document.createElement("div");

        title.className =
            "task-title";

        title.textContent =
            task.title;


        // DESCRIPTION

        let description =
            document.createElement("div");

        description.className =
            "task-description";

        description.textContent =
            "Description: " +
            (task.description || "No description");


        // DATE

        let date =
            document.createElement("div");

        date.className =
            "task-date";

        date.textContent =
            "Due Date: " +
            (task.dueDate || "No due date");


        // PRIORITY

        let priority =
            document.createElement("span");

        priority.className =
            "priority";

        priority.textContent =
            task.priority + " Priority";


        if (task.priority === "High") {

            priority.classList.add(
                "priority-high"
            );

        }
        else if (task.priority === "Medium") {

            priority.classList.add(
                "priority-medium"
            );

        }
        else {

            priority.classList.add(
                "priority-low"
            );
        }


        // ADD INFO

        taskInfo.appendChild(title);

        taskInfo.appendChild(description);

        taskInfo.appendChild(date);

        taskInfo.appendChild(priority);


        // BUTTON AREA

        let buttons =
            document.createElement("div");

        buttons.className =
            "task-buttons";


        // EDIT BUTTON

        let editButton =
            document.createElement("button");

        editButton.textContent =
            "Edit";

        editButton.className =
            "edit-button";


        editButton.addEventListener(
            "click",
            function() {

                editTask(index);
            }
        );


        // DELETE BUTTON

        let deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "Delete";

        deleteButton.className =
            "delete-button";


        deleteButton.addEventListener(
            "click",
            function() {

                deleteTask(index);
            }
        );


        // ADD BUTTONS

        buttons.appendChild(editButton);

        buttons.appendChild(deleteButton);


        // ADD EVERYTHING

        li.appendChild(checkbox);

        li.appendChild(taskInfo);

        li.appendChild(buttons);

        taskList.appendChild(li);

    });


    updateCounter();
}


// =============================
// CLEAR FORM
// =============================

function clearForm() {

    document.getElementById("taskInput").value = "";

    document.getElementById("descriptionInput").value = "";

    document.getElementById("priorityInput").value = "Low";

    document.getElementById("dueDateInput").value = "";
}


// =============================
// SAVE TASKS
// =============================

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}


// =============================
// TASK COUNTER
// =============================

function updateCounter() {

    let total = tasks.length;

    let completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;

    let active =
        total - completed;


    document.getElementById(
        "taskCounter"
    ).textContent =

        total + " Tasks | " +

        active + " Active | " +

        completed + " Completed";
}


// =============================
// CLEAR COMPLETED
// =============================

function clearCompleted() {

    let completed =
        tasks.filter(function(task) {

            return task.completed;

        });


    if (completed.length === 0) {

        alert("There are no completed tasks.");

        return;
    }


    let answer = confirm(
        "Delete all completed tasks?"
    );


    if (answer) {

        tasks =
            tasks.filter(function(task) {

                return !task.completed;

            });


        saveTasks();

        displayTasks();
    }
}