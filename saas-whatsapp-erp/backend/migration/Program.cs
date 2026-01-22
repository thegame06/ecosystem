using MongoDB.Driver;
using MongoDB.Bson;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        string connectionString = "mongodb://root:example@localhost:27017/?authSource=admin";
        string databaseName = "saas_whatsapp_erp";

        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(databaseName);
        var collection = database.GetCollection<BsonDocument>("sales");

        Console.WriteLine("Starting migration...");

        var filter1 = Builders<BsonDocument>.Filter.Eq("paymentMethod", "Transferencia");
        var update1 = Builders<BsonDocument>.Update.Set("paymentMethod", "Transfer");
        var result1 = await collection.UpdateManyAsync(filter1, update1);
        Console.WriteLine($"Updated {result1.ModifiedCount} 'Transferencia' to 'Transfer'");

        var filter2 = Builders<BsonDocument>.Filter.Eq("paymentMethod", "Efectivo");
        var update2 = Builders<BsonDocument>.Update.Set("paymentMethod", "Cash");
        var result2 = await collection.UpdateManyAsync(filter2, update2);
        Console.WriteLine($"Updated {result2.ModifiedCount} 'Efectivo' to 'Cash'");

        var filter3 = Builders<BsonDocument>.Filter.Eq("paymentMethod", "Tarjeta");
        var update3 = Builders<BsonDocument>.Update.Set("paymentMethod", "Card");
        var result3 = await collection.UpdateManyAsync(filter3, update3);
        Console.WriteLine($"Updated {result3.ModifiedCount} 'Tarjeta' to 'Card'");

        Console.WriteLine("Migration completed.");
    }
}
