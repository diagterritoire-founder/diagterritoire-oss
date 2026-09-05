# Notices relatives aux composants tiers

DiagTerritoire utilise des composants logiciels tiers distribués sous leurs licences respectives.

Ce document recense les dépendances directes installées au moment de la préparation Open Source du projet.

Il ne remplace pas l'audit complet des dépendances transitives ni les textes de licence fournis par chaque composant.

## Dépendances d'exécution

| Composant | Version installée | Licence déclarée |
| --- | --- | --- |
| @prisma/adapter-pg | 7.9.1 | Apache-2.0 |
| @prisma/client | 7.9.1 | Apache-2.0 |
| bcryptjs | 3.0.3 | BSD-3-Clause |
| dotenv | 17.4.2 | BSD-2-Clause |
| leaflet | 1.9.4 | BSD-2-Clause |
| next | 16.3.4 | MIT |
| next-auth | 5.0.0-beta.32 | ISC |
| pg | 8.23.0 | MIT |
| react | 19.2.4 | MIT |
| react-dom | 19.2.4 | MIT |

## Dépendances de développement

| Composant | Version installée | Licence déclarée |
| --- | --- | --- |
| @tailwindcss/postcss | 4.3.3 | MIT |
| @types/leaflet | 1.9.22 | MIT |
| @types/node | 20.19.43 | MIT |
| @types/pg | 8.23.1 | MIT |
| @types/react | 19.2.18 | MIT |
| @types/react-dom | 19.2.4 | MIT |
| eslint | 9.39.5 | MIT |
| eslint-config-next | 16.3.4 | MIT |
| prisma | 7.9.1 | Apache-2.0 |
| tailwindcss | 4.3.3 | MIT |
| tsx | 4.23.12 | MIT |
| typescript | 5.9.3 | Apache-2.0 |

## Cartographie

DiagTerritoire utilise directement `leaflet` 1.9.4, dont le paquet installé déclare la licence BSD-2-Clause.

`react-leaflet` et `@react-leaflet/core` ne font plus partie des dépendances du projet.

## Ressources non logicielles

Les licences logicielles ci-dessus ne couvrent pas automatiquement les ressources non logicielles du dépôt, notamment :

- emblèmes ;
- logos ;
- blasons ;
- fichiers GeoJSON ;
- données territoriales ;
- identités graphiques institutionnelles.

Leur provenance, leur régime de réutilisation et les éventuelles obligations d'attribution doivent être vérifiés séparément avant publication publique.

### Ressources exclues de la distribution publique

À l'issue de l'audit DT-OSS-008, les dix ressources ci-dessous ont été retirées du dépôt afin qu'elles ne soient pas incluses dans la distribution publique Open Source de DiagTerritoire :

- `public/emblems/communes/chirongui.jpg`
- `public/emblems/communes/mtsamboro.png`
- `public/emblems/communes/sada.gif`
- `public/emblems/communes/tsingoni.webp`
- `public/emblems/epci/3co.jpg`
- `public/emblems/epci/cadema.png`
- `public/emblems/epci/cagnm.svg`
- `public/emblems/epci/ccpt.jpg`
- `public/emblems/epci/ccsud.jpg`
- `public/emblems/mayotte/departement.svg`

Les analyses de provenance et de droits réalisées lors de DT-OSS-006 sont conservées ci-dessous à titre de traçabilité. Les chemins mentionnés dans ces analyses désignent donc des ressources historiques qui ne font plus partie de la distribution publique actuelle.

### Données géographiques

Le fichier `public/geo/mayotte-communes.geojson` correspond aux 17 communes de Mayotte issues du jeu de données « Contours administratifs », édition 2026, niveau de généralisation 100 m.

La comparaison réalisée dans le cadre de DT-OSS-006A a établi une correspondance complète des géométries et des propriétés `code`, `nom`, `departement`, `region` et `epci` avec le fichier source.

Le jeu « Contours administratifs » est produit à partir des données administratives de référence, notamment ADMIN EXPRESS de l'IGN pour les communes concernées, et est diffusé sous licence Open Data Commons Open Database License (ODbL).

