SQLite
======

This document is for making SQLite work with unity.

Using Windows 8.1, Unity 4.3.3f1.

- In assets, create a folder called `Plugins`

- Open a folder in Windows and browse to `C:\Program Files (x86)\Unity`

- Do a file search for `system.data.dll`. Copy and paste `C:\Program Files (x86)\Unity\Editor\Data\Mono\lib\mono\unity\System.Data.dll` into your Unity project's `Plugins` folder. (I also included my file in this readme folder)

- Do a file search for `mono.data.sqlite.dll`. Copy and paste `C:\Program Files (x86)\Unity\Editor\Data\Mono\lib\mono\unity\Mono.Data.Sqlite.dll` into your Unity project's `Plugins` folder. (I also included my file in this readme folder)

- Create a C# script named `DatabaseTest`

- Create a cube in your scene and attach the `DatabaseTest` script to it

- Copy and paste the following into your script:

```
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
```

Notice that if you run it a second time, you will get an error because it cannot recreate the database. So just keep that in mind :-)