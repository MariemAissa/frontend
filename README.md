📋 Description du Projet

Plateforme de blog collaboratif multi-auteurs développée avec le stack MEAN (MongoDB, Express.js, Angular, Node.js) intégrant des fonctionnalités temps réel et une gestion avancée des permissions.

✨ Fonctionnalités

🔐 Authentification & Utilisateurs 
  * Inscription/Connexion sécurisée avec JWT + Refresh Token

  * Système de rôles dynamiques : Admin, Éditeur, Rédacteur, Lecteur

  * Gestion des permissions via interface Angular

  * Hashing des mots de passe avec bcrypt

📝 Gestion des Articles (CRUD Avancé)

  * Création/Modification/Suppression d'articles avec permissions granulaires

  * Champs d'article : Titre, contenu, image, tags, auteur, dates

  * Permissions par rôle :

      * Admin/Éditeur : Modifier tous les articles

      * Rédacteur : Modifier seulement ses articles

      * Admin : Suppression d'articles

🚀 Installation et Démarrage

Prérequis
  * Node.js 18+

  * Angular CLI 16+

  * MongoDB 5+

  * npm 


# Installer les dépendances
`npm install`

`ng serve`
