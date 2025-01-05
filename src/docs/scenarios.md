# Scénarios d'Utilisation

## 1. Système de Pas et Points

### Scénario : Conversion des pas en points
1. **Contexte**
   - Utilisateur : Alice
   - Objectif quotidien : 10 000 pas
   - Taux de conversion : 1 pas = 0.1 point

2. **Déroulement**
   - Alice marche 10 000 pas dans la journée
   - Le système détecte automatiquement les pas via le podomètre
   - Les pas sont convertis en points (10 000 × 0.1 = 1000 points)
   - Les statistiques d'Alice sont mises à jour
   - L'activité est enregistrée dans l'historique

3. **Résultat**
   - Alice gagne 1000 points
   - Son objectif quotidien est atteint
   - Elle peut consulter sa progression dans le dashboard

## 2. Système de Récompenses

### Scénario : Échange de points contre une récompense
1. **Contexte**
   - Utilisateur : Bob
   - Solde : 5000 points
   - Récompense visée : Bon d'achat de 30€ (3000 points)

2. **Déroulement**
   - Bob consulte le catalogue des récompenses
   - Il sélectionne le bon d'achat à 3000 points
   - Le système vérifie son solde de points
   - Bob confirme l'échange
   - Les points sont débités de son compte
   - La récompense est ajoutée à son historique

3. **Résultat**
   - Nouveau solde : 2000 points
   - Bob reçoit une confirmation
   - La récompense apparaît dans son historique

## 3. Système Social

### Scénario A : Don de points à un institut
1. **Contexte**
   - Utilisateur : Alice (1000 points)
   - Institut : Institut Curie
   - Type de don : Recherche contre le cancer

2. **Déroulement**
   - Alice accède à la section "Dons aux instituts"
   - Elle sélectionne l'Institut Curie
   - Elle choisit le montant : 500 points
   - Elle confirme le don
   - Le système vérifie son solde
   - Les points sont transférés à l'institut
   - Elle reçoit un reçu fiscal

3. **Résultat**
   - Alice : 500 points restants
   - Institut Curie : +500 points
   - L'historique des dons est mis à jour
   - Un reçu fiscal est généré

### Scénario B : Partage de points entre amis
1. **Contexte**
   - Utilisateur 1 : Alice (1000 points)
   - Utilisateur 2 : Bob (ami d'Alice)
   - Montant à partager : 500 points

2. **Déroulement**
   - Alice accède à sa liste d'amis
   - Elle sélectionne Bob
   - Elle entre le montant : 500 points
   - Elle confirme le partage
   - Le système vérifie son solde
   - Les points sont transférés
   - Bob reçoit une notification

3. **Résultat**
   - Alice : 500 points restants
   - Bob : +500 points
   - L'historique des partages est mis à jour

## 4. Espace Partenaires

### Scénario : Gestion d'une commande
1. **Contexte**
   - Partenaire : Restaurant ABC
   - Client : Alice
   - Commande : Menu à 1000 points

2. **Déroulement**
   - Alice passe la commande
   - Le restaurant reçoit une notification
   - Le gérant consulte les détails
   - Il confirme la commande
   - Il prépare la commande
   - Il marque la commande comme complétée

3. **Résultat**
   - Alice reçoit une notification de confirmation
   - Les points sont débités
   - La commande apparaît dans l'historique

## 5. Système d'Avis

### Scénario : Cycle d'avis complet
1. **Contexte**
   - Client : Bob
   - Partenaire : Restaurant ABC
   - Commande complétée

2. **Déroulement**
   - Bob laisse un avis 4 étoiles avec commentaire
   - Le restaurant reçoit une notification
   - Le gérant lit l'avis
   - Il rédige une réponse
   - L'avis et la réponse sont publiés

3. **Résultat**
   - Note moyenne du restaurant mise à jour
   - Avis visible sur la page du restaurant
   - Réponse associée à l'avis

## 6. Authentification

### Scénario : Inscription et connexion
1. **Contexte**
   - Nouvel utilisateur : Charlie
   - Email : charlie@example.com

2. **Déroulement**
   - Charlie remplit le formulaire d'inscription
   - Il reçoit un email de confirmation
   - Il valide son compte
   - Il se connecte
   - Il complète son profil
   - Il configure ses préférences

3. **Résultat**
   - Compte créé et validé
   - Profil complété
   - Accès à toutes les fonctionnalités

## 7. Bons Plans/Marketplace

### Scénario : Achat avec des points
1. **Contexte**
   - Client : Alice
   - Solde : 2000 points
   - Partenaire : Restaurant ABC

2. **Déroulement**
   - Alice parcourt les catégories
   - Elle sélectionne "Restaurants"
   - Elle consulte la page du Restaurant ABC
   - Elle vérifie les avis (4.5/5)
   - Elle sélectionne un menu à 1500 points
   - Elle confirme la commande

3. **Résultat**
   - Points débités : 1500
   - Commande enregistrée
   - Notification envoyée au restaurant
   - Confirmation reçue par Alice 