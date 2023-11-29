import csv
import urllib.request
import os

def download_image(id, url, path):
    urllib.request.urlretrieve(url, os.path.join(path, f"{id}.jpg"))

# Podaj tu sciezkę do miejsca, gdzie chcesz zapisac pobrane obrazy
path_to_save = 'C:/Users/x/Desktop/proba_sciaganie/test/zdjecia' # Zamień 'C:/Dokumenty/PobraneObrazy' na rzeczywistą ścieżkę

with open('C:/Users/x/Desktop/proba_sciaganie/test/test_2.csv', 'r') as csv_file:  # Zamień 'C:/Dokumenty/your_file.csv' na rzeczywistą ścieżkę
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        download_image(row['id'], row['link'], path_to_save)