var _currentFill = localStorage._currentFill || "#5993FF";
var mysvg;

$(function () {
    //    if(document.referrer != ''){
    //        $('#cancel-btn').attr('href', document.referrer);
    //        $('#dontsave-btn').attr('href', document.referrer);
    //    }


    $('.color-sample').click(function () {
        $('.color-sample.selected').removeClass('selected');
        $(this).addClass('selected');
        _currentFill = $(this).css('background-color');
    });

    var $object = $('.svg-container > object');
    mysvg = $object[0];
    var filename;
    mysvg.addEventListener('load', function () {
        var svg = mysvg.contentDocument.getElementsByTagName('svg')[0];

        filename = $object.attr('data').match(/[^\/]+$/)[0];
        if (localStorage[filename]) {
            $(svg).html(localStorage[filename]);
        }

        svg.addEventListener('mousedown', function (event) {
            //            console.log(event.target);
            if (event.target.tagName != 'svg') {
                paint(event.target);
                $('#cancel-btn').attr('href', "#");
                $('#cancel-btn').attr('onclick', "showCancelBox()");
            }
        });
    });

    $('.clear-drawing').click(function() {
       if (confirm('Are you sure you want to clear this page and start over?')) {
           localStorage.removeItem(filename);
           window.location = window.location;
       }
    });

    $('.save').click(generateSvg);
    $('.print').click(function() { window.print() });
});

const undos = [];
function paint(target) {
    // Prevent coloring over black shapes.
    var targetFill = $(target).css('fill');
    if ( targetFill ===  'rgb(0, 0, 0)') {
        targetFill = 'rgb(1, 1, 1)'
    }
    undos.push({target: target, fill: targetFill});
    if ($('#blend-mode')[0].checked) {
        var oldFill = $(target).css('fill');
        if ( ! oldFill)
            $(target).css('fill', _currentFill);
        else {
            $(target).css('fill', blend_colors(oldFill, _currentFill, 0.5));
        }
    } else {
        $(target).css('fill', _currentFill);
    }
    saveSvg();
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
        localStorage._currentFill = _currentFill;
    });

}

function saveSvg() {
    var $object = $('.svg-container object:first');

    var filename = $object.attr('data').match(/[^\/]+$/)[0];

    localStorage[filename] = $('svg', $object[0].contentDocument).html();

}





/*
 blend two colors to create the color that is at the percentage away from the first color
 this is a 5 step process
 1: validate input
 2: convert input to 6 char hex
 3: convert hex to rgb
 4: take the percentage to create a ratio between the two colors
 5: convert blend to hex
 @param: color1      => the first color, hex (ie: #000000)
 @param: color2      => the second color, hex (ie: #ffffff)
 @param: percentage  => the distance from the first color, as a decimal between 0 and 1 (ie: 0.5)
 @returns: string    => the third color, hex, represenatation of the blend between color1 and color2 at the given percentage
 */
function blend_colors(color1, color2, percentage)
{
    // check input
    color1 = color1 || '#000000';
    color2 = color2 || '#ffffff';
    percentage = percentage || 0.5;

    // 1: validate input, make sure we have provided a valid hex
    //if (color1.length != 4 && color1.length != 7)
    //    throw new error('colors must be provided as hexes');
    //
    //if (color2.length != 4 && color2.length != 7)
    //    throw new error('colors must be provided as hexes');

    if (percentage > 1 || percentage < 0)
        throw new error('percentage must be between 0 and 1');

    // 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
    //      the three character hex is just a representation of the 6 hex where each character is repeated
    //      ie: #060 => #006600 (green)
    if (color1.length == 4)
        color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
    else if(color1.length == 7)
        color1 = color1.substring(1);
    if (color2.length == 4)
        color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
    else if(color2.length == 7)
        color2 = color2.substring(1);

    if (color1.match(/^rgb/)) {
        color1 = color1.match(/[\d,\s]+/)[0].split(',')
            .map(function(s) {return parseInt(s.trim(), 10);});
    } else {
        color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
    }
    if (color2.match(/^rgb/)) {
        color2 = color2.match(/[\d,\s]+/)[0].split(',')
          .map(function(s) {return parseInt(s.trim(), 10);});
    } else {
        color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];
    }

    // 4: blend
    var color3 = [
        (1 - percentage) * color1[0] + percentage * color2[0],
        (1 - percentage) * color1[1] + percentage * color2[1],
        (1 - percentage) * color1[2] + percentage * color2[2]
    ];

    // 5: convert to hex
    color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);

    // return hex
    return color3;
}

/*
 convert a Number to a two character hex string
 must round, or we will end up with more digits than expected (2)
 note: can also result in single digit, which will need to be padded with a 0 to the left
 @param: num         => the number to conver to hex
 @returns: string    => the hex representation of the provided number
 */
function int_to_hex(num)
{
    var hex = Math.round(num).toString(16);
    if (hex.length == 1)
        hex = '0' + hex;
    return hex;
}

function generateSvg() {
    var $object = $('.svg-container object:first');
    var filename = $object.attr('data').match(/[^\/]+$/)[0];
    download(filename, $('svg', $object[0].contentDocument)[0].outerHTML);
}


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}