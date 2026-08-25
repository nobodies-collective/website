(function() {
    var el = document.getElementById('shared-header');
    if (!el) return;

    var prefix = el.dataset.prefix || '';

    el.outerHTML =
        '<header class="header">' +
            '<nav class="nav container">' +
                '<a href="' + prefix + '/" class="logo">Nobodies Collective</a>' +
                '<button class="nav-toggle" aria-label="Toggle navigation">' +
                    '<span></span><span></span><span></span>' +
                '</button>' +
                '<ul class="nav-links">' +
                    '<li class="nav-dropdown">' +
                        '<a role="button" tabindex="0" aria-haspopup="true">Event <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
                        '<ul class="nav-dropdown-menu">' +
                            '<li><a href="' + prefix + '/event-dates-2027.html">2027 Dates<span class="nav-badge">In progress</span></a></li>' +
                            '<li><a href="' + prefix + '/art-grants.html">Art Grants</a></li>' +
                            '<li><a href="' + prefix + '/barrios.html">Join a Barrio / Camp</a></li>' +
                            '<li><a href="' + prefix + '/survival-guide.html">Survival Guide</a></li>' +
                            '<li><a href="' + prefix + '/getting-there.html">Getting There</a></li>' +
                            '<li><a href="' + prefix + '/bus-tickets.html">Bus Tickets</a></li>' +
                            '<li><a href="' + prefix + '/volunteering.html">Volunteering<span class="nav-badge">Help needed!</span></a></li>' +
                            '<li><a href="' + prefix + '/werkhaus.html">Werkhaus</a></li>' +
                            '<li><a href="' + prefix + '/travel-reimbursement.html">Travel Reimbursement</a></li>' +
                            '<li><a href="' + prefix + '/speaking-about-elsewhere.html">Speaking About Elsewhere</a></li>' +
                            '<li><a href="' + prefix + '/weather-alerts.html">Weather Alerts</a></li>' +
                        '</ul>' +
                    '</li>' +
                    '<li class="nav-dropdown">' +
                        '<a role="button" tabindex="0" aria-haspopup="true">Culture <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
                        '<ul class="nav-dropdown-menu">' +
                            '<li><a href="' + prefix + '/principles.html">Principles</a></li>' +
                            '<li><a href="' + prefix + '/code-of-conduct.html">Code of Conduct</a></li>' +
                            '<li><a href="' + prefix + '/consent.html">Consent</a></li>' +
                            '<li><a href="' + prefix + '/inclusion.html">Inclusion</a></li>' +
                        '</ul>' +
                    '</li>' +
                    '<li><a href="' + prefix + '/faq.html">FAQ</a></li>' +
                    '<li class="nav-dropdown">' +
                        '<a role="button" tabindex="0" aria-haspopup="true">Association <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
                        '<ul class="nav-dropdown-menu">' +
                            '<li><a href="' + prefix + '/transparency.html">Meetings</a></li>' +
                            '<li><a href="' + prefix + '/working-groups.html">Working Groups</a></li>' +
                            '<li><a href="' + prefix + '/resolutions.html">Resolutions</a></li>' +
                        '</ul>' +
                    '</li>' +
                    /* Hidden: updates link (stale) — was in a Transparency dropdown, removed when the activity feed went; restore as a dropdown if updates.html comes back: '<li><a href="' + prefix + '/updates.html">Updates</a></li>' */
                    '<li><a href="' + prefix + '/#useful-links">Links</a></li>' +
                    /* Hidden: tickets link (not relevant between events) '<li><a href="https://tickets.nobodies.team/events/nobodiescollective/2089167" class="btn btn-primary btn-nav" target="_blank" rel="noopener noreferrer">Tickets</a></li>' + */
                '</ul>' +
            '</nav>' +
        '</header>';
})();
