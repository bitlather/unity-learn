using UnityEngine;
using System.Collections;
using System.Data;
using Mono.Data.Sqlite;

public class DatabaseTest : MonoBehaviour {

	// Use this for initialization
	void Start () {
		//Attempt1 ();
		SqliteConnection.CreateFile ("attempt.db3");
		using (SqliteConnection connection = new SqliteConnection("data source=attempt.db3")) {
			using (SqliteCommand command = new SqliteCommand(connection))
			{
				connection.Open ();

				command.CommandText = @"CREATE TABLE IF NOT EXISTS [MyTable] (
                          [ID] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                          [Key] NVARCHAR(2048)  NULL,
                          [Value] VARCHAR(2048)  NULL
                          )";
				command.ExecuteNonQuery();

				command.CommandText = "INSERT INTO MyTable (Key,Value) Values ('key one','value one')";     // Add the first entry into our database 
				command.ExecuteNonQuery();      // Execute the query
				command.CommandText = "INSERT INTO MyTable (Key,Value) Values ('key two','value value')";   // Add another entry into our database 
				command.ExecuteNonQuery();      // Execute the query


				command.CommandText = "Select * FROM MyTable";      // Select all rows from our database table
				
				using (SqliteDataReader reader = command.ExecuteReader())
				{
					while (reader.Read())
					{
						Debug.Log(reader["Key"] + " : " + reader["Value"]);     // Display the value of the key and value column for every row
					}
				}
				connection.Close();        // Close the connection to the database
			}
		}
		
		
		
	}
	
	
		
		// Update is called once per frame
	void Update () {
		
	}
}
