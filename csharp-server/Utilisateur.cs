using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InventaireCatalogue
{
    public class Utilisateur
    {
        private string nom = string.Empty;
        private string prenom = string.Empty;
        private string nomUtilisateur = string.Empty;
        private string motdepasseUtilisateur = string.Empty;

        public string Nom { get => nom; set => nom = value; }
        public string Prenom { get => prenom; set => prenom = value; }
        public string NomUtilisateur { get => nomUtilisateur; set => nomUtilisateur = value; }
        public string MotdepasseUtilisateur { get => motdepasseUtilisateur; set => motdepasseUtilisateur = value; }

        public Utilisateur(string nom, string prenom, string nomUtilisateur, string motdepasseUtilisateur)
        {
            this.nom = nom;
            this.prenom = prenom;
            this.nomUtilisateur = nomUtilisateur;
            this.motdepasseUtilisateur = motdepasseUtilisateur;
        }
    }
}
