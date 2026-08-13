// Community Planning Calls — renders the next N Thursday-8PM-Madrid call cards.
// Dates are computed client-side so the cards never go stale.
(function () {
    'use strict';

    var container = document.getElementById('call-cards-auto');
    if (!container) return;

    var MEET_URL = 'https://meet.google.com/ers-prkd-rzt';
    var CALL_COUNT = 2;          // how many upcoming calls to show
    var CALL_HOUR = 20;          // 20:00 Madrid time
    var CALL_END = 21 * 60 + 30; // keep today's card up until 21:30 Madrid time
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Current date + time in Europe/Madrid, regardless of the visitor's timezone.
    var parts = {};
    new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });

    // Anchor at UTC noon so date arithmetic never slips a day.
    var d = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, 12));
    var nowMinutes = (+parts.hour % 24) * 60 + (+parts.minute);

    // Next Thursday (getUTCDay() === 4); today counts until the call ends.
    var daysAhead = (4 - d.getUTCDay() + 7) % 7;
    if (daysAhead === 0 && nowMinutes >= CALL_END) daysAhead = 7;
    d.setUTCDate(d.getUTCDate() + daysAhead);

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    var html = '';
    for (var i = 0; i < CALL_COUNT; i++) {
        var ymd = '' + d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
        var calUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
            '&text=' + encodeURIComponent('Elsewhere Community Planning Call') +
            '&dates=' + ymd + 'T' + pad(CALL_HOUR) + '0000/' + ymd + 'T213000' +
            '&ctz=Europe%2FMadrid' +
            '&details=' + encodeURIComponent('Weekly community planning call for Elsewhere. Every Thursday at 8:00 PM (Madrid time).\n\nGoogle Meet: ' + MEET_URL) +
            '&location=' + encodeURIComponent('Google Meet');

        html +=
            '<div class="call-card">' +
                '<div class="call-date">' +
                    '<span class="call-day">' + d.getUTCDate() + '</span>' +
                    '<span class="call-month">' + MONTHS[d.getUTCMonth()] + '</span>' +
                '</div>' +
                '<div class="call-details">' +
                    '<strong>Community Planning Call</strong>' +
                    '<span>Thursday, 8:00 PM (Madrid time)</span>' +
                    '<div class="call-links">' +
                        '<a href="' + MEET_URL + '" target="_blank" rel="noopener noreferrer" class="btn-link">Join Call</a>' +
                        '<a href="' + calUrl + '" target="_blank" rel="noopener noreferrer" class="btn-link">Add to Calendar</a>' +
                    '</div>' +
                '</div>' +
            '</div>';

        d.setUTCDate(d.getUTCDate() + 7);
    }

    container.insertAdjacentHTML('afterbegin', html);
})();