Cette licence s'applique à cette donnée indépendamment de la licence logicielle retenue pour le code de DiagTerritoire.

### Blasons communaux de Mayotte

Les douze fichiers SVG ci-dessous ont été comparés aux révisions correspondantes de Wikimedia Commons dans le cadre de DT-OSS-006B. Pour chacun, la taille et l'empreinte SHA-1 du fichier local correspondent exactement à une révision Commons identifiée.

Ces ressources conservent leur propre licence Creative Commons et ne sont pas placées sous la licence logicielle de DiagTerritoire.

#### CC BY-SA 3.0

- `public/emblems/communes/acoua.svg` — « Blason ville DomFr Acoua (Mayotte).svg » — contributeur de la révision : Yves LG — crédit Commons : Own work — CC BY-SA 3.0 — https://creativecommons.org/licenses/by-sa/3.0
- `public/emblems/communes/kani-keli.svg` — « Blason Kani-Kéli.svg » — auteur et contributeur de la révision : Benzebuth198 — crédit Commons : Own work — CC BY-SA 3.0 — https://creativecommons.org/licenses/by-sa/3.0

#### CC BY-SA 4.0

Les métadonnées Commons indiquent « Own work » pour les fichiers suivants. Le champ auteur n'est pas renseigné dans les métadonnées interrogées ; le contributeur de la révision identifiée est Blazooner.

- `public/emblems/communes/bandraboua.svg` — « Blason ville fr Bandraboua (Mayotte).svg »
- `public/emblems/communes/bandrele.svg` — « Blason ville fr Bandrele (Mayotte).svg »
- `public/emblems/communes/boueni.svg` — « Blason ville fr Bouéni (Mayotte).svg »
- `public/emblems/communes/chiconi.svg` — « Blason ville fr Chiconi (Mayotte).svg »
- `public/emblems/communes/dembeni.svg` — « Blason ville fr Dembeni (Mayotte).svg »
- `public/emblems/communes/dzaoudzi-labattoir.svg` — « Blason ville fr Dzaoudzi (Mayotte).svg »
- `public/emblems/communes/koungou.svg` — « Blason ville fr Koungou (Mayotte).svg »
- `public/emblems/communes/mamoudzou.svg` — « Blason ville fr Mamoudzou (Mayotte).svg »
- `public/emblems/communes/mtsangamouji.svg` — « Blason ville fr M'Tsangamouji (Mayotte).svg »
- `public/emblems/communes/ouangani.svg` — « Blason ville fr Ouangani (Mayotte).svg »

Licence de ces dix fichiers : Creative Commons Attribution-ShareAlike 4.0 International — https://creativecommons.org/licenses/by-sa/4.0

Source de provenance : Wikimedia Commons. Les noms des fichiers Commons sont conservés ci-dessus afin de permettre de retrouver leur page de description, leur historique et leur attribution.

### Emblèmes communaux au format raster

Les cinq emblèmes communaux raster ont fait l'objet d'un audit de provenance dans le cadre de DT-OSS-006C.

- `public/emblems/communes/pamandzi.gif` — correspondance exacte avec « Blason Ville de Pamandzi (Mayotte).gif » sur Wikimedia Commons. Les métadonnées Commons indiquent : auteur « Département de Mayotte », source « mayotte.gouv.fr » et statut « Public domain ». Ce statut devra être conservé avec les éventuelles mentions propres aux emblèmes officiels.

- `public/emblems/communes/sada.gif` — correspondance exacte avec l'image `yt-sad.gif` de FOTW - Flags Of The World. La page consacrée à Sada crédite l'image à Olivier Touzeau, 4 janvier 2025. Les conditions générales de FOTW imposent notamment des restrictions d'usage non commercial ; le fichier ne doit donc pas être considéré comme librement redistribuable dans la publication Open Source de DiagTerritoire sans autorisation complémentaire ou remplacement.

