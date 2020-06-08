$(document).ready(onReady);

function onReady() {
  $('#addTaskButton').on('click', addTaskToTable);
  $('#priorityIn').on('click', cyclePriority);
  $('th').on('click', changeSortByCategory);
  $('.inputField').on('keydown', removeBoxWarning);
  getTasks();
  const startUPSoundEffect = new Audio('/Resources/start_up.wav');
  startUPSoundEffect.play();
}

// these values are added to html elements and used to determine what action to take.
const dataID = 'data-task-table-id';
const dataCompleted = 'data-task-completed-bool';
const cssCompleted = 'completed';
const cssNotCompleted = 'notCompleted';

// Get all the tasks from the table and include and optional "sort by" option.
let sortOrder = 'ASC';
let sortBy;
function getTasks(sort) {
  // If nothing was specified (like when the page loads) the server will default to completed.
  if (sort === undefined) {
    sortBy = '';
  } else {
    sortBy = sort;
  }
  $.ajax({
    type: 'GET',
    url: '/list/' + sortOrder + '/' + sortBy
  }).then((response) => {
    // Loop through the results and display them.
    addToDOM(response);
  }).catch(() => {
    errorMessage('get');
  });
}

// Delete the task from the database and visually remove the task
// so it doesn't have to make another query just to update that task.
function deleteTask(event) {
  const row = $(event.target).parent();
  const tableDatabaseTableId = $(event.target).parent().attr(dataID);
  $.ajax({
    method: 'DELETE',
    url: '/list/' + tableDatabaseTableId
  }).then(() => {
    const deletedSoundEffect = new Audio('/Resources/deleted.wav');
    deletedSoundEffect.play();
    $(row).fadeOut(800, () => {
      $(row).remove();
    });
  }).catch(() => {
    errorMessage('delete');
  });
}

// Get the values from the input fields and add a task to the database.
function addTaskToTable() {
  // Confirm the required fields are filled and if they're not don't proceed.
  const inputFieldValuesArr = checkIfInputFieldsWereFilled();
  if (inputFieldValuesArr.length !== 0) {
    const inputFields = [$('#titleIn'), $('#dueIn'), $('#notesIn')];
    let formattedDate;
    if (inputFields[1].val() === '') {
      formattedDate = null;
    } else {
      formattedDate = moment(inputFields[1].val()).format('YYYY-MM-DD HH:mm:ss');
    }
    const taskToAdd = {
      title: inputFields[0].val(),
      // Global variable for the task priority (!, !!, or, !!!)
      priority: taskPriority,
      due: formattedDate,
      notes: inputFields[2].val()
    };
    $.ajax({
      method: 'POST',
      url: '/list',
      data: taskToAdd
    }).then(() => {
      // Play a success sound effect.
      const addedSoundEffect = new Audio('/Resources/added.wav');
      addedSoundEffect.play();
      emptyInputFields(inputFields);
      // Remove all of the displayed tasks and add them again.
      $('#viewTasks').empty();
      getTasks(sortBy);
      updatejQuery();
    }).catch(() => {
      errorMessage('post');
    });
  }
}

// Something was entered in a required field so remove the red highlighting.
function removeBoxWarning(event) {
  $(event.target).removeClass('blankValue');
  $('#inputAttributeError').fadeOut(300);
}

// Check that all the input fields were filled before returning an array of their values.
function checkIfInputFieldsWereFilled() {
  const requiredInputFields = [$('#titleIn')];
  // Remove the error message (only noticeable if it's currently displayed.)
  $('#inputAttributeError').fadeOut(300);
  for (const inputField of requiredInputFields) {
    // Remove the red highlighting from each box (it will be added again if it's still empty.)
    $(inputField).removeClass('blankValue');
    if (inputField.val() === '') {
      const invalidInputSoundEffect = new Audio('/Resources/invalid_input.wav');
      invalidInputSoundEffect.play();
      $(inputField).addClass('blankValue');
      const boxPromptValue = $(inputField).attr('placeholder');
      $('#inputAttributeError').text(`Error, the "${boxPromptValue}" attribute is required.`).fadeIn(800);
      return [];
    }
  }
  return requiredInputFields;
}

// Empty all input fields.
function emptyInputFields(inputFieldsArr) {
  inputFieldsArr.map(input => $(input).val(''));
}

