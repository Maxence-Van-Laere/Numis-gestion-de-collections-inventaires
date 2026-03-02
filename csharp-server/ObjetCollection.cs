using LiteDB;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace InventaireCatalogue
{   
    public class ObjetCollection
    {
        private int idObjet;
        private int categorieID;
        private string label;
        private string? cheminPhoto;
        private DateTime? dateProduction;
        private DateTime? dateAcquisition;
        private string? commentaires;
        private string? lieuAcquisition;

        [BsonId]
        public int IdObjet { get => idObjet; set => idObjet = value; }
        public int CategorieId { get => categorieID; set => categorieID =value; }
        public string Label { get => label; set => label = value; }
        
        //Propriétés ci-dessous peuvent être nulles/pas obligatoires lors d'un nouve ajout
        public string? CheminPhoto { get => cheminPhoto; set => cheminPhoto = value; }
        public DateTime? DateProduction { get => dateProduction; set => dateProduction = value; }
        public DateTime? DateAcquisition { get => dateAcquisition; set => dateAcquisition = value; }
        public string? Commentaires { get => commentaires; set => commentaires = value; }
        public string? LieuAcquisition { get => lieuAcquisition; set => lieuAcquisition = value; }
        // Constructeur vide REQUIS par LiteDB pour désérialiser les objets depuis la DB
        // Ne pas utiliser directement dans le code - utiliser les constructeurs paramétrés
        public ObjetCollection() 
        {
            label = string.Empty;
        }

        // Constructeur complet avec tous les champs (paramètres optionnels avec valeurs par défaut)
        // Ce constructeur permet toutes les combinaisons possibles grâce aux paramètres optionnels
        // Exemples d'utilisation:
        //   - new ObjetCollection(1, "Label", 5)
        //   - new ObjetCollection(1, "Label", 5, cheminPhoto: "path/to/photo")
        //   - new ObjetCollection(1, "Label", 5, commentaires: "Mes commentaires")
        //   - new ObjetCollection(1, "Label", 5, dateProduction: DateTime.Now)
        //   - new ObjetCollection(1, "Label", 5, "path/to/photo", DateTime.Now, DateTime.Now, "Commentaires", "Lieu d'acquisition"<)
        public ObjetCollection(int id, string label, int categorieID, 
                               string? cheminPhoto = null, 
                               DateTime? dateProduction = null, 
                               DateTime? dateAcquisition = null, 
                               string? commentaires = null,
                               string? lieuAcquisition = null)
        {
            this.idObjet = id;
            this.label = label;
            this.categorieID = categorieID;
            this.cheminPhoto = cheminPhoto;
            this.dateProduction = dateProduction;
            this.dateAcquisition = dateAcquisition;
            this.commentaires = commentaires;
            this.lieuAcquisition = lieuAcquisition;
        }

    }



}
