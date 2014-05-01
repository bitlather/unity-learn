using UnityEngine;
using System.Collections;

namespace Hud.Battle {

	public class CharacterStats : MonoBehaviour {
		private static int 
			PortraitWidth         = 55,
			PortraitHeight        = 55,
			PortraitYPadding      = 4,
			PortraitXPadding      = 4,

			StatBarHeight         = 15,
			StatBarYPadding       = 5,

			EdgeOfScreenOffset = 15;

		// Use this for initialization
		void Start () {
		}
		
		void OnGUI(){
			DrawCharacterStats (EdgeOfScreenOffset, EdgeOfScreenOffset);
			DrawCharacterStats (EdgeOfScreenOffset, EdgeOfScreenOffset + PortraitHeight + PortraitYPadding);
		}

		private void DrawCharacterStats(int baseLeft, int baseTop){
			// Portrait
			GUI.Box(new Rect(
				baseLeft,
				baseTop,
				PortraitWidth, 
				PortraitHeight), "");

			// Health bar
			GUI.Box(new Rect(
				baseLeft + PortraitWidth + PortraitXPadding,
				baseTop,
				100, 
				StatBarHeight), "");

			// Stamina bar
			GUI.Box(new Rect(
				baseLeft + PortraitXPadding + PortraitWidth,
				baseTop + StatBarYPadding + StatBarHeight,
				80, 
				StatBarHeight), "");

			// Magic bar
			GUI.Box(new Rect(
				baseLeft + PortraitXPadding + PortraitWidth,
				baseTop + 2 * (StatBarYPadding + StatBarHeight),
				45, 
				StatBarHeight), "");

		}
	}
}