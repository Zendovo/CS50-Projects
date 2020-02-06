$('.addField').click(function() {

    // Get the current length
    var length = $('#length').val();

    var container = document.createElement('div');
    container.classList.add('input-group', 'mb-3');
    
    // Create a new field
    var newField = document.createElement('input');
    newField.type = 'text';
    newField.classList.add('form-control', 'border', 'animated', 'bounceInLeft');
    newField.name = 'code-' + length;
    newField.id = 'code-' + length;
    newField.placeholder = 'Enter code...';
    newField.setAttribute('required', '');

    // Append the new field to the container
    $(container).append(newField);

    // Add spacing
    $(container).append('\n');

    // Button container
    var btnContainer = document.createElement('div');
    btnContainer.classList.add('input-group-append');
    
    // Create a remove button
    var removeBtn = document.createElement('button');
    removeBtn.type = "button";
    removeBtn.setAttribute("onclick", "removeField('" + "code-" + length + "');");
    removeBtn.classList.add('btn', 'btn-danger', 'btn-remove', 'animated', 'bounceInRight');

    // Create the remove button text
    var removeBtn_Node = document.createTextNode('-');

    // Add the text to the button
    $(removeBtn).append(removeBtn_Node);

    // Append the button to the button container
    $(btnContainer).append(removeBtn);

    // Append the button container to the container
    $(container).append(btnContainer);

    // Append the container in the parent container
    $('#codes').append(container);

    // Increase the length
    $('#length').val(parseInt(length) + 1);

});

function removeField(field) {

    // Get the current length
    length = $('#length').val();

    $("#" + field).parent().children().toggleClass('bounceOutLeft', 'bounceInLeft')
    $("#" + field).parent().children().children().toggleClass('bounceOutRight', 'bounceInRight')

    setTimeout(() => {
        $("#" + field).parent().remove();
    }, 450);

    // Decrease the length
    $('#length').val(parseInt(length) - 1);
    
}

function shake(node, callback) {

    animationName = 'shake'

    // const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}
