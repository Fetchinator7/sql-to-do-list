$(document).ready(onReady);

const inputFields = [$('#input1'), $('#input2')];
const requiredInputFields = [$('#input1')];

function onReady() {
  $('#addTaskButton').on('click', primaryAction);
  $('.viewTasks').on('keydown', removeBoxWarning);
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
      if (koalaKey === 'id') {
        // The (arbitrary) "id" column is the unique identifier for the current book in
        // the table so embed that which allows updates to be made later.
        $(jQueryObj).attr('data-item-table-id', koalaVal);
      } else if (koalaKey === 'ready_to_transfer') {
        appendRowStr += `<td>${koalaVal}</td>`;
        if (koalaVal === true) {
          // Add a class for display purposes and a arbitrary value for whether or not
          // a book has been read into the html data.
          $(jQueryObj).addClass('readyForTransport').attr('data-ready-for-transport', true);
        } else {
          $(jQueryObj).addClass('notReadyForTransport').attr('data-ready-for-transport', false);
        }
      } else {
        // The current bookKey doesn't have a preset so just add verbatim whatever the
        // key and value is to the DOM.
        appendRowStr += `<td>${koalaVal}</td>`;
      }
    }
    // Add a button for toggling if a book has been read and deleting a book which are then
    // updated in the table.
    const buttonText = '<button class="deleteKoala"> Delete </button>';
    const readyForTransportToggle = '<button class="toggleKoala"> Transfer </button>';
    $(jQueryObj.html(appendRowStr).append(readyForTransportToggle).append(buttonText));
    // Add this big long element to the books HTML table.
    $('#viewKoalas').append(jQueryObj);
  }
  // Let jQuery know about the new buttons that have been added.
  updatejQuery();
}

// The "Toggle Read" button was clicked/pressed so change the classes
// (for visual purposes) of that book and update that change in the database table.
function toggleAttribute(event) {
  const buttonEvent = event.target;
  // Extract the unique identifier of a book stored in the row header.
  const itemID = $(buttonEvent).parent().attr('data-item-table-id');
  const itemAttributeBool = $(buttonEvent).parent().attr('data-item-attribute-bool');
  // Set the new value to the opposite of the input value.
  let toggledAttr;
  if (itemAttributeBool === 'true') {
    toggledAttr = false;
  } else {
    toggledAttr = true;
  }
  $.ajax({
    method: 'PUT',
    url: `/koalas/${itemID}/${toggledAttr}`
  }).then(() => {
    // Change the text of the box two prior to the to the new bool value.
    // $(event.target).prev().prev().text(toggledAttr);

    $(buttonEvent).parent().attr('data-item-attribute-bool', toggledAttr);
    if (toggledAttr === true) {
      $(buttonEvent).parent().addClass('readyForTransport').removeClass('notReadyForTransport');
    } else {
      $(buttonEvent).parent().addClass('notReadyForTransport').removeClass('readyForTransport');
    }
  }).catch(() => {
    alert('Oh no, that post was rejected :(');
  });
}

// After the table is filled
function updatejQuery() {
  $('.toggleKoala').on('click', toggleAttribute);
}
