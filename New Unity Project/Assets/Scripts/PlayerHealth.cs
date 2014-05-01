using UnityEngine;
using System.Collections;

public class PlayerHealth : MonoBehaviour {
	public int MaxHealth = 100;
	public int CurrentHealth = 100;
	public float HealthBarLength;
	
	// Use this for initialization
	void Start () {
		HealthBarLength = Screen.width / 2;
	}
	
	// Update is called once per frame
	void Update () {
		AdjustCurrentHealth(0); // Force it to be called every frame for now so we can adjust values while playing
	}
	
	void OnGUI(){
		GUI.Box(new Rect(10,10,HealthBarLength,20), CurrentHealth + " / " + MaxHealth);
	}
	
	public void AdjustCurrentHealth(int amount){ // positive to heal, negative to damage
		CurrentHealth += amount;
		if(CurrentHealth < 0){ CurrentHealth = 0; }
		if(CurrentHealth > MaxHealth){ CurrentHealth = MaxHealth; }
		if(MaxHealth < 1){ MaxHealth = 1; }
		HealthBarLength = (Screen.width / 2) * (CurrentHealth / (float)MaxHealth);
	}
}