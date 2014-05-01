using UnityEngine;
using System.Collections;
using System;                 // <-- ACCESS TO ENUM CLASS!

public class GameSettings : MonoBehaviour {
	public const string PLAYER_SPAWN_POINT = "Player Spawn Point"; // Name of game object

	void Awake(){
		DontDestroyOnLoad (this);
	}

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	public void SaveCharacterData(){
		GameObject pc = GameObject.Find ("pc");
		PlayerCharacter pcClass = pc.GetComponent <PlayerCharacter> ();

		PlayerPrefs.DeleteAll ();

		PlayerPrefs.SetString ("Player Name", pcClass.Name);

		// Save attribute values
		for(int cnt=0; cnt < Enum.GetValues(typeof(AttributeName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((AttributeName)cnt).ToString () + " - Base Value",
				pcClass.GetPrimaryAttribute (cnt).BaseValue);

			PlayerPrefs.SetInt (
				((AttributeName)cnt).ToString () + " - Exp To Level",
				pcClass.GetPrimaryAttribute (cnt).ExpToLevel);
		}

		// Save vital values
		for(int cnt=0; cnt < Enum.GetValues(typeof(VitalName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Base Value",
				pcClass.GetVital (cnt).BaseValue);
			
			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Exp To Level",
				pcClass.GetVital (cnt).ExpToLevel);

			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Current Value",
				pcClass.GetVital (cnt).CurrentValue);

			PlayerPrefs.SetString (
				((VitalName)cnt).ToString () + " - Mods",
				pcClass.GetVital (cnt).GetModifyingAttributeString());
		}

		// Save skill values
		for(int cnt=0; cnt < Enum.GetValues(typeof(SkillName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((SkillName)cnt).ToString () + " - Base Value",
				pcClass.GetSkill (cnt).BaseValue);
			
			PlayerPrefs.SetInt (
				((SkillName)cnt).ToString () + " - Exp To Level",
				pcClass.GetSkill (cnt).ExpToLevel);

			PlayerPrefs.SetString (
				((SkillName)cnt).ToString () + " - Mods",
				pcClass.GetSkill (cnt).GetModifyingAttributeString());

		}
	}

	public void LoadCharacterData(){
		// LIKELY BROKEN. I STOPPED CARING ABOUT THIS FUNCTION IN VIDEO [ Instantiating our Character 4/5 ] BECAUSE I AM NOT SOLD ON USING PLAYPREF.
		GameObject pc = GameObject.Find ("pc");
		PlayerCharacter pcClass = pc.GetComponent <PlayerCharacter> ();
				
		pcClass.Name = PlayerPrefs.GetString ("Player Name", "Name Me");

		// Load attribute values
		for(int cnt=0; cnt < Enum.GetValues(typeof(AttributeName)).Length; cnt++){
			pcClass.GetPrimaryAttribute (cnt).BaseValue = 
				PlayerPrefs.GetInt (
				((AttributeName)cnt).ToString () + " - Base Value",
				0);
			
			pcClass.GetPrimaryAttribute (cnt).ExpToLevel =
				PlayerPrefs.GetInt (
					((AttributeName)cnt).ToString () + " - Exp To Level",
					0);
		}
		
		// Load vital values
		for(int cnt=0; cnt < Enum.GetValues(typeof(VitalName)).Length; cnt++){
			pcClass.GetVital (cnt).BaseValue =
				PlayerPrefs.GetInt (
					((VitalName)cnt).ToString () + " - Base Value",
					0);
			
			pcClass.GetVital (cnt).ExpToLevel=
				PlayerPrefs.GetInt (
					((VitalName)cnt).ToString () + " - Exp To Level",
					0);
			
			pcClass.GetVital (cnt).CurrentValue =
				PlayerPrefs.GetInt (
					((VitalName)cnt).ToString () + " - Current Value",
					0);

// COMMENT OUT FOR NOW B/C NEEDS PARSING ETC
//			pcClass.GetVital (cnt).GetModifyingAttributeString() = 
//				PlayerPrefs.GetString (
//					((VitalName)cnt).ToString () + " - Mods",
//					0);
		}
		
		// Load skill values
		for(int cnt=0; cnt < Enum.GetValues(typeof(SkillName)).Length; cnt++){
			pcClass.GetSkill (cnt).BaseValue =
				PlayerPrefs.GetInt (
					((SkillName)cnt).ToString () + " - Base Value",
					0);
				
			pcClass.GetSkill (cnt).ExpToLevel = 
				PlayerPrefs.GetInt (
					((SkillName)cnt).ToString () + " - Exp To Level",
					0);

// COMMENT OUT FOR NOW B/C NEEDS PARSING ETC
//			PlayerPrefs.SetString (
//				((SkillName)cnt).ToString () + " - Mods",
//				pcClass.GetSkill (cnt).GetModifyingAttributeString());
			
		}
	}

}

//*** GetString() has a default value too in case it can't be found