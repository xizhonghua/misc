using System;
using FlickrNet;

namespace FlickrShutterCounter
{
	public class FlickrShutterCounter
	{
		public string UserId { get ; private set; }

		public string PhotoId { get; private set; }

		public string CameraModel { get; private set; }

		public int ImageNumber { get; private set; }

		public bool Succeed { get; private set; }

		private Flickr _flickr;

		public FlickrShutterCounter (string photoId, string userId)
		{
			this.PhotoId = photoId;
			this.UserId = userId;
			this._flickr = new Flickr (Config.API_KEY, Config.API_SEC);
		}

		public void Work ()
		{
			Succeed = false;
			var retry = 1;

			while (--retry >= 0) {
				try {
					var exif = _flickr.PhotosGetExif (this.PhotoId);
					this.CameraModel = exif.GetModel ();
					if(this.CameraModel == null) return;
					this.CameraModel = this.CameraModel.Replace(' ', '_');
					this.ImageNumber = exif.GetImageNumber ();
					if(this.ImageNumber <= 0)
					{
						this.ImageNumber = exif.GetShutterCount();
						if(this.ImageNumber > 0) Console.WriteLine("shutter count = {0}", this.ImageNumber);
					}
					if(this.ImageNumber>0)
						Succeed = true;
					Console.WriteLine ("[Worker] photoId = {0} ownerId = {1} model = {2} num = {3}", PhotoId, UserId, CameraModel, ImageNumber);
					return;
				} catch (FlickrException e) {
					Console.WriteLine ("[Worker] FlickrException {0}, retry photoId = {1}", e.Message, PhotoId);
				} catch (Exception e) {
					Console.WriteLine ("[Worker] Exception {0}, retry photoId = {1}", e.Message, PhotoId);
				}
			}
		}
	}
}

