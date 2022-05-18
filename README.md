# Auvi README

## Projekt einrichten

Um das Projekt zum Laufen zu bekommen muss [node](https://nodejs.org/en/download/) mit seinem Packagemanager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) auf dem Gerät installiert sein. Anschließend muss der folgende Befehl im root Ordner des Projektes ausgeführt werden:

```
npm install
```
Getestete Versionen:
- node: v12.18.3 
- npm: v8.5.5

## Projekt starten

Folgenden Befehl im root Ordner des Projektes ausführen:
```
node .
```
Anschließend sollten folgende Nachrichten kommen:
```
Auvi listening on port 3000!
Browser launched
```
Das Webinterface sollte erfolgreich gestartet haben! Jetzt kannst du über [localhost:3000](http://localhost:3000/) auf das Webinterface zugreifen!

## Custom input.json

Die json mit den Anweisungen muss folgendes Format besitzen:
```
{
    "colors": [
        [rot, grün, blau], // Erste Farbe
        [rot, grün, blau], // Erste Farbe Besonders
        [rot, grün, blau], // Zweite Farbe
        [rot, grün, blau] // Zweite Farbe Besonders
    ],
    "files": [
        {
            name: "name",
            "NM1": [],
            "NM2": [],
            "NIC": []
        }
    ]
}
```
Die Datei muss mit der Endung .json sein!
Diese dann im [.input](https://github.com/Maettis/Auvi/tree/master/.input) folder ablegen.

## Output

Die Frames werden im /.output/ Ordner zwischengespeichert. Die Videos, welche letzten Endes exportiert werden findest du im /videos/ Ordner mit dem entsprechenden Namen.