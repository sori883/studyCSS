import $ from 'jquery'
import simplicss from '../../../dist/js/simplicss'

$(() => {
    $('#resultUID').text(simplicss.Util.getUID('sc'))
    $('[data-toggle="tooltip"]').tooltip()
})