- `public/emblems/communes/tsingoni.webp` — correspondance exacte, octet par octet, avec le fichier « Blason Tsingoni.webp » diffusé par le site de la mairie de Tsingoni. Les droits nécessaires à une redistribution publique dans le dépôt Open Source ne sont pas établis. Une autorisation, un remplacement libre ou une exclusion du dépôt public sera nécessaire avant publication.

- `public/emblems/communes/chirongui.jpg` — provenance exacte non établie à l'issue de l'audit. Les pistes Wikimedia Commons, Département de Mayotte et Armorial examinées n'ont pas permis d'établir une correspondance avec le fichier local.

- `public/emblems/communes/mtsamboro.png` — provenance exacte non établie à l'issue de l'audit. Les recherches Wikimedia Commons et les comparaisons avec plusieurs sources publiques n'ont pas permis d'établir une correspondance exacte.

Les fichiers dont les droits de redistribution ne sont pas établis doivent être autorisés, remplacés par une ressource dont la licence est compatible avec la publication, ou exclus du dépôt public avant l'ouverture Open Source.

### Logos des EPCI de Mayotte

#### CADEMA

Le fichier `public/emblems/epci/cadema.png` présente une forte correspondance visuelle avec le logo officiel « LOGO_CADEMA_HD_RVB » diffusé par le site institutionnel de la Communauté d'agglomération de Dembéni-Mamoudzou (CADEMA).

La comparaison perceptuelle réalisée dans le cadre de DT-OSS-006D a donné une distance de 1/64 en aHash et de 6/64 en dHash. Le fichier local n'est toutefois pas identique au fichier officiel au niveau binaire et doit être considéré comme une reprise ou une adaptation probable du visuel institutionnel.

La provenance institutionnelle du visuel est donc établie avec un niveau de confiance élevé, mais les droits nécessaires à sa redistribution dans un dépôt Open Source ne sont pas établis. Une autorisation explicite, un remplacement par une ressource librement réutilisable ou une exclusion du dépôt public devra être envisagé avant publication.

#### 3CO

Le fichier `public/emblems/epci/3co.jpg` présente une correspondance visuelle complète avec le logo officiel « Logo-3co-cmjn » diffusé par le site institutionnel de la Communauté de communes du Centre-Ouest (3CO).

Le fichier local mesure 1200 × 523 pixels et la version JPEG officielle comparée mesure 1024 × 446 pixels. Après normalisation, la comparaison perceptuelle réalisée dans le cadre de DT-OSS-006D a donné une distance de 0/64 en aHash et de 0/64 en dHash. Les deux visuels doivent donc être considérés comme issus de la même identité graphique, malgré des dimensions et des fichiers binaires différents.

La provenance institutionnelle du visuel est établie avec un niveau de confiance très élevé. Les droits nécessaires à sa redistribution dans un dépôt Open Source ne sont toutefois pas établis et devront être confirmés, ou le fichier remplacé ou exclu avant publication publique.

#### CAGNM

Le fichier `public/emblems/epci/cagnm.svg` correspond exactement au fichier `logo-footer.svg` diffusé par le site institutionnel de la Communauté d'agglomération du Grand Nord de Mayotte (CAGNM).

La comparaison réalisée dans le cadre de DT-OSS-006D a établi une identité binaire complète : même taille de fichier, même empreinte SHA-1 et même empreinte SHA-256.

La provenance institutionnelle du fichier est donc établie. Aucune licence de redistribution Open Source n'étant explicitement attachée au fichier audité, son inclusion dans le futur dépôt public devra néanmoins être autorisée, remplacée par une ressource librement réutilisable ou exclue si les droits nécessaires ne peuvent pas être établis.

#### CCPT

Le fichier `public/emblems/epci/ccpt.jpg` présente une correspondance visuelle complète avec le logo officiel `CCPT-Logo_1.png` diffusé par le site institutionnel de la Communauté de communes de Petite-Terre (CCPT).