// Remove any tasks from the DOM and loop over every task in the table adding attributes
// and putting each value in its own table row.
function addToDOM(response) {
  $('#viewTasks').empty();
  for (const taskObj of response) {
    // Make a jQuery object of a table row and add the task values to that row.
    const appendStr = '<tr></tr>';
    const jQueryObj = $(appendStr);
    let appendRowStr = '';
    // Loop over every task in the table and add them to the DOM.
    for (const taskKey in taskObj) {
      const taskVal = taskObj[taskKey];
      // If the inputs match certain strings format them to look prettier.
      if (taskKey === 'task_id') {
        // The (arbitrary) "id" column is the unique identifier for the current task in
        // the table so embed that which allows updates to be made later.
        $(jQueryObj).attr(dataID, taskVal);
      } else if (taskKey === 'completed') {
        if (taskVal === true) {
          appendRowStr += '<td><input type="checkbox" class="toggleCompleted" checked></td>';
          // Add a class for display purposes and a arbitrary value for whether or not
          // a task has been read into the html data.
          $(jQueryObj).addClass(cssCompleted).attr(dataCompleted, true);
        } else {
          appendRowStr += '<td><input type="checkbox" class="toggleCompleted"></td>';
          $(jQueryObj).addClass(cssNotCompleted).attr(dataCompleted, false);
        }
      } else if (taskKey === 'due' && taskVal !== null) {
        // TODO format date correctly.
        appendRowStr += `<td>${(moment(taskVal).format('YYYY/MM/DD, hh:mm a'))}</td>`;
      } else if (taskVal === null) {
        appendRowStr += '<td></td>';
      } else {
        // The current taskKey doesn't have a preset so just add verbatim whatever the
        // key and value is to the DOM.
        appendRowStr += `<td>${taskVal}</td>`;
      }
    }
    // Add a button for toggling if a task has been read and deleting a task which are then
    // updated in the table.
    const buttonText = '<button class="deleteTask"> Delete </button>';
    $(jQueryObj.html(appendRowStr).append(buttonText));
    // Add this big long element to the tasks HTML table.
    $('#viewTasks').append(jQueryObj);
  }
  // Let jQuery know about the new buttons that have been added.
  updatejQuery();
}

// The "Toggle Read" button was clicked/pressed so change the classes
// (for visual purposes) of that task and update that change in the database table.
function toggleCompleted(event) {
  const buttonEvent = event.target;
  // Extract the unique identifier of a task stored in the row header.
  const itemID = $(buttonEvent).closest('tr').attr(dataID);
  const itemAttributeBool = $(buttonEvent).closest('tr').attr(dataCompleted);
  // Set the new value to the opposite of the input value.
  let toggledAttr;
  if (itemAttributeBool === 'true') {
    toggledAttr = false;
  } else {
    toggledAttr = true;
  }
  $.ajax({
    method: 'PUT',
    url: `/list/${itemID}/${toggledAttr}`
  }).then(() => {
    // Visually update the new task status.
    $(buttonEvent).closest('tr').attr(dataCompleted, toggledAttr);
    if (toggledAttr === true) {
      const successSoundEffect = new Audio('/Resources/success.wav');
      successSoundEffect.play();
      $(buttonEvent).closest('tr').addClass(cssCompleted).removeClass(cssNotCompleted);
    } else {
      const incompleteSoundEffect = new Audio('/Resources/incomplete.wav');
      incompleteSoundEffect.play();
      $(buttonEvent).closest('tr').addClass(cssNotCompleted).removeClass(cssCompleted);
    }
  }).catch(() => {
    errorMessage('toggle post');
  });
}

// After the table is filled update the jQuery buttons.
function updatejQuery() {
  $('.deleteTask').on('click', deleteTask);
  $('.toggleCompleted').on('click', toggleCompleted);
  taskPriority = '  ';
  $('#priorityIn').val(taskPriority);
}

// Whenever the the priority button is clicked cycle through the different options.
let taskPriority = '   ';
let taskPriorityIndex = 1;
function cyclePriority() {
  const arr = ['   ', '!  ', '!! ', '!!!'];
  taskPriority = arr[taskPriorityIndex];
  taskPriorityIndex = (taskPriorityIndex + 1) % (arr.length);
  $('#priorityIn').val(taskPriority);
}

// A row header was clicked so get all of the tasks sorted by that header category.
function changeSortByCategory(event) {
  const sortByThis = $(event.target).prop('id');
  if (sortByThis !== '') {
    if (sortOrder === 'ASC') {
      sortOrder = 'DESC';
    } else {
      sortOrder = 'ASC';
    }
    getTasks(sortByThis);
    const reorderSoundEffect = new Audio('/Resources/reorder.mp3');
    reorderSoundEffect.play();
  }
}

// There was a server issue so display an error.
function errorMessage(err) {
  // Hopefully you don't every hear this one.
  const serverErrorSoundEffect = new Audio('/Resources/server_error.mp3');
  serverErrorSoundEffect.play();
  alert(`Oh no, that ${err} was rejected :(`);
}
