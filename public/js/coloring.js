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

const undos = [];
function paint(target) {
    // Prevent coloring over black shapes.
    var targetFill = $(target).css('fill');
    if ( targetFill ===  'rgb(0, 0, 0)') {
        targetFill = 'rgb(1, 1, 1)'
    }
    undos.push({target: target, fill: targetFill});
    $(target).css('fill', _currentFill);
}
function unpaint() {
    if (undos.length) {
        const undo = undos.pop();
        $(undo.target).css('fill', undo.fill);
    }
}

function showCancelBox() {
    $('#cancel-msg').removeClass('hidden');
}
$('#undo').on('click', function(e) {
    e.preventDefault();
    unpaint();
})
$('#zoom').on('input', function (e) {
    $(mysvg).css('transform', 'scale(' + 1 + e.target.value / 10 + ')');
});
$('#color').on('change', function (e) {
    if (e.currentTarget.value === '#000000') {
        return;
    }
    $('.color-sample.selected').removeClass('selected');
    $(this).addClass('selected');
    _currentFill = e.currentTarget.value;
});

function addSample() {
    var $sample = $('.palette > div:last-child').clone();
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

function bindCrayons() {

    $crayons = $('svg #crayon-icons > g', $('object.crayons')[0].contentDocument);

    $crayons.on('click', function(e) {
        $crayons.removeClass('selected');
        var $crayon = $(e.currentTarget).addClass('selected');
        _currentFill = $crayon.children('path').attr('fill');
    });

}