La comparaison perceptuelle réalisée dans le cadre de DT-OSS-006D a donné une distance de 0/64 en aHash et de 0/64 en dHash avec cette version officielle. D'autres variantes officielles du même logo (`CCPT_logo_Noir`, `CCPT-Logo-blanc3` et `CCPT-Logo-blanc4`) présentent également une très forte similarité, ce qui confirme que le fichier local est issu de la même identité graphique.

La provenance institutionnelle du visuel est donc établie avec un niveau de confiance très élevé. Les droits nécessaires à sa redistribution dans un dépôt Open Source ne sont toutefois pas établis et devront être confirmés, ou le fichier remplacé ou exclu avant publication publique.

#### CCSUD

Le fichier `public/emblems/epci/ccsud.jpg` n'a pas pu être rattaché avec suffisamment de certitude aux ressources graphiques actuellement diffusées par le site institutionnel de la Communauté de communes du Sud de Mayotte (CCSUD).

Dans le cadre de DT-OSS-006D, le fichier officiel `LOGO_CCSUD.jpg` ainsi que deux variantes graphiques servies par le même site ont été comparés au fichier local. Les distances perceptuelles relevées ne permettent pas d'établir qu'il s'agit du même visuel. Le fichier local contient par ailleurs une métadonnée XMP indiquant une date de création au 6 août 2021, mais cette information ne permet pas à elle seule d'en établir la provenance ou les droits.

La provenance exacte et les droits de redistribution du fichier local ne sont donc pas établis. Avant publication du dépôt Open Source, ce fichier devra faire l'objet d'une justification documentaire ou d'une autorisation, être remplacé par une ressource librement réutilisable ou être exclu du dépôt public.

### Ressources institutionnelles de Mayotte

#### Drapeau de Mayotte

Le fichier `public/emblems/mayotte/assemblee.svg`, malgré son nom interne, correspond exactement au fichier Wikimedia Commons `Flag of Mayotte (Latest version).svg`.

La comparaison réalisée dans le cadre de DT-OSS-006D a établi une identité binaire complète : même taille de 53 268 octets, même empreinte SHA-1 et même empreinte SHA-256.

Le fichier source a été publié sur Wikimedia Commons par Katuni5 comme travail personnel et est distribué sous licence Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0). Cette licence s'applique à cette ressource indépendamment de la licence du logiciel DiagTerritoire. L'attribution et les autres obligations prévues par la CC BY-SA 4.0 doivent être conservées lors de sa redistribution.

#### Logo du Département de Mayotte

Le fichier `public/emblems/mayotte/departement.svg` correspond exactement aux fichiers graphiques diffusés sous les intitulés `Département de Mayotte Logo.svg` sur Wikimedia Commons et `Logo de Mayotte.svg` sur Wikipédia en français.

La comparaison réalisée dans le cadre de DT-OSS-006D a établi une identité binaire complète entre le fichier local et ces deux copies : même taille de 128 376 octets, même empreinte SHA-1 et même empreinte SHA-256. Le fichier local comporte également la métadonnée `sodipodi:docname="charte_graphique.pdf"`, cohérente avec une origine issue de la charte graphique institutionnelle.

Ces éléments permettent d'établir la provenance du visuel avec un niveau de confiance très élevé. Ils ne permettent toutefois pas, à eux seuls, d'établir un droit général de redistribution du logo institutionnel dans un dépôt Open Source. En conséquence, le fichier doit être considéré comme une ressource à droits distincts du logiciel DiagTerritoire. Avant publication publique, son maintien dans le dépôt devra être couvert par une autorisation ou un fondement de réutilisation suffisamment explicite ; à défaut, il devra être remplacé ou exclu.

## Vérifications avant publication

Avant toute publication Open Source, il conviendra notamment de :

- contrôler les dépendances transitives ;
- conserver les notices et attributions exigées par les licences tierces ;
- analyser les vulnérabilités signalées par `npm audit` ;
- vérifier les droits attachés aux ressources non logicielles ;
- confirmer qu'aucune dépendance incompatible avec la licence AGPL-3.0-only applicable au code du projet n'a été introduite.

Les résultats de cet inventaire correspondent à l'état des paquets installés lors de la préparation de la publication Open Source de DiagTerritoire.
