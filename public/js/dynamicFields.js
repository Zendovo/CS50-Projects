$('.addField').click(function() {

    // Get the current count
    var count = parseInt($('#count').val()) + 1;
    console.log('count', count)

    // Increase the count
    $('#count').val(count);
    
    var newField = `<div class="input-group mb-3">
                        <input type="text" class="form-control border animated bounceInLeft" name="code_${count}" id="code_${count}" placeholder="Enter code..." required>
                        <div class="input-group-append">
                            <button type="button" onclick="removeField(${count});" class="btn btn-danger btn-remove animated bounceInRight code_btn-${count}">-</button>
                        </div>
                    </div>`

    if (count > 3) {

        console.log('.code_btn-' + (count - 1));
        $('.code_btn-' + (count - 1)).prop('disabled', true)

    }

    // Append the container in the parent container
    $('#codes').append(newField);    

});

function removeField(field) {

    // Get the current count
    count = $('#count').val();

    $('#code_' + field).toggleClass('bounceOutLeft', 'bounceInLeft')
    $('.code_btn-' + field).toggleClass('bounceOutRight', 'bounceInRight')

    $('.addField').prop('disabled', true);

    $('#code_' + field).on('animationend', () => {

        $('.addField').prop('disabled', false);
        $('#code_' + field).parent().remove();
        
        if (count > 2) {
            console.log('.code_btn-' + (count - 1));
            $('.code_btn-' + (count - 1)).prop('disabled', false)
        }

        // Decrease the count
        $('#count').val(parseInt(count) - 1);

    })
    
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
