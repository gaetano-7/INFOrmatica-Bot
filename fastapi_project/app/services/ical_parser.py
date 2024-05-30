#app/services/ical_parser.py
import requests
import icalendar

def parse_ical(url: str):
    response = requests.get(url)
    response.raise_for_status()
    ical = icalendar.Calendar.from_ical(response.content)
    events = []
    for component in ical.walk():
        if component.name == "VEVENT":
            event = {
                'summary': component.get('SUMMARY'),
                'location': component.get('LOCATION'),
                'description': component.get('DESCRIPTION'),
                'dtstart': component.decoded('DTSTART').isoformat(),
                'dtend': component.decoded('DTEND').isoformat(),
            }
            events.append(event)
    return events
