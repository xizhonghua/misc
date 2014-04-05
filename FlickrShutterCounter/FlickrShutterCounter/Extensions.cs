using System;
using FlickrNet;

namespace FlickrShutterCounter
{
	public static class ExifExtensions
	{
		public static string GetRaw(this ExifTagCollection self, string tag){
			foreach (var item in self) {
				if (item.Tag.ToUpper() == tag.ToUpper())
					return item.Raw;
			}
			return null;
		}

		public static string GetModel(this ExifTagCollection self){
			return self.GetRaw ("Model");
		}

		public static int GetImageNumber(this ExifTagCollection self){
			var imageNumber = self.GetRaw ("ImageNumber");
			if (imageNumber == null)
				return -1;
			try {
				var number = int.Parse(imageNumber);
				return number;
			}
			catch {
				return -1;
			}
		}

		public static int GetShutterCount(this ExifTagCollection self){
			var shutterCount = self.GetRaw ("ShutterCount");
			if (shutterCount == null)
				return -1;
			try {
				var number = int.Parse(shutterCount);
				return number;
			}
			catch {
				return -1;
			}
		}

	}
}

