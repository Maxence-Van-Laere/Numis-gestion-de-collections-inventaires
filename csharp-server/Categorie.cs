using System;

namespace InventaireCatalogue
{
    public class Categorie 
    {
        private int categorieId;
        private string nomCollection;
        private DateTime dateDerniereModif = DateTime.UtcNow;
        private DateTime dateCreation = DateTime.UtcNow;

        public string NomCollection { get => nomCollection; set => nomCollection = value; }
        public DateTime DateDerniereModif { get => dateDerniereModif; set => dateDerniereModif = value; }
        public int CategorieId { get => categorieId; set => categorieId = value; }
        public DateTime DateCreation { get => dateCreation; set => dateCreation = value; }

        public Categorie(int collectionId, string nomCollection)
        {
            this.nomCollection = nomCollection;
            this.dateDerniereModif = DateTime.UtcNow;
            this.categorieId = collectionId;
            this.dateCreation = DateTime.UtcNow; 
        }

        // Constructeur pour créer une nouvelle catégorie avec juste le nom
        // L'ID sera attribué automatiquement par LiteDB
        // Les dates sont auto-initialisées à aujourd'hui
        public Categorie(string nomCollection)
        {
            this.nomCollection = nomCollection;
            this.dateCreation = DateTime.UtcNow;
            this.dateDerniereModif = DateTime.UtcNow;
        }
    }
}
