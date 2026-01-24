using LiteDB;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static InventaireCatalogue.ObjetCollection;

namespace InventaireCatalogue
{
    public static class Database
    {
        private static readonly LiteDatabase _db;

        static Database() {

            string path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "InventaireCatalogue",
                "data.db"
                );
            

            Directory.CreateDirectory(Path.GetDirectoryName(path)!);

            _db = new LiteDatabase(path);

            _db.GetCollection<ObjetCollection>("objets").EnsureIndex(x => x.CategorieId);
        }


        public static ILiteCollection<Categorie> listeCategories => _db.GetCollection<Categorie>("categories");

        public static ILiteCollection<ObjetCollection> listeObjets => _db.GetCollection<ObjetCollection>("objets");

        public static ILiteCollection<Utilisateur> listeUsers => _db.GetCollection<Utilisateur>("users");


    }
}
