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

            string path = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../data.db"));
            
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);

            _db = new LiteDatabase(path);

            _db.GetCollection<ObjetCollection>("objets").EnsureIndex(x => x.CategorieId);
        }


        public static ILiteCollection<Categorie> listeCategories => _db.GetCollection<Categorie>("categories");

        public static ILiteCollection<ObjetCollection> listeObjets => _db.GetCollection<ObjetCollection>("objets");

        public static ILiteCollection<Utilisateur> listeUsers => _db.GetCollection<Utilisateur>("users");

        public static void ReplaceData(IEnumerable<Categorie> categories, IEnumerable<ObjetCollection> objects)
        {
            _db.BeginTrans();

            try
            {
                listeObjets.DeleteAll();
                listeCategories.DeleteAll();

                foreach (var category in categories)
                {
                    listeCategories.Insert(category);
                }

                foreach (var obj in objects)
                {
                    listeObjets.Insert(obj);
                }

                _db.Commit();
            }
            catch
            {
                _db.Rollback();
                throw;
            }
        }

        public static void MergeData(IEnumerable<Categorie> categories, IEnumerable<ObjetCollection> objects)
        {
            _db.BeginTrans();

            try
            {
                var existingCategories = listeCategories.FindAll().ToList();
                var categoryIds = new Dictionary<int, int>();

                foreach (var category in categories)
                {
                    var existingCategory = existingCategories.FirstOrDefault(existing =>
                        string.Equals(existing.NomCollection.Trim(), category.NomCollection.Trim(), StringComparison.OrdinalIgnoreCase));

                    if (existingCategory == null)
                    {
                        var newCategory = new Categorie(0, category.NomCollection)
                        {
                            DateCreation = category.DateCreation,
                            DateDerniereModif = category.DateDerniereModif
                        };
                        listeCategories.Insert(newCategory);
                        existingCategories.Add(newCategory);
                        categoryIds[category.CategorieId] = newCategory.CategorieId;
                    }
                    else
                    {
                        categoryIds[category.CategorieId] = existingCategory.CategorieId;
                    }
                }

                var existingObjects = listeObjets.FindAll().ToList();
                foreach (var obj in objects)
                {
                    var localCategoryId = categoryIds[obj.CategorieId];
                    var existingObject = existingObjects.FirstOrDefault(existing =>
                        existing.CategorieId == localCategoryId &&
                        string.Equals(existing.Label.Trim(), obj.Label.Trim(), StringComparison.OrdinalIgnoreCase));

                    if (existingObject == null)
                    {
                        var newObject = new ObjetCollection(
                            0,
                            obj.Label,
                            localCategoryId,
                            obj.CheminPhoto,
                            obj.DateProduction,
                            obj.DateAcquisition,
                            obj.Commentaires,
                            obj.LieuAcquisition);
                        listeObjets.Insert(newObject);
                        existingObjects.Add(newObject);
                    }
                    else
                    {
                        existingObject.CheminPhoto = obj.CheminPhoto;
                        existingObject.DateProduction = obj.DateProduction;
                        existingObject.DateAcquisition = obj.DateAcquisition;
                        existingObject.Commentaires = obj.Commentaires;
                        existingObject.LieuAcquisition = obj.LieuAcquisition;
                        listeObjets.Update(existingObject);
                    }
                }

                _db.Commit();
            }
            catch
            {
                _db.Rollback();
                throw;
            }
        }

    }
}
