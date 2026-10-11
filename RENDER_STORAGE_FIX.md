# Persist photos on Render with Supabase Storage

The supplied logs show `GET /images/...jpg` failing with `FileNotFoundError` in Render's local `backend/uploads` directory. PostgreSQL retained the clothing row, but its image file was missing. Render's default filesystem does not persist uploads across restarts and redeploys. The logs do not include a failing upload POST or model crash.

## Deploy this update

1. Replace the backend source with this version and keep your existing database URL, JWT secret, and scoring rules. No database migration is required. The frontend update also includes the previous login race fix and clear missing-photo feedback.
2. In the same Supabase project, open **Storage**, create a bucket named **wardrobe-images**, and keep **Public bucket disabled**. Allow `image/jpeg` if configuring MIME restrictions, and allow at least 10 MB per object.
3. In Render's backend service **Environment**, add:

```dotenv
IMAGE_STORAGE=supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_LEGACY_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=wardrobe-images
FRONTEND_ORIGINS=https://atelier-psi-swart.vercel.app
```

Get the **legacy service_role key** from Supabase Project Settings > API keys (legacy keys). It is a server credential. Enter it only in Render; never put it in Vercel, source control, frontend code, or any `VITE_` variable. The project URL is the HTTPS Supabase project URL, not the PostgreSQL connection URL. Keep your existing `DATABASE_URL` unchanged.

4. Redeploy Render. On Vercel keep `VITE_API_URL=https://atelier-zjlg.onrender.com`, deploy the updated frontend, and reload the app.
5. Upload a new piece, confirm its photo loads, then restart Render and confirm that the same photo still loads. Newly stored image names begin `supabase--`; they should appear in the private bucket. FastAPI checks wardrobe ownership before reading each object. No public Storage bucket or browser Storage policy is needed for this app's custom authentication.

## Existing missing photos

The update keeps existing local image references working if the files still exist. It cannot recover files already erased from Render. Restore any backups into the original directory/filename, or upload those pieces again. Uploading again creates a new clothing item; it does not replace the lost file on an old item or its saved outfits.

## If a new upload still fails

Capture the backend log covering the actual `POST /wardrobes/<id>/clothes` and the browser Network response for that POST. A storage failure now returns JSON 503 with a bucket/credentials/connectivity message. An embedding failure returns JSON 503 and logs the model exception. A killed process or upstream gateway failure still needs the matching Render logs to diagnose; the supplied logs do not prove either occurred.

Local development defaults to `IMAGE_STORAGE=local`. Local storage on a hosted service requires a persistent volume at `UPLOAD_DIR`; do not rely on the default Render upload folder for durable photos.

References: https://render.com/docs/disks and https://supabase.com/docs/guides/storage/security/access-control
