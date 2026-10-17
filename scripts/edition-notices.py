#!/usr/bin/env python3
"""Render a shared edition notice as static HTML (no browser JS required).

Run after editing an archived page; --check verifies generated notices.
The PDFs themselves are preserved as the original 2026 documents.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
COPY = {
    "en": ("2026 archive — the event has ended",
           "This page and its linked 2026 guides and PDFs are historical reference, not current applications, bookings or instructions for a future event. Future arrangements are not confirmed here.",
           "Browse the Elsewhere 2026 archive"),
    "es": ("Archivo de 2026 — el evento ha terminado",
           "Esta página y las guías y PDF de 2026 enlazados son una referencia histórica, no solicitudes, reservas ni instrucciones vigentes para un futuro evento. Aquí no se confirman las condiciones de futuros eventos.",
           "Ver el archivo de Elsewhere 2026"),
    "fr": ("Archives 2026 — l’événement est terminé",
           "Cette page et les guides et PDF de 2026 liés sont des documents historiques, et non des candidatures, réservations ou consignes actuelles pour un futur événement. Les dispositions futures ne sont pas confirmées ici.",
           "Consulter les archives d’Elsewhere 2026"),
    "it": ("Archivio 2026 — l’evento è terminato",
           "Questa pagina e le guide e i PDF del 2026 collegati sono documenti storici, non domande, prenotazioni o istruzioni attuali per un evento futuro. Le disposizioni future non sono confermate qui.",
           "Consulta l’archivio di Elsewhere 2026"),
    "de": ("Archiv 2026 — die Veranstaltung ist vorbei",
           "Diese Seite und die verlinkten Leitfäden und PDFs von 2026 dienen als historische Referenz, nicht als aktuelle Bewerbungen, Buchungen oder Anweisungen für eine künftige Veranstaltung. Künftige Regelungen werden hier nicht bestätigt.",
           "Zum Archiv von Elsewhere 2026"),
    "ca": ("Arxiu de 2026 — l’esdeveniment ha acabat",
           "Aquesta pàgina i les guies i PDF de 2026 enllaçats són una referència històrica, no sol·licituds, reserves ni instruccions vigents per a un esdeveniment futur. Aquí no es confirmen les condicions de futurs esdeveniments.",
           "Consulta l’arxiu d’Elsewhere 2026"),
}
WEATHER_COPY = {
    "en": "Not a live safety service. The text below preserves June–July 2026 communications: forecasts, future tenses and on-site contacts refer only to that period. This record is no longer updated.",
    "es": "No es un servicio de seguridad en directo. El texto conserva comunicaciones de junio y julio de 2026: las previsiones, los tiempos futuros y los contactos del recinto se refieren solo a ese periodo. Este registro ya no se actualiza.",
    "fr": "Ce n’est pas un service de sécurité en direct. Le texte conserve les communications de juin et juillet 2026 : prévisions, formulations au futur et contacts sur site concernent uniquement cette période. Ces archives ne sont plus mises à jour.",
    "it": "Non è un servizio di sicurezza in tempo reale. Il testo conserva le comunicazioni di giugno e luglio 2026: previsioni, tempi futuri e contatti sul posto si riferiscono solo a quel periodo. Questo archivio non viene più aggiornato.",
    "de": "Kein aktueller Sicherheitsdienst. Der folgende Text bewahrt Mitteilungen vom Juni und Juli 2026: Vorhersagen, Zukunftsformulierungen und Vor-Ort-Kontakte beziehen sich nur auf diesen Zeitraum. Dieses Archiv wird nicht mehr aktualisiert.",
    "ca": "No és un servei de seguretat en directe. El text conserva comunicacions de juny i juliol de 2026: les previsions, els temps futurs i els contactes del recinte es refereixen només a aquell període. Aquest registre ja no s’actualitza.",
}
PAGES = [
    "bus-tickets.html", "art-grants.html", "werkhaus.html",
    "local-residents-discount.html", "low-income-tickets.html",
    "getting-there.html", "barrios.html", "rideshare.html",
    "weather-alerts.html", "survival-guide.html",
] + [f"{guide}-{lang}.html" for guide in ("barrio-guide", "survival-guide")
     for lang in ("en", "es", "fr", "it", "de")]
NOTICE = re.compile(r"\n?<!-- edition-notice:start -->.*?<!-- edition-notice:end -->", re.S)
BLOCK = re.compile(r'<div\b[^>]*class="[^"]*\blang-content\b[^"]*"[^>]*data-lang="([^"]+)"[^>]*>')


def notice(lang, weather=False):
    title, body, link = COPY[lang]
    return (
        '\n<!-- edition-notice:start -->\n'
        '<aside class="edition-notice" style="margin:1.5rem auto;padding:1.25rem;'
        'max-width:1100px;border:2px solid #945124;border-radius:8px;'
        'background:#fff5df;color:#24201b;font:1rem/1.6 Inter,sans-serif">'
        f'<strong>{title}</strong><p>{body}</p>'
        + (f'<p>{WEATHER_COPY[lang]}</p>' if weather else '') +
        f'<a href="2026-archive.html" style="color:#713b17;text-decoration:underline">{link}</a>'
        '</aside>\n<!-- edition-notice:end -->'
    )


def render(text, weather=False):
    text = NOTICE.sub("", text)
    if BLOCK.search(text):
        return BLOCK.sub(lambda m: m[0] + notice(m[1], weather), text)
    lang = re.search(r'<html[^>]*lang="([^"]+)"', text)[1]
    # Single-language guides: place inside main, before the guide's own content.
    single = notice(lang).replace("margin:1.5rem auto", "margin:6rem auto 1.5rem")
    return re.sub(r"<main\b[^>]*>", lambda m: m[0] + single, text, count=1)


if __name__ == "__main__":
    failed = []
    for name in PAGES:
        path = ROOT / name
        original = path.read_text()
        result = render(original, weather=name == "weather-alerts.html")
        if "--check" in sys.argv:
            if result != original:
                failed.append(name)
        elif result != original:
            path.write_text(result)
            print(name)
    if failed:
        sys.exit("Edition notices need rendering: " + ", ".join(failed))
