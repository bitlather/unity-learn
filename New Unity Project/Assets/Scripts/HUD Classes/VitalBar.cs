using UnityEngine;
using System.Collections;

// Display vitals for player or a mob
public class VitalBar : MonoBehaviour {
	public bool _isPlayerHealthbar;
	private int _maxBarLength;        // length of bar at 100% health
	private int _curBarLength;
	private GUITexture _display;

	// Use this for initialization
	void Start () {
//		_isPlayerHealthbar = true; // Set in inspector for now
		_display = gameObject.GetComponent<GUITexture> ();
		_maxBarLength = (int)_display.pixelInset.width;
		OnEnable ();
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	public void SetPlayerHealthBar(bool b){
		_isPlayerHealthbar = b;
	}

	public void OnChangeHealthBarSize(int curHealth, int maxHealth){
//		Debug.Log ("We heard a health event: "+curHealth+" / "+maxHealth);
		_curBarLength = (int)(1.0 * curHealth / maxHealth * _maxBarLength);
		_display.pixelInset = new Rect(
			_display.pixelInset.x, 
			_display.pixelInset.y, 
			_curBarLength, 
			_display.pixelInset.height);

	}

	public void OnEnable(){
		// listen to broadcast messages sent from other objects
		if(_isPlayerHealthbar){
			Messenger<int, int>.AddListener("player health update", OnChangeHealthBarSize);
		} else {
			Messenger<int, int>.AddListener("mob health update", OnChangeHealthBarSize);
		}

	}

	public void OnDisable(){
		// stop listening for broadcast messages
		if(_isPlayerHealthbar){
			Messenger<int, int>.RemoveListener("player health update", OnChangeHealthBarSize);
		} else {
			Messenger<int, int>.RemoveListener("mob health update", OnChangeHealthBarSize);
		}
	}
}
