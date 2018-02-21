var _currentFill;

$(function () {
    //    if(document.referrer != ''){
    //        $('#cancel-btn').attr('href', document.referrer);
    //        $('#dontsave-btn').attr('href', document.referrer);
    //    }

    _currentFill = $('.color-sample.selected').css('background-color');

    $('.color-sample').click(function () {
        $('.color-sample.selected').removeClass('selected');
        $(this).addClass('selected');
        _currentFill = $(this).css('background-color');
    });

    mysvg = $('.svg-container object')[0];
    mysvg.addEventListener('load', function () {
        var svg = mysvg.contentDocument.getElementsByTagName('svg')[0];
        svg.addEventListener('mousedown', function (event) {
            //            console.log(event.target);
            if (event.target.tagName != 'svg') {
                paint(event.target);
                $('#cancel-btn').attr('href', "#");
                $('#cancel-btn').attr('onclick', "showCancelBox()");
            }
        });
    });
});

function paint(target) {
    // Prevent coloring over black shapes.
    if ( $(target).css('fill') ===  'rgb(0, 0, 0)') {
        return;
    }
    $(target).css('fill', _currentFill);
}

function showCancelBox() {
    $('#cancel-msg').removeClass('hidden');
}

$('#zoom').on('input', (e) => {
    $(mysvg).css('transform', `scale(${1 + e.target.value / 10})`);
});
$('#color').on('change', (e) => {
    if (e.currentTarget.value === '#000000') {
        return;
    }
    $('.color-sample.selected').removeClass('selected');
    $(this).addClass('selected');
    _currentFill = e.currentTarget.value;
});

function addSample() {
    let $sample = $('.palette > div:last-child').clone();
    $sample
      .find('.color-sample')
      .css('background', _currentFill);
    $sample.appendTo($('.palette'));
}

function submitData(paintid) {

    var formData = new FormData();
    var mysvg = $('.svg-container object')[0].contentDocument.getElementsByTagName('svg')[0];

    formData.append('svg', $('.svg-container object')[0].className);
    formData.append('paintname', document.getElementById('paintname').value);
    if (paintid != '')
        formData.append('id', paintid);

    var paths = [];
    paths.push(mysvg.getElementsByTagName('path'), mysvg.getElementsByTagName('circle'), mysvg.getElementsByTagName('ellipse'), mysvg.getElementsByTagName('polygon'), mysvg.getElementsByTagName('rect'));
    console.log(paths);

    var index = 0;
    for (var i = 0; i < paths.length; i++) {
        for (var j = 0; j < paths[i].length; j++) {
            formData.append('piece-' + index, paths[i][j].style.fill);
            index++;
        }
    }

    fetch('/save', {
        method: 'POST',
        body: formData
    }).then(function (res) {
        return res.text();
    }).then(function (text) {
        //        console.log(text);
        window.location.href = '/#works';
    });
    //    console.log(formData.get('svgdata'));
}

function toggleForm() {
    if ($('.toggle-btn').html() == '+')
        $('.toggle-btn').html('-');
    else
        $('.toggle-btn').html('+');

    var toShow = $('.hidden-xs');
    var toHide = $('.hidden-xs-off');
    toShow.addClass('hidden-xs-off').removeClass('hidden-xs');
    toHide.addClass('hidden-xs').removeClass('hidden-xs-off');
}