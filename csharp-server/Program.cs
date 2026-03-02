using InventaireCatalogue;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
// Bind to a fixed localhost port so Electron preload can call it reliably
builder.WebHost.UseUrls("http://127.0.0.1:5555");
builder.Services.AddCors(options => options.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

Console.WriteLine("[DEBUG] ===== Serveur C# backend démarré =====");
Console.WriteLine("[DEBUG] Écoute sur http://127.0.0.1:5555");
Console.WriteLine("[DEBUG] ========================================");

app.MapGet("/", () => Results.Ok(new { message = "C# backend running" }));

app.MapGet("/debug/stats", () => {
    var catCount = Database.listeCategories.Count();
    var objCount = Database.listeObjets.Count();
    var dbPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../data.db"));
    return Results.Json(new { 
        categories = catCount, 
        objets = objCount,
        dbPath = dbPath
    });
});

app.MapGet("/collections", () => {
    Console.WriteLine("[DEBUG] GET /collections - Récupération de toutes les collections");
    var cats = Database.listeCategories.FindAll().ToList();
    var objets = Database.listeObjets.FindAll().ToList();
    Console.WriteLine($"[DEBUG] -> {cats.Count} collection(s) trouvée(s)");
    
    var result = cats.Select(cat => {
        int count = objets.Count(o => o.CategorieId == cat.CategorieId);
        return new {
            id = cat.CategorieId,
            name = cat.NomCollection,
            count = count,
            created_at = cat.DateCreation.ToString("o", CultureInfo.InvariantCulture),
            updated_at = cat.DateDerniereModif.ToString("o", CultureInfo.InvariantCulture)
        };
    }).ToList();

    Console.WriteLine($"[DEBUG] -> Renvoi de {result.Count} collection(s) avec détails");
    return Results.Json(result);
});

app.MapPost("/collections", (CreateCollectionDto dto) => {
    Console.WriteLine($"[DEBUG] POST /collections - Création collection: '{dto.name}'");
    var cat = new Categorie(dto.name);  // Constructeur avec juste le nom, dates auto-initialisées
    Database.listeCategories.Insert(cat);  // LiteDB attribue l'ID automatiquement
    Console.WriteLine($"[DEBUG] -> Collection créée avec ID: {cat.CategorieId}");
    return Results.Json(new { id = cat.CategorieId, name = cat.NomCollection });
});

app.MapDelete("/collections/{id:int}", (int id) => {
    Console.WriteLine($"[DEBUG] DELETE /collections/{id} - Suppression de la collection {id}");
    var deleted = Database.listeCategories.Delete(id);
    Console.WriteLine($"[DEBUG] -> Suppression {(deleted ? "réussie" : "échouée")}");
    return deleted ? Results.Ok() : Results.NotFound();
});

app.MapGet("/collections/{id:int}/objects", (int id) => {
    Console.WriteLine($"[DEBUG] GET /collections/{id}/objects - Récupération des objets");
    var objs = Database.listeObjets.Find(o => o.CategorieId == id).ToList();
    Console.WriteLine($"[DEBUG] -> {objs.Count} objet(s) trouvé(s)");
    var list = objs.Select(o => new {
        id = o.IdObjet,
        categorieId = o.CategorieId,
        label = o.Label,
        cheminPhoto = o.CheminPhoto,
        dateProduction = o.DateProduction?.ToString("o", CultureInfo.InvariantCulture) ?? "",
        dateAcquisition = o.DateAcquisition?.ToString("o", CultureInfo.InvariantCulture) ?? "",
        commentaires = o.Commentaires,
        lieuAcquisition = o.LieuAcquisition
    });
    return Results.Json(list);
});

// Tous les objets, toutes catégories confondues
app.MapGet("/objects", () => {
    Console.WriteLine("[DEBUG] GET /objects - Récupération de tous les objets");
    var objs = Database.listeObjets.FindAll().ToList();
    Console.WriteLine($"[DEBUG] -> {objs.Count} objet(s) trouvé(s)");
    var list = objs.Select(o => new {
        id = o.IdObjet,
        categorieId = o.CategorieId,
        label = o.Label,
        cheminPhoto = o.CheminPhoto,
        dateProduction = o.DateProduction?.ToString("o", CultureInfo.InvariantCulture) ?? "",
        dateAcquisition = o.DateAcquisition?.ToString("o", CultureInfo.InvariantCulture) ?? "",
        commentaires = o.Commentaires,
        lieuAcquisition = o.LieuAcquisition
    });
    return Results.Json(list);
});

app.MapPost("/objects", (CreateObjectDto dto) => {
    Console.WriteLine($"[DEBUG] POST /objects - Création objet: '{dto.label}' dans collection {dto.collectionId}");
    var obj = new ObjetCollection(0, dto.label, dto.collectionId, 
                                   cheminPhoto: dto.cheminPhoto,
                                   dateProduction: dto.dateProduction,
                                   dateAcquisition: dto.dateAcquisition,
                                   commentaires: dto.commentaires,
                                   lieuAcquisition: dto.lieuAcquisition);
    Database.listeObjets.Insert(obj);
    Console.WriteLine($"[DEBUG] -> Objet créé avec ID: {obj.IdObjet}");

    var cat = Database.listeCategories.FindById(obj.CategorieId);
    if (cat != null)
    {
        cat.DateDerniereModif = DateTime.UtcNow;
        Database.listeCategories.Update(cat);
    }
    return Results.Json(new { id = obj.IdObjet });
});

app.MapDelete("/objects/{id:int}", (int id) => {
    Console.WriteLine($"[DEBUG] DELETE /objects/{id} - Suppression de l'objet");
    var deleted = Database.listeObjets.Delete(id);
    Console.WriteLine($"[DEBUG] -> Suppression {(deleted ? "réussie" : "échouée")}");
    return deleted ? Results.Ok() : Results.NotFound();
});

app.MapPut("/objects/{id:int}", (int id, UpdateObjectDto dto) => {
    Console.WriteLine($"[DEBUG] PUT /objects/{id} - Mise à jour de l'objet");
    var obj = Database.listeObjets.FindById(id);
    if (obj == null)
    {
        Console.WriteLine("[DEBUG] -> Objet introuvable");
        return Results.NotFound();
    }

    obj.Label = dto.label ?? obj.Label;
    obj.CheminPhoto = dto.cheminPhoto ?? obj.CheminPhoto;
    obj.DateProduction = dto.dateProduction ?? obj.DateProduction;
    obj.DateAcquisition = dto.dateAcquisition ?? obj.DateAcquisition;
    obj.Commentaires = dto.commentaires ?? obj.Commentaires;
    obj.LieuAcquisition = dto.lieuAcquisition ?? obj.LieuAcquisition;
    Database.listeObjets.Update(obj);
    var cat = Database.listeCategories.FindById(obj.CategorieId);
    if (cat != null)
    {
        cat.DateDerniereModif = DateTime.UtcNow;
        Database.listeCategories.Update(cat);
    }

    Console.WriteLine("[DEBUG] -> Objet mis à jour");
    return Results.Json(new {
        id = obj.IdObjet,
        categorieId = obj.CategorieId,
        label = obj.Label,
        cheminPhoto = obj.CheminPhoto,
        dateProduction = obj.DateProduction?.ToString("o", CultureInfo.InvariantCulture) ?? "",
        dateAcquisition = obj.DateAcquisition?.ToString("o", CultureInfo.InvariantCulture) ?? "",
        commentaires = obj.Commentaires,
        lieuAcquisition = obj.LieuAcquisition 
    });
});

// Endpoint pour uploader une image
app.MapPost("/upload", async (HttpRequest request) => {
    Console.WriteLine("[DEBUG] POST /upload - Upload d'une image");
    
    if (!request.HasFormContentType || request.Form.Files.Count == 0)
    {
        Console.WriteLine("[DEBUG] -> Aucun fichier trouvé");
        return Results.BadRequest(new { error = "Aucun fichier fourni" });
    }

    var file = request.Form.Files[0];
    if (file.Length == 0)
    {
        Console.WriteLine("[DEBUG] -> Fichier vide");
        return Results.BadRequest(new { error = "Fichier vide" });
    }

    // Créer le dossier uploads s'il n'existe pas
    var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
    Directory.CreateDirectory(uploadsDir);

    // Générer un nom de fichier unique avec timestamp
    var extension = Path.GetExtension(file.FileName);
    var fileName = $"{Guid.NewGuid()}{extension}";
    var filePath = Path.Combine(uploadsDir, fileName);

    // Sauvegarder le fichier
    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    Console.WriteLine($"[DEBUG] -> Fichier sauvegardé: {fileName}");
    return Results.Json(new { path = fileName });
});

// Endpoint pour servir les images
app.MapGet("/files/{filename}", (string filename) => {
    var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
    var filePath = Path.Combine(uploadsDir, filename);

    if (!File.Exists(filePath))
    {
        return Results.NotFound();
    }

    var contentType = filename.EndsWith(".png") ? "image/png" :
                      filename.EndsWith(".jpg") || filename.EndsWith(".jpeg") ? "image/jpeg" :
                      filename.EndsWith(".gif") ? "image/gif" :
                      "application/octet-stream";

    return Results.File(filePath, contentType);
});

// Endpoint pour déplacer des objets vers une autre collection
app.MapPost("/objects/move", (MoveObjectsDto dto) => {
    Console.WriteLine($"[DEBUG] POST /objects/move - Déplacement de {dto.objectIds.Count} objets vers collection {dto.targetCollectionId}");
    
    if (dto.objectIds == null || dto.objectIds.Count == 0)
    {
        return Results.BadRequest(new { error = "Aucun objet à déplacer" });
    }

    var targetCollection = Database.listeCategories.FindById(dto.targetCollectionId);
    if (targetCollection == null)
    {
        return Results.NotFound(new { error = "Collection cible introuvable" });
    }

    int movedCount = 0;
    foreach (var objId in dto.objectIds)
    {
        var obj = Database.listeObjets.FindById(objId);
        if (obj != null)
        {
            obj.CategorieId = dto.targetCollectionId;
            Database.listeObjets.Update(obj);
            movedCount++;
        }
    }

    // Mettre à jour la date de modification de la collection cible
    targetCollection.DateDerniereModif = DateTime.UtcNow;
    Database.listeCategories.Update(targetCollection);

    Console.WriteLine($"[DEBUG] -> {movedCount} objet(s) déplacé(s)");
    return Results.Json(new { success = true, moved = movedCount });
});

app.Run();

public record CreateCollectionDto(string name);
public record CreateObjectDto(int collectionId, string label, string? cheminPhoto, DateTime? dateProduction, DateTime? dateAcquisition, string? commentaires, string? lieuAcquisition);
public record UpdateObjectDto(string? label, string? cheminPhoto, DateTime? dateProduction, DateTime? dateAcquisition, string? commentaires, string? lieuAcquisition);
public record MoveObjectsDto(List<int> objectIds, int targetCollectionId);
