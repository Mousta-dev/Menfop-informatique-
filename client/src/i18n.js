import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      fr: {
        translation: {
          sidebar: {
            dashboard: 'Tableau de bord',
            establishments: 'Établissements',
            manage_equipment: 'Gérer Équipement',
            new_equipment: 'Nouveau Matériel',
            damaged_equipment: 'Matériel Endommagé',
            functional_equipment: 'Matériel Fonctionnel',
            new_mission: 'Nouvelle Mission',
            view_missions: 'Voir Missions',
            write_report: 'Rédiger Rapport',
            view_reports: 'Voir Rapports',
            user_management: 'Gestion Utilisateurs',
            logout: 'Déconnexion'
          },
          common: {
            search: 'Rechercher...',
            edit: 'Modifier',
            delete: 'Supprimer',
            save: 'Enregistrer',
            cancel: 'Annuler',
            add: 'Ajouter',
            actions: 'Actions',
            status: 'Statut',
            name: 'Nom',
            username: "Nom d'utilisateur",
            password: 'Mot de passe',
            role: 'Rôle',
            login: 'Connexion',
            welcome: 'Bienvenue',
            loading: 'Chargement...',
            error: 'Erreur',
            success: 'Succès',
            error_login_invalid: 'Identifiants invalides',
            error_login_failed: 'Erreur lors de la connexion',
            functional: 'Fonctionnel',
            damaged: 'Endommagé',
            new: 'Nouveau',
            confirm_delete: 'Êtes-vous sûr de vouloir supprimer ceci ?',
            success_delete: 'Supprimé avec succès !',
            success_update: 'Mis à jour avec succès !',
            error_fetch_equipment: 'Échec de la récupération des équipements.',
            error_fetch_establishments: 'Échec de la récupération des établissements.',
            print: 'Imprimer'
          }
        }
      },
      en: {
        translation: {
          sidebar: {
            dashboard: 'Dashboard',
            establishments: 'Establishments',
            manage_equipment: 'Manage Equipment',
            new_equipment: 'New Equipment',
            damaged_equipment: 'Damaged Equipment',
            functional_equipment: 'Functional Equipment',
            new_mission: 'New Mission',
            view_missions: 'View Missions',
            write_report: 'Write Report',
            view_reports: 'View Reports',
            user_management: 'User Management',
            logout: 'Logout'
          },
          common: {
            search: 'Search...',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save Changes',
            cancel: 'Cancel',
            add: 'Add',
            actions: 'Actions',
            status: 'Status',
            name: 'Name',
            username: 'Username',
            password: 'Password',
            role: 'Role',
            login: 'Login',
            welcome: 'Welcome',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            error_login_invalid: 'Invalid credentials',
            error_login_failed: 'Error during login',
            functional: 'Functional',
            damaged: 'Damaged',
            new: 'New',
            confirm_delete: 'Are you sure you want to delete this?',
            success_delete: 'Deleted successfully!',
            success_update: 'Updated successfully!',
            error_fetch_equipment: 'Failed to fetch equipment.',
            error_fetch_establishments: 'Failed to fetch establishments.',
            print: 'Print'
          }
        }
      }
    }
  });

export default i18n;
