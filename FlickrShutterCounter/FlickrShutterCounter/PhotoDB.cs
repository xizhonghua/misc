using System;
using System.IO;
using System.Collections.Generic;

namespace FlickrShutterCounter
{
	public class PhotoDB
	{
		private const string DBFilename = "PhotoDB.txt";

		private HashSet<string> photoIds;
		private bool changed;
		private DateTime lastActivity;

		public PhotoDB ()
		{
			photoIds = new HashSet<string> ();
			changed = false;
			this.lastActivity = DateTime.Now;
		}

		public bool Contains(string photoId)
		{
			return this.photoIds.Contains (photoId);
		}

		public void addPhoto(string photoId)
		{
			if (this.photoIds.Add (photoId)) {
				changed = true;
				if (DateTime.Now.Subtract (this.lastActivity).TotalMinutes > 2)
					this.Save ();
			}
		}

		public void Load()
		{
			if (!File.Exists (DBFilename))
				return;
			using (var sr = new StreamReader(DBFilename)) {
				while (!sr.EndOfStream) {
					var photoId = sr.ReadLine ();
					photoIds.Add (photoId);
				}
			}

			Console.WriteLine ("[PhotoDB] {0} entries loaded!", photoIds.Count);
		}

		public void Save()
		{
			if (!changed)
				return;



			using (var sw = new StreamWriter(DBFilename)) {
				foreach (var photoId in photoIds)
					sw.WriteLine (photoId);
			}

			this.changed = false;
			this.lastActivity = DateTime.Now;

			Console.WriteLine ("[PhotoDB] {0} entries saved!", photoIds.Count);
		}
	}
}

