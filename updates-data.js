// Activity log data for Elsewhere / Nobodies Collective Association
// Each entry: { date: "YYYY-MM-DD", source: "Team", text: "Update text" }
// Sorted chronologically, newest first for display
var UPDATES_DATA = [
    // === May 16 ===
    {"date": "2026-05-16", "source": "Governance", "text": "May 14 <a href=\"transparency/2026-05-14-community.html\">community meeting</a> minutes published in 5 languages with full transcript and video recording"},

    // === May 1 ===
    {"date": "2026-05-01", "source": "Governance", "text": "April 30 <a href=\"transparency/2026-04-30-community.html\">community meeting</a> minutes published in 5 languages with full transcript and video recording"},

    // === April 28 ===
    {"date": "2026-04-28", "source": "Logistics", "text": "<a href=\"bus-tickets.html\">Bus schedule</a> published &mdash; Barcelona &harr; Elsewhere, &euro;48 per seat. Sales open Monday 4 May at 20:00 CEST"},

    // === April 23 ===
    {"date": "2026-04-23", "source": "Governance", "text": "April 16 <a href=\"transparency/2026-04-16-community.html\">community meeting</a> minutes published with full transcript and video recording"},

    // === April 21 ===
    {"date": "2026-04-21", "source": "Governance", "text": "April 20 <a href=\"transparency/2026-04-20-board.html\">board meeting</a> minutes published to transparency page"},

    // === April 15 ===
    {"date": "2026-04-15", "source": "Ticketing", "text": "Wave 1 closed — <a href=\"https://tickets.nobodies.team/events/nobodiescollective/2089167\" target=\"_blank\">Wave 2 now on sale at €295</a> until May 14, 23:59 CET"},
    {"date": "2026-04-15", "source": "Tech", "text": "Humans app: sub-team changes, avatar fix and rota view cleanup (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1493790383224782950\" target=\"_blank\">details</a>)"},

    // === April 14 ===
    {"date": "2026-04-14", "source": "Barrios", "text": "Barrios speed dating session planned for Thursday 23rd April — find out more on <a href=\"https://discord.com/channels/1462886445583962245/1492459085952585769\" target=\"_blank\">#barrios</a>"},
    {"date": "2026-04-14", "source": "Governance", "text": "April 13 <a href=\"transparency/2026-04-13-board.html\">board meeting</a> minutes published to transparency page"},

    // === April 13 ===
    {"date": "2026-04-13", "source": "Tech", "text": "You can now mark yourself as 'not coming' on Humans — and many other fixes (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1493247347646529577\" target=\"_blank\">details</a>)"},

    // === April 10 ===
    {"date": "2026-04-10", "source": "Ticketing", "text": "Wave 1 tickets almost sold out! <a href=\"https://tickets.nobodies.team/events/nobodiescollective/2089167\" target=\"_blank\">Get yours before April 14</a>"},
    {"date": "2026-04-10", "source": "Governance", "text": "April 9 <a href=\"transparency/2026-04-09-board.html\">board meeting</a> minutes published to transparency page"},
    {"date": "2026-04-10", "source": "Governance", "text": "April 9 <a href=\"transparency/2026-04-09-community.html\">community meeting</a> minutes published with full transcript and video recording"},

    // === April 9 ===
    {"date": "2026-04-09", "source": "Ambassadors", "text": "Free ambassador spot at AfrikaBurn (from April 27) — ticket, bus and camp covered. Head to <a href=\"https://discord.com/channels/1462886445583962245/1484275426934390875\" target=\"_blank\">#ambassadors on Discord</a> and talk to @Octoprop to find out more"},
    {"date": "2026-04-09", "source": "Tech", "text": "Humans app: coordinator scoping, guest dashboard updates and city planning updates (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1491905978256462005\" target=\"_blank\">details</a>)"},

    // === April 8 ===
    {"date": "2026-04-08", "source": "Governance", "text": "April 6 <a href=\"transparency/2026-04-06-board.html\">board meeting</a> minutes published to transparency page"},
    {"date": "2026-04-08", "source": "Tech", "text": "Humans app: shift overlaps, Barrios summaries and ticket projections (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1491442222120570931\" target=\"_blank\">details</a>)"},
    {"date": "2026-04-08", "source": "Tech", "text": "Humans app: new guest dashboard, staffing hours chart and departmental budgets (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1491374568672202822\" target=\"_blank\">details</a>)"},

    // === April 7 ===
    {"date": "2026-04-07", "source": "Recruitment", "text": "After an executive search spanning 5 continents and possibly involving a conversation in a bungalow at an unspecified tropical location, a Werkhaus lead has been located."},
    {"date": "2026-04-07", "source": "Governance", "text": "April 2 <a href=\"transparency/2026-04-02-board.html\">board meeting</a> minutes published to transparency page"},
    {"date": "2026-04-07", "source": "Governance", "text": "April 2 <a href=\"transparency/2026-04-02-community.html\">community meeting</a> minutes published with full transcript"},
    {"date": "2026-04-07", "source": "Tech", "text": "Humans app: break-even calculations fixed, magic links and feedback features (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1491363288225943622\" target=\"_blank\">details</a>)"},

    // === April 6 ===
    {"date": "2026-04-06", "source": "Tech", "text": "Humans app: interactive city planning map, languages on profiles and budgeting improvements (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1490912861709537372\" target=\"_blank\">details</a>)"},

    // === April 5 ===
    {"date": "2026-04-05", "source": "Barrios", "text": "27 barrios are now <a href=\"https://humans.nobodies.team/Barrios\" target=\"_blank\">registered with Elsewhere</a>"},
    {"date": "2026-04-05", "source": "Comms", "text": "<a href=\"faq.html\">FAQ page</a> updated, reorganised and translated into 5 languages (EN/ES/FR/IT/DE)"},
    {"date": "2026-04-05", "source": "Tech", "text": "Humans app: shift capacity improvements, new notifications and sub-team infrastructure (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1490499262012850267\" target=\"_blank\">details</a>)"},

    // === April 4 ===
    {"date": "2026-04-04", "source": "Tech", "text": "Humans app now has a cash flow statement built in"},
    {"date": "2026-04-04", "source": "Tech", "text": "Humans app now available in Catalan! Plus sub-team managers, notification upgrades and Google sync fixes (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1489825466608128070\" target=\"_blank\">details</a>)"},
    {"date": "2026-04-04", "source": "Barrios", "text": "Confirmed: the Barrios placement app will be used this year to let barrios decide how they will interfere with each other's sound systems"},

    // === April 3 ===
    {"date": "2026-04-03", "source": "Barrios", "text": "<a href=\"Barrio_Guide_2026.pdf\" target=\"_blank\">Barrio Guide 2026</a> published"},
    {"date": "2026-04-03", "source": "Comms", "text": "Logo contest voting briefly published and then pulled due to technical and conceptual issues (or maybe you dreamt it)"},
    {"date": "2026-04-03", "source": "Comms", "text": "Google Ad Grants for non-profits obtained, enabling targeted keyword advertising"},
    {"date": "2026-04-03", "source": "Ticketing", "text": "Emails have gone out to the first batch of successful Low Income Ticket applicants"},

    // === April 2 ===
    {"date": "2026-04-02", "source": "Tech", "text": "Humans app: notification inbox, Staff page, ticketing budget projections (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1489052117493612596\" target=\"_blank\">details</a>)"},
    {"date": "2026-04-02", "source": "Governance", "text": "March 30 <a href=\"transparency/2026-03-30-board.html\">board meeting</a> minutes published to transparency page"},

    // === April 1 ===
    {"date": "2026-04-01", "source": "Press", "text": "First edition of <a href=\"Else_Matters_April_26.pdf\" target=\"_blank\">Else Matters</a> is out!"},
    {"date": "2026-04-01", "source": "Tech", "text": "Humans app: email outboxes, hidden teams and resource management fixes (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1488864109104599211\" target=\"_blank\">details</a>)"},
    {"date": "2026-04-01", "source": "Tech", "text": "Humans app: shift preference wizard, VAT tracking and Google sync improvements (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1488685584099709111\" target=\"_blank\">details</a>)"},

    // === March 31 ===
    {"date": "2026-03-31", "source": "Wellness", "text": "New <a href=\"inclusion.html\">Inclusion page</a> published"},
    {"date": "2026-03-31", "source": "Tech", "text": "Humans app: @nobodies.team email provisioning, non-public roles, and more shift functionality (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1488353012597653624\" target=\"_blank\">details</a>)"},

    // === March 30 ===
    {"date": "2026-03-30", "source": "Finance", "text": "After 287 phone calls, 803 emails and 134.5 in-person visits, our bank account is finally actually open"},
    {"date": "2026-03-30", "source": "Tech", "text": "Humans app updated with dashboard widget, budget coordinator view and guided shift discovery (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1487929515639574570\" target=\"_blank\">details</a>)"},
    {"date": "2026-03-30", "source": "Governance", "text": "March 26 <a href=\"transparency/2026-03-26-board.html\">board meeting</a> minutes published to transparency page"},
    {"date": "2026-03-30", "source": "Governance", "text": "March 26 <a href=\"transparency/2026-03-26-community.html\">community meeting</a> minutes published with full transcript and chat log"},

    // === March 28 ===
    {"date": "2026-03-28", "source": "Tech", "text": "Humans app updated including budget tracking, daily digest and shifts fixes (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1487236567150891109\" target=\"_blank\">details</a>)"},

    // === March 27 ===
    {"date": "2026-03-27", "source": "Wellness", "text": "Participant Wellness has now recruited a record-breaking THREE consent education leads"},
    {"date": "2026-03-27", "source": "Wellness", "text": "Welfare shifts are now live on the <a href=\"https://humans.nobodies.team\" target=\"_blank\">Humans app</a>"},

    // === March 26 ===
    {"date": "2026-03-26", "source": "Comms", "text": "Logo competition closed with 14 submissions"},
    {"date": "2026-03-26", "source": "Tech", "text": "Humans app updated including magic link login, @nobodies.team email accounts and shifts improvements (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1486534834498044072\" target=\"_blank\">details</a>)"},
    {"date": "2026-03-26", "source": "Infra", "text": "67 labour days\u2019 worth of shifts applied for and mostly approved"},
    {"date": "2026-03-26", "source": "Production", "text": "Meeting with Sariñena mayor — site costs confirmed at reduced rate, permit process continuing on track"},

    // === March 25 ===
    {"date": "2026-03-25", "source": "Power", "text": "Power team shift proposals being discussed on <a href=\"https://discord.com/channels/1462886445583962245/1478326781558919380\" target=\"_blank\">#power</a> channel"},

    // === March 24 ===
    {"date": "2026-03-24", "source": "Governance", "text": "March 23 <a href=\"transparency/2026-03-23-board.html\">board meeting</a> minutes published to transparency page"},

    // === March 23 ===
    {"date": "2026-03-23", "source": "Comms", "text": "New outreach plan created — contact #comms to get involved"},
    {"date": "2026-03-23", "source": "Tech", "text": "Humans app updates focused on conversations and shift management (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1485835709456580748\" target=\"_blank\">details</a>)"},

    // === March 22 ===
    {"date": "2026-03-22", "source": "Tech", "text": "Many Humans app updates focused on volunteer management (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1485437717109280919\" target=\"_blank\">details</a>)"},

    // === March 21 ===
    {"date": "2026-03-21", "source": "Ticketing", "text": "<a href=\"local-residents-discount.html\">Local residents discount</a> policy page published (ES/EN/FR)"},

    // === March 20 ===
    {"date": "2026-03-20", "source": "Art", "text": "<a href=\"art-grants.html\">Art grants page</a> has been launched!"},
    {"date": "2026-03-20", "source": "Governance", "text": "NCA now has 44 asociados officially in the system! More on the way!"},
    {"date": "2026-03-20", "source": "Governance", "text": "March 19 <a href=\"transparency/2026-03-19-board.html\">board meeting</a> and <a href=\"transparency/2026-03-19-community.html\">community meeting</a> minutes published to transparency page"},
    {"date": "2026-03-20", "source": "Comms", "text": "Hero section redesigned with animated film grain, dust particles, and handwritten annotations"},
    {"date": "2026-03-20", "source": "Governance", "text": "<a href=\"estatutos.html\">Statutes page</a> fully updated on the website with all amendments and 5-language support"},

    // === March 19 ===
    {"date": "2026-03-19", "source": "Tech", "text": "Humans app updates around camp contacts and profile dropdown (<a href=\"https://discord.com/channels/1462886445583962245/1482356543549739018/1484343776460673214\" target=\"_blank\">details</a>)"},
    {"date": "2026-03-19", "source": "Finance", "text": "First half of creativity budget approved"},
    {"date": "2026-03-19", "source": "Governance", "text": "Process for bringing on new asociados is now active"},
    {"date": "2026-03-19", "source": "Governance", "text": "10 amendments to the association statutes passed by the board"},
    {"date": "2026-03-19", "source": "Comms", "text": "New <a href=\"/#principles\">Elsewhere Principles</a> section with examples"},
    {"date": "2026-03-19", "source": "Wellness", "text": "New <a href=\"consent.html\">Consent page</a> published (EN/ES/FR/IT/DE)"},
    {"date": "2026-03-19", "source": "Comms", "text": "Redesigned \u2018What is Elsewhere?\u2019 website section"},
    {"date": "2026-03-19", "source": "Press", "text": "The Some Times publishes its first edition. Find it on <a href=\"https://discord.com/channels/1462886445583962245/1479879473687171142/1483973847920414793\" target=\"_blank\">Discord</a>"},
    {"date": "2026-03-19", "source": "Tech", "text": "Humans app now supports per-team public pages (click on Edit Page in a team)"},
    {"date": "2026-03-19", "source": "Legal", "text": "\u2018Elsewhere\u2019 name fully cleared by NCA lawyers"},

    // === March 18 ===
    {"date": "2026-03-18", "source": "Ticketing", "text": "Ticketing page is now ready for comms launch"},
    {"date": "2026-03-18", "source": "Board", "text": "Last statutes amendments before members are approved submitted to board for review"},
    {"date": "2026-03-18", "source": "Legal", "text": "Definitive NIF (tax identification number) issued by Hacienda — digital certificate application now underway"},
    {"date": "2026-03-18", "source": "Comms", "text": "Tickets page fully rewritten with pricing waves, alternative ticket paths, and important info section"},
    {"date": "2026-03-18", "source": "Ticketing", "text": "Translated new ticketing legal docs to multiple languages"},

    // === March 17 ===
    {"date": "2026-03-17", "source": "Power", "text": "Power team has created a 'Power AI' and is not worried about it taking over the playa"},
    {"date": "2026-03-17", "source": "Ticketing", "text": "Additional ticketing policy docs added to the website"},
    {"date": "2026-03-17", "source": "Governance", "text": "Posted board meeting minutes from <a href=\"transparency/2026-03-16-board.html\">16 Mar</a>"},
    {"date": "2026-03-17", "source": "Tech", "text": "Obtained non-profit status with Google Workspace"},
    {"date": "2026-03-17", "source": "Comms", "text": "Logo contest launched! Find out more on <a href=\"https://t.me/nobodiescollective\" target=\"_blank\">Telegram</a> and <a href=\"https://chat.whatsapp.com/HXJTO6nevLw9QlORlkHxY0?mode=gi_c\" target=\"_blank\">WhatsApp</a>"},
    {"date": "2026-03-17", "source": "Tech", "text": "Humans app now supports shift setup. RIP FIST"},
    {"date": "2026-03-17", "source": "Ticketing", "text": "<a href=\"low-income-tickets.html\">Low-income ticket</a> policy and process published"},
    {"date": "2026-03-17", "source": "Community", "text": "Barrio registration is open! Register your camp at <a href=\"https://humans.nobodies.team/Barrios\" target=\"_blank\">humans.nobodies.team/Barrios</a>"},
    {"date": "2026-03-17", "source": "Wellness", "text": "Consent team will hold European-consent-coordination deep dive session at ELS"},
    {"date": "2026-03-17", "source": "Tech", "text": "VIM (Volunteer Information Management) aka FIST (\ud83e\udd14) being merged into the Humans app as a single platform"},
    {"date": "2026-03-17", "source": "Community", "text": "Volunteers FAQ being assembled to answer common questions about shifts and participation"},
    {"date": "2026-03-17", "source": "Comms", "text": "Activity log section added to homepage and updates page for ongoing internal comms"},

    // === March 16 ===
    {"date": "2026-03-16", "source": "Community", "text": "NCA representatives confirmed for Burning Man European Leadership Summit in April"},
    {"date": "2026-03-16", "source": "Comms", "text": "\"Burn\" removed from website text across all pages following trademark discussion"},
    {"date": "2026-03-16", "source": "Production", "text": "Work started on converting budget to weekly cash flow plan aligned with event timeline"},
    {"date": "2026-03-16", "source": "Finance", "text": "Bank account opening in final stages \u2014 daily in-person follow-ups at the branch"},
    {"date": "2026-03-16", "source": "Tech", "text": "Humans app live with barrio pages, voucher code management, email tools, and auto drive permissions"},
    {"date": "2026-03-16", "source": "Governance", "text": "Async voting amendment being extracted for standalone vote \u2014 to unblock new membership"},
    {"date": "2026-03-16", "source": "Legal", "text": "Pro bono EU IP lawyer volunteers to help with trademark questions"},
    {"date": "2026-03-16", "source": "Comms", "text": "Board minutes now shared with Comms lead after each meeting to improve coordination"},
    {"date": "2026-03-16", "source": "Comms", "text": "Comms vision discussed: proactive hype generation and community storytelling"},
    {"date": "2026-03-16", "source": "Board", "text": "Board decided to prioritize Directors & Officers liability insurance procurement"},
    {"date": "2026-03-16", "source": "Comms", "text": "March 12 board meeting and community meeting notes published to transparency page"},

    // === March 15 ===
    {"date": "2026-03-15", "source": "Comms", "text": "Homepage ticket section redesigned with clearer pricing tiers and VIP explanation"},
    {"date": "2026-03-15", "source": "Comms", "text": "Elsewhere promo image with glitch effects added to homepage"},
    {"date": "2026-03-15", "source": "Comms", "text": "Ticket voucher code FAQ and dedicated ticketing section added to website"},

    // === March 14 ===
    {"date": "2026-03-14", "source": "Ticketing", "text": "Ticket sales launched on Ticket Tailor with Stripe integration for Elsewhere 2026"},
    {"date": "2026-03-14", "source": "Legal", "text": "Terms & Conditions, Refund Policy, and Privacy Policy published on website"},
    {"date": "2026-03-14", "source": "Legal", "text": "Privacy Policy broadened to cover all NCA websites and services, not just tickets"},
    {"date": "2026-03-14", "source": "Legal", "text": "Ticket transfer and refund policy finalized: no refunds; roll-forward option if event cancelled"},
    {"date": "2026-03-14", "source": "Comms", "text": "5-language switcher added to Code of Conduct, T&Cs, Refund Policy, and Privacy Policy"},
    {"date": "2026-03-14", "source": "Comms", "text": "5-language switcher added to all 26 transparency meeting summary pages"},
    {"date": "2026-03-14", "source": "Comms", "text": "Survival Guide placeholder page created with footer link"},
    {"date": "2026-03-14", "source": "Tech", "text": "200 individual voucher codes created for registered volunteers on Humans platform"},

    // === March 13 ===
    {"date": "2026-03-13", "source": "Comms", "text": "Website fully rebranded around \u2018Elsewhere\u2019 \u2014 shared header/footer extracted across all pages"},
    {"date": "2026-03-13", "source": "Legal", "text": "Participant Code of Conduct published on website with incident reporting section"},
    {"date": "2026-03-13", "source": "Comms", "text": "Join and volunteer redirect pages created for easy sharing"},
    {"date": "2026-03-13", "source": "Comms", "text": "Automated barrio outreach campaign launched \u2014 20+ camps contacted"},
    {"date": "2026-03-13", "source": "Community", "text": "Ellen introduced as new barrio support lead, heading a 5-person outreach team"},
    {"date": "2026-03-13", "source": "Legal", "text": "T&Cs document drafted and shared for publication alongside Code of Conduct"},

    // === March 12 ===
    {"date": "2026-03-12", "source": "Community", "text": "Community call: event name \u2018Elsewhere\u2019 officially announced \u2014 ~75 attendees"},
    {"date": "2026-03-12", "source": "Tech", "text": "Volunteer Information Manager (VIM) integration with Humans app underway"},
    {"date": "2026-03-12", "source": "Tech", "text": "Humans app updated with barrio registration, shift creation, consent tracking"},
    {"date": "2026-03-12", "source": "Production", "text": "Coordinators secured for all but one department; leads still needed in some areas"},
    {"date": "2026-03-12", "source": "Ticketing", "text": "Ticket platform selected: Ticket Tailor + Stripe for sales and payment processing"},
    {"date": "2026-03-12", "source": "Finance", "text": "Non-taxable donation method confirmed alongside ticket purchases"},
    {"date": "2026-03-12", "source": "Finance", "text": "Bank account opening progressing with Sabadell; identity verification submitted"},

    // === March 11 ===
    {"date": "2026-03-11", "source": "Ticketing", "text": "Aaron onboarded as ticketing lead with full system walkthrough from Bruce"},
    {"date": "2026-03-11", "source": "Ticketing", "text": "Ticket types defined: regular, tiered VIP, low-income, carer, youth, vehicle"},
    {"date": "2026-03-11", "source": "Wellness", "text": "Call for consent team volunteers posted; Safer Space Lead identified as critical vacancy"},

    // === March 10 ===
    {"date": "2026-03-10", "source": "Comms", "text": "March 9 board meeting minutes published on transparency page"},

    // === March 9 ===
    {"date": "2026-03-09", "source": "Board", "text": "Association officially registered with government \u2014 temporary NIF received"},
    {"date": "2026-03-09", "source": "Governance", "text": "Event officially named \u2018Elsewhere\u2019 by board vote following community polling"},
    {"date": "2026-03-09", "source": "Governance", "text": "Event location confirmed in Monegros, Spain for July 2026"},
    {"date": "2026-03-09", "source": "Governance", "text": "Classified documentation framework established \u2014 public, restricted, confidential tiers"},
    {"date": "2026-03-09", "source": "Tech", "text": "Volunteer shift system deployed on new server for shift management"},
    {"date": "2026-03-09", "source": "Production", "text": "Daniela\u2019s contractor agreement renewed for continued event organization"},

    // === March 8 ===
    {"date": "2026-03-08", "source": "Production", "text": "Weekly priority system launched: production sends 5 key blockers to board each week"},
    {"date": "2026-03-08", "source": "Board", "text": "Sync call held to align production priorities and board-community communication"},

    // === March 6 ===
    {"date": "2026-03-06", "source": "Comms", "text": "5 new FAQ items added from community call questions; sections restructured"},
    {"date": "2026-03-06", "source": "Comms", "text": "Full Go/No-Go statement published as standalone page linked from FAQ"},
    {"date": "2026-03-06", "source": "Comms", "text": "March 5 board meeting and community call notes published to transparency page"},
    {"date": "2026-03-06", "source": "Finance", "text": "NCA confirmed in official government registry; bank notified to proceed with account"},
    {"date": "2026-03-06", "source": "Production", "text": "Daniela beginning local stakeholder outreach: comarca contacts and local partners"},

    // === March 5 ===
    {"date": "2026-03-05", "source": "Community", "text": "Largest community call yet: ~75 attendees for legal and production updates"},
    {"date": "2026-03-05", "source": "Comms", "text": "Logo contest announced \u2014 community invited to submit vector designs after name reveal"},
    {"date": "2026-03-05", "source": "Production", "text": "Shift from assessment to pre-production mode \u2014 milestones being set"},
    {"date": "2026-03-05", "source": "Legal", "text": "Specialist lawyers advise on organizational structuring and risk mitigation"},
    {"date": "2026-03-05", "source": "Comms", "text": "Standing comms item added to every board meeting agenda"},
    {"date": "2026-03-05", "source": "Community", "text": "Event naming contest underway with 26 options; community survey voting open"},
    {"date": "2026-03-05", "source": "Comms", "text": "Language tightened across all published board meeting summaries and FAQ"},

    // === March 4 ===
    {"date": "2026-03-04", "source": "Comms", "text": "FAQ expanded: 7 new questions, GO announcement banner, linked table of contents"},
    {"date": "2026-03-04", "source": "Comms", "text": "Comms structure proposed: NCA and Comms post independently; Comms owns Instagram"},

    // === March 3 ===
    {"date": "2026-03-03", "source": "Comms", "text": "March 2 board minutes published on transparency page"},
    {"date": "2026-03-03", "source": "Comms", "text": "Community meeting transcripts updated with higher-quality audio transcription"},

    // === March 2 ===
    {"date": "2026-03-02", "source": "Board", "text": "GO decision: community event confirmed for Monegros, Spain, July 7\u201312, 2026"},
    {"date": "2026-03-02", "source": "Governance", "text": "Community go/no-go vote result: 65% yes with 67% participation \u2014 board ratifies"},
    {"date": "2026-03-02", "source": "Finance", "text": "Legal retainer approved covering code of conduct, GDPR, T&Cs, and policies"},
    {"date": "2026-03-02", "source": "Production", "text": "Production coordinator contract confirmed for continued event organization"},
    {"date": "2026-03-02", "source": "Finance", "text": "Board members offer personal interest-free loans to cover first legal installments"},

    // === March 1 ===
    {"date": "2026-03-01", "source": "Comms", "text": "Burning Man HQ reaches out about European Leadership Summit \u2014 NCA invited"},

    // === February 27 ===
    {"date": "2026-02-27", "source": "Governance", "text": "Emergency board meeting: power of attorney granted for contract signing"},
    {"date": "2026-02-27", "source": "Finance", "text": "Bank account opening resolution passed \u2014 three signatories authorized"},
    {"date": "2026-02-27", "source": "Comms", "text": "Feb 26 board and community meeting notes published to transparency page"},
    {"date": "2026-02-27", "source": "Tech", "text": "Humans app link replaces Typeform for volunteer applications on website"},

    // === February 26 ===
    {"date": "2026-02-26", "source": "Community", "text": "Community call: ticketing platform tested successfully, saving thousands in fees"},
    {"date": "2026-02-26", "source": "Ticketing", "text": "Ticket Tailor + Stripe integration tested \u2014 successful test purchase completed"},
    {"date": "2026-02-26", "source": "Governance", "text": "Go/no-go info pack released \u2014 33 interviews across 8 assessment areas"},
    {"date": "2026-02-26", "source": "Governance", "text": "Go/no-go community poll sent to 168 registered association members"},
    {"date": "2026-02-26", "source": "Legal", "text": "Legal counsel confirms low liability risk for association members under Spanish law"},
    {"date": "2026-02-26", "source": "Production", "text": "Power team formed: Javi confirmed as lead with ~6 experienced volunteers"},
    {"date": "2026-02-26", "source": "Governance", "text": "Official voting membership criteria finalized and published to GitHub"},
    {"date": "2026-02-26", "source": "Wellness", "text": "Participant wellness expanding scope to cover collaborators and members pre-event"},
    {"date": "2026-02-26", "source": "Community", "text": "Fundraising event for Curious Creatures scheduled for April 11th"},

    // === February 25 ===
    {"date": "2026-02-25", "source": "Tech", "text": "Humans participant platform launched at humans.nobodies.team"},
    {"date": "2026-02-25", "source": "Comms", "text": "Feb 23 board meeting notes published to transparency page"},

    // === February 23 ===
    {"date": "2026-02-23", "source": "Finance", "text": "Tax ID confirmed \u2014 bank account process unblocked"},

    // === February 22 ===
    {"date": "2026-02-22", "source": "Community", "text": "300 name suggestions received for new event; top 25 shortlisted for ranked-choice vote"},

    // === February 20 ===
    {"date": "2026-02-20", "source": "Comms", "text": "Homepage redesigned: hero newsletter signup, simplified nav, reorganized join section"},
{"date": "2026-02-20", "source": "Comms", "text": "Feb 19 board meeting and community call notes published to transparency page"},

    // === February 19 ===
    {"date": "2026-02-19", "source": "Community", "text": "Community call: production updates, naming contest, and go/no-go process explained"},
    {"date": "2026-02-19", "source": "Governance", "text": "30 new collaborators approved \u2014 total registered collaborators reaches 71"},
    {"date": "2026-02-19", "source": "Governance", "text": "Ranked-choice voting tool set up for community event name selection"},
    {"date": "2026-02-19", "source": "Legal", "text": "Bylaws amendment process initiated to enable asynchronous electronic voting"},
    {"date": "2026-02-19", "source": "Governance", "text": "Membership criteria drafted: 3 months contribution or one event as lead qualifies"},
    {"date": "2026-02-19", "source": "Legal", "text": "D&O insurance and event liability insurance quotes being gathered"},
    {"date": "2026-02-19", "source": "Production", "text": "Site inspection preparations underway; local government relationships confirmed strong"},
    {"date": "2026-02-19", "source": "Comms", "text": "MetaLeads and Participant Wellness meeting notes published to transparency page"},

    // === February 17 ===
    {"date": "2026-02-17", "source": "Production", "text": "First coordinators meeting held \u2014 all departments check in on budgets and staffing"},
    {"date": "2026-02-17", "source": "Wellness", "text": "Participant Wellness fully staffed: med, consent, welfare, and inclusion leads confirmed"},
    {"date": "2026-02-17", "source": "Tech", "text": "Humans app operational \u2014 team management and compliance tracking live"},
    {"date": "2026-02-17", "source": "Comms", "text": "Communications team formed \u2014 newsletter and social outreach beginning"},
    {"date": "2026-02-17", "source": "Production", "text": "Master vendor engagement underway; compiling timeline for all key milestones"},
    {"date": "2026-02-17", "source": "Tech", "text": "Volunteer shift system confirmed open source; preparing deployment to new server"},
    {"date": "2026-02-17", "source": "Comms", "text": "FAQ page launched with key dates timeline and clickable resource links"},
    {"date": "2026-02-17", "source": "Comms", "text": "Feb 16 board meeting notes published to transparency page"},

    // === February 16 ===
    {"date": "2026-02-16", "source": "Production", "text": "Production coordinator confirms event is operationally viable for July 2026"},
    {"date": "2026-02-16", "source": "Production", "text": "Master timeline created with milestones from placements through strike"},
    {"date": "2026-02-16", "source": "Production", "text": "Crew list document created for tracking department members, roles, and arrival dates"},
    {"date": "2026-02-16", "source": "Comms", "text": "Planning calls switched from Zoom to Google Meet"},

    // === February 13 ===
    {"date": "2026-02-13", "source": "Community", "text": "Barrio survey results published for community transparency"},
    {"date": "2026-02-13", "source": "Comms", "text": "Feb 12 board meeting, community meeting, and barrio survey published to website"},
    {"date": "2026-02-13", "source": "Board", "text": "Community FAQ publication agreed as urgent priority to fill information void"},

    // === February 12 ===
    {"date": "2026-02-12", "source": "Comms", "text": "Event name selection process launched \u2014 community invited to suggest names"},
    {"date": "2026-02-12", "source": "Board", "text": "Daniela approved to attend board meetings as non-voting production advisor"},
    {"date": "2026-02-12", "source": "Comms", "text": "Shauna added to board information access for better external comms coordination"},

    // === February 10 ===
    {"date": "2026-02-10", "source": "Governance", "text": "Kate recruited to lead independent community go/no-go decision process"},
    {"date": "2026-02-10", "source": "Community", "text": "Daniel gathered contact details from 37 different barrios through personal outreach"},
    {"date": "2026-02-10", "source": "Comms", "text": "Board meeting notes for Feb 5, 6, 9 published to transparency page"},

    // === February 9 ===
    {"date": "2026-02-09", "source": "Governance", "text": "Community survey launched to gauge commitment for go/no-go decision"},
    {"date": "2026-02-09", "source": "Governance", "text": "26 new collaborator applicants approved \u2014 onboarding accelerated"},
    {"date": "2026-02-09", "source": "Finance", "text": "Board members provide interest-free loans to cover initial operating costs"},
    {"date": "2026-02-09", "source": "Production", "text": "Ward to organize first MetaLeads meeting; departmental structure adopted provisionally"},
    {"date": "2026-02-09", "source": "Governance", "text": "Four board members now required to approve sanitized board minutes for publication"},

    // === February 5 ===
    {"date": "2026-02-05", "source": "Comms", "text": "Desert/sand colour palette applied to website design"},
    {"date": "2026-02-05", "source": "Comms", "text": "Jan 29 community meeting notes with full transcript and chat log published"},
    {"date": "2026-02-05", "source": "Comms", "text": "Last names removed from all published attendee lists for privacy"},
    {"date": "2026-02-05", "source": "Legal", "text": "Volunteer Data Protection Officer confirmed \u2014 corporate lawyer joins pro bono"},
    {"date": "2026-02-05", "source": "Finance", "text": "10% VAT strategy confirmed with lawyers, saving significant costs"},
    {"date": "2026-02-05", "source": "Tech", "text": "Profile management app presented to automate member tracking and compliance"},
    {"date": "2026-02-05", "source": "Community", "text": "Public document created showing all available lead positions"},
    {"date": "2026-02-05", "source": "Governance", "text": "Board confirmed authority to select and approve Meta Leads"},

    // === February 4 ===
    {"date": "2026-02-04", "source": "Tech", "text": "Peter built account management app with Claude in 6 hours for member roles and GDPR"},
    {"date": "2026-02-04", "source": "Finance", "text": "First draft budget presentation prepared for community meeting"},
    {"date": "2026-02-04", "source": "Comms", "text": "Website updated: photo slideshow replaces animated background, planning calls listed"},

    // === February 3 ===
    {"date": "2026-02-03", "source": "Production", "text": "Daniela hired as production coordinator \u2014 event planning expertise secured"},
    {"date": "2026-02-03", "source": "Production", "text": "Immediate priorities set: secure cabins, toilets, and essential vendor contracts"},
    {"date": "2026-02-03", "source": "Comms", "text": "Transparency section launched on website with January board meeting notes"},

    // === February 2 ===
    {"date": "2026-02-02", "source": "Governance", "text": "Contributor agreement and code of conduct approved by the board"},
    {"date": "2026-02-02", "source": "Governance", "text": "First batch of collaborators approved: coordinators, camp leads, key volunteers"},
    {"date": "2026-02-02", "source": "Production", "text": "Board agrees to hire production coordinator to assess event viability"},
    {"date": "2026-02-02", "source": "Comms", "text": "Board commits to publishing sanitized meeting notes for transparency"},
    {"date": "2026-02-02", "source": "Governance", "text": "Radical transparency policy adopted; weekly publication of meeting notes agreed"},
    {"date": "2026-02-02", "source": "Tech", "text": "Two GitHub repositories approved: one public for legal docs, one internal for policies"},
    {"date": "2026-02-02", "source": "Board", "text": "Task management: Discord plus shared spreadsheet adopted for simplicity"},

    // === January 29 ===
    {"date": "2026-01-29", "source": "Community", "text": "First community meeting held \u2014 Chris MCed, Daniel delivered intro, Pablo gave land update"},
    {"date": "2026-01-29", "source": "Finance", "text": "Three board members authorized to manage the new bank account"},
    {"date": "2026-01-29", "source": "Legal", "text": "GDPR ownership assigned \u2014 board member volunteers to lead data protection"},
    {"date": "2026-01-29", "source": "Tech", "text": "Public and internal GitHub repositories created for association documents"},
    {"date": "2026-01-29", "source": "Comms", "text": "Newsletter form and official MailerLite embed set up on website"},
    {"date": "2026-01-29", "source": "Comms", "text": "Lead application form goes live via Typeform link on website"},

    // === January 24 ===
    {"date": "2026-01-24", "source": "Comms", "text": "Website copy updated to reflect this year\u2019s gathering \u2014 first public-facing language set"},

    // === January 19 ===
    {"date": "2026-01-19", "source": "Board", "text": "Event location confirmed in Monegros desert for 2026"},
    {"date": "2026-01-19", "source": "Tech", "text": "Discord server set up as primary coordination platform"},
    {"date": "2026-01-19", "source": "Governance", "text": "Domain registered and Google Workspace set up for the association"},
    {"date": "2026-01-19", "source": "Governance", "text": "Blog platform planned for publishing meeting minutes to the community"},

    // === January 17 ===
    {"date": "2026-01-17", "source": "Legal", "text": "Prerequisites outlined: legal constitution, bylaws, bank account, Stripe setup needed"},

    // === January 15 ===
    {"date": "2026-01-15", "source": "Governance", "text": "NCA board holds its first official meeting \u2014 Daniel confirmed as chair per statutes"},
    {"date": "2026-01-15", "source": "Governance", "text": "Quorum rules set: 50% + two-thirds majority for statute changes"},
    {"date": "2026-01-15", "source": "Governance", "text": "General Assembly lead time changed from one month to 15 days for flexibility"},
    {"date": "2026-01-15", "source": "Governance", "text": "Unanimous board support confirmed for pursuing an event in 2026"},
    {"date": "2026-01-15", "source": "Board", "text": "Daniel proposed Holacracy-inspired facilitation model for tactical meetings"},
    {"date": "2026-01-15", "source": "Governance", "text": "Board agreed to seek new members starting in March"}
];
