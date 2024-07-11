// Program Title : TaskTide
// Programmer & Author : Keith Ralph Robles Poncardas
// Programming Language : Vanilla JavaScript
// Deployment Date : July 11, 2024

document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskButton");
  const prioritySelect = document.getElementById("prioritySelect");
  const searchInput = document.getElementById("searchInput");
  const filterTask = document.getElementById("filterTask");
  const alertMessage = document.getElementById("alertMessage");
  const taskNotFoundMessage = document.getElementById("taskNotFound");
  const taskList = document.getElementById("taskList");
  const clearAllTaskBtn = document.getElementById("clearAllTask");
  const noTaskMsg = document.getElementById("noTask");
  const taskCleared = document.getElementById("taskCleared");
  const invalidFeedback = document.querySelector('.invalid-feedback');

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const saveTask = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const filterTasks = (tasks, search, category, showCompleted) => {
    const searchLower = search.toLowerCase();
    const filteredTasks = tasks.filter((task) => {
      const taskText = typeof task.text === "string" ? task.text.toLowerCase() : "";
      const matchesSearch = taskText.includes(searchLower);
      const matchesCategory = category === "all" || task.priority === category;

      if (category === "completed") {
        return matchesSearch && task.completed;
      } else {
        const matchesCompleted = showCompleted || !task.completed;
        return matchesSearch && matchesCategory && matchesCompleted;
      }
    });

    if (searchLower && searchLower !== "" && tasks.length > 0 && filteredTasks.length === 0) {
      taskNotFoundMessage.textContent = `"${searchInput.value}" is not found.`;
      taskNotFoundMessage.classList.remove("d-none");
    } else {
      taskNotFoundMessage.textContent = "";
      taskNotFoundMessage.classList.add("d-none");
    }

    return filteredTasks;
  };

  const renderTasks = () => {
    taskList.innerHTML = "";
    const showCompleted = true;
    const filteredTasks = filterTasks(
      tasks,
      searchInput.value,
      filterTask.value,
      showCompleted
    );

    if (tasks.length === 0) {
      noTaskMsg.textContent = "No Task Yet.";

      noTaskMsg.classList.remove("d-none");
    } else {
      noTaskMsg.classList.add("d-none");
      filteredTasks.forEach((task) => {
        taskList.appendChild(createListItem(task));
      });
    }
  };

  const createEditModal = (task) => {
    const taskIndex = tasks.findIndex(t => t.id === task.id);

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal fade';
    modalBackdrop.setAttribute('tabindex', '-1');
    modalBackdrop.setAttribute('role', 'dialog');

    const modal = document.createElement('div');
    modal.className = 'modal-dialog modal-dialog-centered';
    modal.setAttribute('role', 'document');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';

    const modalTitle = document.createElement('h1');
    modalTitle.className = 'modal-title fs-5';
    modalTitle.textContent = 'Edit Task';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'modal');
    closeButton.setAttribute('aria-label', 'Close');

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    const uniqueIdSuffix = Date.now() + Math.random().toString(36).substr(2, 9);
    const inputId = `floatingInput_${uniqueIdSuffix}`;
    const selectId = `prioritySelect_${uniqueIdSuffix}`;

    const formFloating = document.createElement('div');
    formFloating.className = 'form-floating mb-3';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.id = inputId;
    input.placeholder = 'Editable';
    input.value = task.text;

    const inputLabel = document.createElement('label');
    inputLabel.htmlFor = inputId;
    inputLabel.textContent = 'Your Current Task';

    const invalidFeedback = document.createElement('div');
    invalidFeedback.className = 'invalid-feedback';
    invalidFeedback.textContent = 'Task description should not exceed 25 characters.';

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group mb-3';
    inputGroup.title = 'Priority Select';

    const inputGroupLabel = document.createElement('label');
    inputGroupLabel.className = 'input-group-text';
    inputGroupLabel.htmlFor = selectId;
    inputGroupLabel.innerHTML = '<i class="fa-solid fa-layer-group"></i>';

    const select = document.createElement('select');
    select.className = 'form-select';
    select.id = selectId;
    select.setAttribute('aria-label', 'Priority Selection');

    select.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveChanges();
      }
    });

    const optionImportant = document.createElement('option');
    optionImportant.value = 'important';
    optionImportant.textContent = 'Important';
    optionImportant.selected = task.priority === 'important';

    const optionEssential = document.createElement('option');
    optionEssential.value = 'essential';
    optionEssential.textContent = 'Essential';
    optionEssential.selected = task.priority === 'essential';

    const optionCrucial = document.createElement('option');
    optionCrucial.value = 'crucial';
    optionCrucial.textContent = 'Crucial';
    optionCrucial.selected = task.priority === 'crucial';

    select.append(optionImportant, optionEssential, optionCrucial);
    inputGroup.append(inputGroupLabel, select);

    formFloating.append(input, inputLabel);
    modalBody.append(formFloating, inputGroup, invalidFeedback);

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const closeFooterButton = document.createElement('button');
    closeFooterButton.type = 'button';
    closeFooterButton.className = 'btn btn-outline-secondary';
    closeFooterButton.setAttribute('data-bs-dismiss', 'modal');
    closeFooterButton.textContent = 'Close';

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'btn btn-outline-primary';
    saveButton.textContent = 'Save changes';

    const saveChanges = () => {
      if (input.value.length <= 25) {
        tasks[taskIndex].text = input.value.trim() !== '' ? input.value : task.text;
        tasks[taskIndex].priority = select.value;

        saveTask();
        renderTasks();

        const bsModal = bootstrap.Modal.getInstance(modalBackdrop);
        bsModal.hide();
      }
    };

    saveButton.onclick = saveChanges;

    input.addEventListener('input', () => {
      if (input.value.length > 25) {
        saveButton.disabled = true;
        input.classList.add('is-invalid');
        invalidFeedback.style.display = 'block';
      } else {
        saveButton.disabled = false;
        input.classList.remove('is-invalid');
        invalidFeedback.style.display = 'none';
      }
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        if (input.value.length > 25) {
          event.preventDefault();
        } else {
          saveChanges();
        }
      }
    });

    modalFooter.append(closeFooterButton, saveButton);

    modalHeader.append(modalTitle, closeButton);
    modalContent.append(modalHeader, modalBody, modalFooter);
    modal.appendChild(modalContent);
    modalBackdrop.appendChild(modal);

    document.body.appendChild(modalBackdrop);

    const bsModal = new bootstrap.Modal(modalBackdrop);
    bsModal.show();

    modalBackdrop.addEventListener('hidden.bs.modal', () => {
      modalBackdrop.remove();
    });

    return modalBackdrop;
  };

  const createListItem = (task) => {
    const listItem = document.createElement('li');
    let priorityColor;
    switch (task.priority) {
      case 'important':
        priorityColor = 'important';
        break;
      case 'essential':
        priorityColor = 'essential';
        break;
      case 'crucial':
        priorityColor = 'crucial';
        break;
      default:
        break;
    }
    listItem.className = `list-group-item d-flex justify-content-between align-items-center py-3 ${priorityColor}`;

    const spanText = document.createElement('span');
    spanText.textContent = task.text;
    spanText.dataset.id = task.id;

    if (task.completed) {
      listItem.classList.add("complete-grey");
      spanText.classList.add("complete");
    }

    const spanButtons = document.createElement('span');

    const checkButton = document.createElement('button');
    checkButton.type = 'button';
    checkButton.className = 'btn btn-outline-success btn-sm';
    checkButton.innerHTML = '<i class="fa-solid fa-check"></i>';
    checkButton.id = `check-button-${task.id}`;
    checkButton.title = "Complete Task";

    const toggleComplete = (taskId) => {
      return () => {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        tasks[taskIndex].completed = !tasks[taskIndex].completed;

        const spanText = document.querySelector(`[data-id="${taskId}"]`);

        if (tasks[taskIndex].completed) {
          spanText.classList.add("complete");
        } else {
          spanText.classList.remove("complete");
        }
        saveTask();
        renderTasks();
      };
    };

    checkButton.addEventListener("click", toggleComplete(task.id));

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'btn btn-outline-warning btn-sm mx-1';
    editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editButton.title = "Edit Task";

    editButton.addEventListener("click", () => {
      createEditModal(task);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-outline-danger btn-sm';
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.title = "Delete Task";

    deleteButton.addEventListener("click", () => {
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      tasks.splice(taskIndex, 1);
      saveTask();
      renderTasks();
    });

    spanButtons.append(checkButton, editButton, deleteButton);
    listItem.append(spanText, spanButtons);

    return listItem;
  };

  let timeoutId;

  const alertMsg = (text, alertType, variable) => {
    const animateIn = 'animate__bounceIn';
    const animateOut = 'animate__bounceOut';

    if (variable.timeoutId) {
      clearTimeout(variable.timeoutId);
      variable.timeoutId = null;
    }
    variable.classList.remove('animate__animated', animateIn, animateOut);

    variable.textContent = text;
    variable.classList.remove('alert-danger', 'alert-success', 'alert-warning', 'alert-info');
    variable.classList.add(alertType);

    variable.classList.remove('d-none');
    variable.classList.add('show', 'animate__animated', animateIn);

    const handleAnimationEnd = () => {
      variable.classList.remove('show', 'animate__animated', animateOut);
      variable.classList.add('d-none');
      variable.removeEventListener('animationend', handleAnimationEnd);
    };

    variable.removeEventListener('animationend', handleAnimationEnd);

    variable.timeoutId = setTimeout(() => {
      variable.classList.remove(animateIn);
      variable.classList.add(animateOut);

      variable.addEventListener('animationend', handleAnimationEnd, { once: true });
    }, 2000);
  };

  const addTask = () => {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const alertMessage = document.getElementById('alertMessage');

    const taskText = taskInput.value.trim();
    const taskPriority = prioritySelect.value;

    if (taskText) {
      const newTask = {
        id: Date.now(),
        text: taskText,
        priority: taskPriority,
        completed: false
      };
      tasks.push(newTask);
      searchInput.value = "";
      saveTask();
      renderTasks();
      taskInput.value = "";
    } else {
      alertMsg('No Input, Try Again.', 'alert-danger', alertMessage);
      taskInput.value = "";
    }
  };

  let charLengthLimit = 25;

  taskInput.addEventListener('input', function () {
    if (taskInput.value.length > charLengthLimit) {
      taskInput.classList.add('is-invalid');
      addTaskBtn.setAttribute('disabled', 'true');
    } else {
      taskInput.classList.remove('is-invalid');
      addTaskBtn.removeAttribute('disabled');
    }
  });

  taskInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      if (taskInput.value.length > charLengthLimit) {
        event.preventDefault();
        return false;
      } else {
        addTask();
      }
    }
  });

  addTaskBtn.addEventListener("click", addTask);
  searchInput.addEventListener("input", renderTasks);
  filterTask.addEventListener("change", renderTasks);

  const clearAllTasks = () => {
    if (tasks.length === 0) {
      alertMsg('Your task is empty.', 'alert-warning', taskCleared);
      return;
    }

    let confirmation = prompt("Are you sure you want to delete all your tasks? Type 'CONFIRM'");

    if (confirmation === null) {
      return;
    }

    confirmation = confirmation.trim().toLowerCase();

    if (confirmation === "") {
      return clearAllTasks();
    }

    if (confirmation === "confirm") {
      tasks = [];
      taskInput.value = "";
      searchInput.value = "";
      renderTasks();
      saveTask();
    } else {
      return clearAllTasks();
    }
  };

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Delete') {
      clearAllTasks();
    }
  });

  clearAllTaskBtn.addEventListener('click', () => {
    clearAllTasks();
  });

  renderTasks();
});