using UnityEngine;
using System.Collections;

/** TODO *DTA DATABASES!!! ZDATABASE works on ps3!!!
 * http://forum.unity3d.com/threads/183570-I-m-looking-for-a-database-plugin-wrapper-(to-buy)
 * https://www.assetstore.unity3d.com/#/content/5454
 */

/*
 * To make from scratch:
 *   - Create prefab "Camera Prefab"
 *   - GameObject > Create Empty
 *   - Drag empty game object from hierarchy to prefab
 *   - Delete empty game object from hierarchy
 *   - Drag script ScreenBehavior.cs to "Camera Prefab"
 *   - Drag "Camera Prefab" from assets to hierarchy
 */
public class ScreenBehavior : MonoBehaviour {
	private bool
		IsSplitScreen = true;
	private int 
		Players = 2;
	private CameraBehavior 
		CameraPlayer1,
		CameraPlayer2;
	private Rect
		GapRect;
	private GUIStyle
		GapStyle;
	private const int 
		GapWidth = 30;
	private Texture2D 
		GapTexture;

	// Use this for initialization
	void Start () {
		if (this.Players == 1) {
			throw new UnityException("OOPS - HUD IS BROKEN FOR SOME REASON!!!");
			this.CameraPlayer1 = gameObject.AddComponent<CameraBehavior>();
			this.CameraPlayer1.Initiate (gameObject, 1, 1);
		}
		else if (this.Players == 2 && !this.IsSplitScreen){
			throw new UnityException("NOT IMPLEMENTED - HUD IS SCREWED UP FOR SOME REASON");
			this.CameraPlayer1 = gameObject.AddComponent<CameraBehavior>();
			this.CameraPlayer1.Initiate (gameObject, 1, 1);
			// DO OTHER STUFF LIKE PREVENT PLAYERS FROM BEING TOO FAR AWAY FROM EACH OTHER
		}
		else if (this.Players == 2 && this.IsSplitScreen){
			this.CameraPlayer1 = gameObject.AddComponent<CameraBehavior>();
			this.CameraPlayer1.Initiate (gameObject, 1, 2);

			this.CameraPlayer2 = gameObject.AddComponent<CameraBehavior>();
			this.CameraPlayer2.Initiate (gameObject, 2, 2);

			this.GapTexture = new Texture2D(1, 1);
			this.GapTexture.SetPixel(0,0,Color.black);
			this.GapTexture.Apply();
			
			this.GapRect = new Rect(
				(Screen.width / 2) - (GapWidth / 2),
				0,
				GapWidth,
				Screen.height);
		}
		else {
			Debug.LogError ("Can't handle number of players");
		}
	}
	
	// Update is called once per frame
	void Update () {
	}

	void OnGUI(){
		// Draw vertical box on screen
		if (this.Players == 2 && this.IsSplitScreen) {
			DrawQuad(this.GapRect, Color.black);
		}
	}

	void DrawQuad(Rect position, Color color) {
		// http://answers.unity3d.com/questions/37752/how-to-render-a-colored-2d-rectangle.html
		GUI.skin.box.normal.background = this.GapTexture; // OR create a skin and set it to the skin
		GUI.Box(position, GUIContent.none);
	}
}
