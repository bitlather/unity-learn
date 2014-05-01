using UnityEngine;
using System.Collections;
using System;               // <-- FOR ENUM!!

public class CharacterGenerator : MonoBehaviour {
	private PlayerCharacter _toon;
	private const int STARTING_POINTS = 281;
	private const int MIN_STARTING_ATTRIBUTE_VALUE = 10;
	private const int STARTING_VALUE = 50;
	private int pointsLeft;

	public GUIStyle myStyle;
	public GUISkin mySkin;
	public GameObject playerPrefab;

	// Use this for initialization
	void Start () {
		GameObject pc = 
		Instantiate (
			playerPrefab,         // The prefab
			Vector3.zero,         // (0,0,0)
			Quaternion.identity) // Direction parent is in
				as GameObject;
		pc.name = "pc";

//		_toon = new PlayerCharacter (); // <-- This will create a warning that says cannot use 'new' keyword. Actually, you can... just not a great way of doing it. He says he'll show a different method later.
//		_toon.Awake ();
		_toon = pc.GetComponent <PlayerCharacter> ();

		pointsLeft = STARTING_POINTS;

		for (int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++) {
			_toon.GetPrimaryAttribute(cnt).BaseValue = STARTING_VALUE;
			pointsLeft -= (STARTING_VALUE - MIN_STARTING_ATTRIBUTE_VALUE);
		}
		_toon.StatUpdate ();
	}
	
	// Update is called once per frame
	void Update () {
	}

	void OnGUI(){
		GUI.skin = mySkin;
		DisplayName ();
		DisplayPointsLeft ();
		DisplayAttributes ();
		DisplayVitals ();
		DisplaySkills ();

		if(_toon.Name == "" || pointsLeft > 0){
			DisplayCreateLabel ();
		} else {
			DisplayCreateButton ();
		}
	}

	private void DisplayName(){
		GUI.Label(new Rect(10, 10, 50, 25), "Name:");
		_toon.Name = GUI.TextField (new Rect (65, 10, 100, 25), _toon.Name);
	}

	private void DisplayAttributes(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(10,  // X
			                    top, // Y
			                    100, // WIDTH
			                    25   // HEIGHT
				), ((AttributeName)cnt).ToString (), 
			           myStyle  // <-- GUIStyle & GUI.skin --- use the background image!
			    );

			GUI.Label (new Rect(115, top, 30, 25), _toon.GetPrimaryAttribute(cnt).AdjustedBaseValue.ToString());
			if(GUI.Button(new Rect(150, top, 25, 25), "-")){
				if(_toon.GetPrimaryAttribute(cnt).BaseValue > MIN_STARTING_ATTRIBUTE_VALUE){
					_toon.GetPrimaryAttribute(cnt).BaseValue--;
					pointsLeft++;
					_toon.StatUpdate ();
				}
			}
			if(GUI.Button(new Rect(180, // <-- IF BUTTON CLICKED
			                       top, 
			                       25, 
			                       25
			    ), "+",
			   		myStyle  // <-- GUIStyle & GUI.skin --- use the background image!
			   	)){
				if(pointsLeft > 0){
					_toon.GetPrimaryAttribute(cnt).BaseValue++;
					pointsLeft--;
					_toon.StatUpdate ();
				}
			}
		}
	}

	private void DisplayVitals(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(VitalName)).Length; cnt++){
			int top = 40 + ((cnt+7) * 25);
			GUI.Label (new Rect(10, top, 100, 25), ((VitalName)cnt).ToString ());
			GUI.Label (new Rect(115, top, 30, 25), _toon.GetVital(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplaySkills(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(SkillName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(250, top, 100, 25), ((SkillName)cnt).ToString ());
			GUI.Label (new Rect(355, top, 100, 25), _toon.GetSkill(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplayPointsLeft(){
		GUI.Label(new Rect(250, 10, 100, 25), "Points Left: "+pointsLeft);
	}

	private void DisplayCreateLabel(){
		GUI.Label (new Rect (
				Screen.width / 2 - 50, // center of screen
				40 + (10 * 25),
				100,
				25
			), 
		    "Set name & use all points before continuing",
		    "Button");
	}

	private void DisplayCreateButton(){
		if (GUI.Button (new Rect (
			Screen.width / 2 - 50, // center of screen
			40 + (10 * 25),
			100,
			25
			), "Create")) {

			GameObject gs = GameObject.Find ("__GameSettings");
			GameSettings gsScript = gs.GetComponent<GameSettings>();

			// change the current value of vitals to the max modified value of that vital
			UpdateCurVitalValues();

			gsScript.SaveCharacterData();
			//Application.LoadLevel ("hackandslash"); // Scene name
			Application.LoadLevel ("Level 1"); // Scene name
		}
	}

	private void UpdateCurVitalValues(){
		for (int cnt=0; cnt<Enum.GetValues (typeof(VitalName)).Length; cnt++) {
			_toon.GetVital (cnt).CurrentValue = _toon.GetVital (cnt).AdjustedBaseValue;
		}
	}

}

//*** Screen.width
//*** GameObject.Find() & GetComponent
//*** Application.LoadLevel
//*** You can style a label like a button to make a disabled button: GUI.Label (new Rect (...), "Create", "Button");