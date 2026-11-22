# Portfolio — Louis Delfosse

Site statique (HTML/CSS/JS, sans framework), hébergé sur GitHub Pages.

## Structure
- `index.html` : accueil (présentation, compétences, projets, parcours, contact)
- `projets/*.html` : une fiche par projet (copier `prehenseur.html` pour en créer une nouvelle)
- `assets/css/style.css` : styles (couleurs en haut du fichier, variables `--navy-*` et `--orange`)
- `assets/js/main.js` : robot du menu, menu mobile, agrandissement des images
- `assets/img/<projet>/` : images (JPG, largeur 1400 px max de préférence)
- `assets/CV_Louis_Delfosse.pdf` : CV téléchargeable

## Ajouter un projet
1. Copier `projets/prehenseur.html` vers `projets/<nom>.html` et remplacer le texte et les images.
2. Ajouter une carte `<a class="project-card" href="projets/<nom>.html">` dans la section Projets de `index.html`.
3. Chaque titre portant `data-waypoint="..."` crée automatiquement un repère sur le rail du robot.
