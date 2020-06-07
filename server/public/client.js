$(document).ready(onReady);

function onReady() {
  $('#addTaskButton').on('click', addTaskToTable);
  $('#priorityIn').on('click', cyclePriority);
  $('th').on('click', changeSortByCategory);
  $('.inputField').on('keydown', removeBoxWarning);
  getTasks();
}

const dataID = 'data-task-table-id';
const dataCompleted = 'data-task-completed-bool';
const cssCompleted = 'completed';
const cssNotCompleted = 'notCompleted';

let sortOrder = 'ASC';
let sortBy;
function getTasks(sort) {
  console.log('get tasks', sortOrder);
  if (sort === undefined) {
    sortBy = '';
  } else {
    sortBy = sort;
  }
  console.log('sort by', sortBy);
  $.ajax({
    type: 'GET',
    url: '/list/' + sortOrder + '/' + sortBy
  }).then((response) => {
    addToDOM(response);
  }).catch(() => {
    alert('Oh no, that get was rejected :(');
  }); // end getKoalas
  // ajax call to server to get koalas
}

// Delete the book from the database and visually remove the book
// so it doesn't have to make another query just to update that book.
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
    alert('Oh no, that delete was rejected :(');
  });
}

function addTaskToTable() {
  const inputFieldValuesArr = checkIfInputFieldsWereFilled();
  if (inputFieldValuesArr.length !== 0) {
    const inputFields = [$('#titleIn'), $('#dueIn'), $('#notesIn')];
    // const due = inputFields[1].val().split(/[- :]/);
    // due[1]--;
    // const dateObject = new Date(...due);
    // console.log('new date:', dateObject);
    const taskToAdd = {
      title: inputFields[0].val(),
      priority: taskPriority,
      due: inputFields[1].val(),
      notes: inputFields[2].val()
    };
    $.ajax({
      method: 'POST',
      url: '/list',
      data: taskToAdd
    }).then(() => {
      const addedSoundEffect = new Audio('/Resources/added.wav');
      addedSoundEffect.play();
      emptyInputFields(inputFields);
      $('#viewTasks').empty();
      getTasks(sortBy);
      updatejQuery();
    }).catch(() => {
      console.log('Oh no, that post was rejected :(');
    });
  }
}

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
      const invalidInputSoundEffect = new Audio('/Resources/invalidInput.wav');
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

// Remove any books from the DOM and loop over every book in the table adding attributes
// and putting each value in its own table row.
function addToDOM(response) {
  $('#viewTasks').empty();
  for (const koalaObj of response) {
    // Make a jQuery object of a table row and add the book values to that row.
    const appendStr = '<tr></tr>';
    const jQueryObj = $(appendStr);
    let appendRowStr = '';
    // Loop over every book in the table and add them to the DOM.
    for (const koalaKey in koalaObj) {
      const koalaVal = koalaObj[koalaKey];
      // If the inputs match certain strings format them to look prettier.
      if (koalaKey === 'task_id') {
        // The (arbitrary) "id" column is the unique identifier for the current book in
        // the table so embed that which allows updates to be made later.
        $(jQueryObj).attr(dataID, koalaVal);
      } else if (koalaKey === 'completed') {
        if (koalaVal === true) {
          appendRowStr += '<td><input type="checkbox" class="toggleCompleted" checked></td>';
          // Add a class for display purposes and a arbitrary value for whether or not
          // a book has been read into the html data.
          $(jQueryObj).addClass(cssCompleted).attr(dataCompleted, true);
        } else {
          appendRowStr += '<td><input type="checkbox" class="toggleCompleted"></td>';
          $(jQueryObj).addClass(cssNotCompleted).attr(dataCompleted, false);
        }
      } else if (koalaKey === 'due' && koalaVal !== null) {
        // TODO format date correctly.
        appendRowStr += `<td>${(koalaVal.substring(0, 10))}</td>`;
      } else if (koalaVal === null) {
        appendRowStr += '<td></td>';
      } else {
        // The current bookKey doesn't have a preset so just add verbatim whatever the
        // key and value is to the DOM.
        appendRowStr += `<td>${koalaVal}</td>`;
      }
    }
    // Add a button for toggling if a book has been read and deleting a book which are then
    // updated in the table.
    const buttonText = '<button class="deleteTask"> Delete </button>';
    $(jQueryObj.html(appendRowStr).append(buttonText));
    // Add this big long element to the books HTML table.
    $('#viewTasks').append(jQueryObj);
  }
  // Let jQuery know about the new buttons that have been added.
  updatejQuery();
}

// The "Toggle Read" button was clicked/pressed so change the classes
// (for visual purposes) of that book and update that change in the database table.
function toggleCompleted(event) {
  const buttonEvent = event.target;
  // Extract the unique identifier of a book stored in the row header.
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
    // Change the text of the box two prior to the to the new bool value.
    // $(event.target).prev().prev().text(toggledAttr);

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
    alert('Oh no, that toggle post was rejected :(');
  });
}

// After the table is filled
function updatejQuery() {
  $('.deleteTask').on('click', deleteTask);
  $('.toggleCompleted').on('click', toggleCompleted);
  taskPriority = '  ';
  $('#priorityIn').val(taskPriority);
}

let taskPriority = '   ';
let taskPriorityIndex = 1;
function cyclePriority() {
  const arr = ['   ', '!  ', '!! ', '!!!'];
  taskPriority = arr[taskPriorityIndex];
  taskPriorityIndex = (taskPriorityIndex + 1) % (arr.length);
  $('#priorityIn').val(taskPriority);
}

function changeSortByCategory(event) {
  const sortByThis = $(event.target).prop('id');
  if (sortByThis !== '') {
    if (sortOrder === 'ASC') {
      sortOrder = 'DESC';
    } else {
      sortOrder = 'ASC';
    }
    getTasks(sortByThis);
    console.log('afterward', sortOrder);
  }
}
