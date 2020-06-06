$(document).ready(onReady);

const inputFields = [$('#input1'), $('#input2')];
const requiredInputFields = [$('#input1')];
const dataID = 'data-task-table-id';
const dataCompleted = 'data-task-completed-bool';
const cssCompleted = 'completed';
const cssNotCompleted = 'notCompleted';

function onReady() {
  $('#addTaskButton').on('click', primaryAction);
  $('.viewTasks').on('keydown', removeBoxWarning);
  getTasks();
}

function getTasks() {
  $.ajax({
    type: 'GET',
    url: '/list'
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
    const taskToAdd = {
      completed: inputFields[0].val(),
      title: inputFields[1].val(),
      priority: inputFields[2].val(),
      due: inputFields[3].val(),
      notes: inputFields[4].val()
    };
    $.ajax({
      method: 'POST',
      url: '/list',
      data: taskToAdd
    }).then(() => {
      emptyInputFields();
      getTasks();
      updatejQuery();
    }).catch(() => {
      alert('Oh no, that post was rejected :(');
    });
  }
}

function primaryAction() {
  const inputFieldValuesArr = checkIfInputFieldsWereFilled();
  if (inputFieldValuesArr.length !== 0) {
    console.log(inputFieldValuesArr);
    // Do stuff.
    emptyInputFields();
  }
}

function removeBoxWarning(event) {
  $(event.target).removeClass('blankValue');
  $('#inputAttributeError').fadeOut(300);
}

// Check that all the input fields were filled before returning an array of their values.
function checkIfInputFieldsWereFilled() {
  // Remove the error message (only noticeable if it's currently displayed.)
  $('#inputAttributeError').fadeOut(300);
  for (const inputField of requiredInputFields) {
    // Remove the red highlighting from each box (it will be added again if it's still empty.)
    $(inputField).removeClass('blankValue');
    if (inputField.val() === '') {
      $(inputField).addClass('blankValue');
      const boxPromptValue = $(inputField).attr('placeholder');
      $('#inputAttributeError').text(`Error, the "${boxPromptValue}" attribute is required.`).fadeIn(800);
      return [];
    }
  }
  return inputFields;
}

// Empty all input fields.
function emptyInputFields() {
  inputFields.map(input => $(input).val(''));
}

// Remove any books from the DOM and loop over every book in the table adding attributes
// and putting each value in its own table row.
function addToDOM(response) {
  $('#viewKoalas').empty();
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
        appendRowStr += `<td>${koalaVal}</td>`;
        if (koalaVal === true) {
          // Add a class for display purposes and a arbitrary value for whether or not
          // a book has been read into the html data.
          $(jQueryObj).addClass(cssCompleted).attr(dataCompleted, true);
        } else {
          $(jQueryObj).addClass(cssNotCompleted).attr(dataCompleted, false);
        }
      } else {
        // The current bookKey doesn't have a preset so just add verbatim whatever the
        // key and value is to the DOM.
        appendRowStr += `<td>${koalaVal}</td>`;
      }
    }
    // Add a button for toggling if a book has been read and deleting a book which are then
    // updated in the table.
    const buttonText = '<button class="deleteTask"> Delete </button>';
    const readyForTransportToggle = '<button class="toggleCompleted"> Transfer </button>';
    $(jQueryObj.html(appendRowStr).append(readyForTransportToggle).append(buttonText));
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
  const itemID = $(buttonEvent).parent().attr(dataID);
  const itemAttributeBool = $(buttonEvent).parent().attr(dataCompleted);
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

    $(buttonEvent).parent().attr(dataCompleted, toggledAttr);
    if (toggledAttr === true) {
      $(buttonEvent).parent().addClass(cssCompleted).removeClass(cssNotCompleted);
    } else {
      $(buttonEvent).parent().addClass(cssNotCompleted).removeClass(cssCompleted);
    }
  }).catch(() => {
    alert('Oh no, that post was rejected :(');
  });
}

// After the table is filled
function updatejQuery() {
  $('.deleteTask').on('click', deleteTask);
  $('.toggleCompleted').on('click', toggleCompleted);
}
