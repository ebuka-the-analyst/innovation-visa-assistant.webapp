const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = (relative) => path.join(root, relative);

function update(relative, transform) {
  const target = file(relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[expert-photo-upload] prepared ${relative}`);
  }
}

update('client/src/pages/expert-join.tsx', (source) => {
  let next = source;

  if (!next.includes('ImagePlus,')) {
    next = next.replace(
      '  UserRoundCheck,\n} from "lucide-react";',
      '  UserRoundCheck,\n  ImagePlus,\n  Upload,\n  X,\n} from "lucide-react";',
    );
  }

  if (!next.includes('const [uploadingPhoto, setUploadingPhoto]')) {
    const anchor = '  const [submitted, setSubmitted] = useState(false);';
    if (!next.includes(anchor)) throw new Error('Could not locate ExpertJoin state anchor');
    next = next.replace(anchor, `${anchor}\n  const [uploadingPhoto, setUploadingPhoto] = useState(false);`);
  }

  if (!next.includes('const uploadPhoto = async (file: File)')) {
    const anchor = '  const submitMutation = useMutation({';
    if (!next.includes(anchor)) throw new Error('Could not locate ExpertJoin submit mutation anchor');
    const uploadFn = `  const uploadPhoto = async (file: File) => {\n    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);\n    if (!allowed.has(file.type)) {\n      toast({ title: "Unsupported image", description: "Please choose a JPG, PNG or WebP image." });\n      return;\n    }\n    if (file.size > 5 * 1024 * 1024) {\n      toast({ title: "Image is too large", description: "Please choose an image smaller than 5 MB." });\n      return;\n    }\n\n    setUploadingPhoto(true);\n    try {\n      const body = new FormData();\n      body.append("inviteToken", inviteToken);\n      body.append("photo", file);\n      const response = await fetch("/api/expert-applications/photo", {\n        method: "POST",\n        credentials: "include",\n        body,\n      });\n      const payload = await response.json().catch(() => ({}));\n      if (!response.ok) throw new Error(payload.error || payload.message || "Photo upload failed");\n      set("profileImageUrl", payload.imageUrl);\n      toast({ title: "Photo uploaded", description: "Your profile photo is ready and will be shown after verification." });\n    } catch (error) {\n      toast({ title: "Could not upload photo", description: error instanceof Error ? error.message : "Please try again." });\n    } finally {\n      setUploadingPhoto(false);\n    }\n  };\n\n`;
    next = next.replace(anchor, uploadFn + anchor);
  }

  const oldPhotoField = '<TextField label="Professional photo URL" value={form.profileImageUrl} onChange={(v) => set("profileImageUrl", v)} placeholder="https://... (optional)" />';
  if (next.includes(oldPhotoField)) {
    next = next.replace(
      oldPhotoField,
      '<ProfessionalPhotoField value={form.profileImageUrl} onChange={(v) => set("profileImageUrl", v)} onUpload={uploadPhoto} uploading={uploadingPhoto} />',
    );
  }

  if (!next.includes('function ProfessionalPhotoField(')) {
    const anchor = 'function NarrativeField({';
    if (!next.includes(anchor)) throw new Error('Could not locate ExpertJoin narrative field anchor');
    const component = `function ProfessionalPhotoField({ value, onChange, onUpload, uploading }: { value: string; onChange: (value: string) => void; onUpload: (file: File) => Promise<void>; uploading: boolean }) {\n  const inputRef = useRef<HTMLInputElement>(null);\n  return (\n    <div className="space-y-2 md:col-span-2">\n      <Label>Professional photo</Label>\n      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex sm:items-center sm:gap-5">\n        <div className="mx-auto mb-4 grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white sm:mx-0 sm:mb-0">\n          {value ? (\n            <img src={value} alt="Professional profile preview" className="h-full w-full object-cover" />\n          ) : (\n            <ImagePlus className="h-9 w-9 text-slate-400" />\n          )}\n        </div>\n        <div className="min-w-0 flex-1">\n          <p className="font-medium text-slate-900">Upload a clear professional headshot</p>\n          <p className="mt-1 text-sm leading-6 text-slate-500">JPG, PNG or WebP, up to 5 MB. We automatically resize and optimise it for your public profile.</p>\n          <input\n            ref={inputRef}\n            type="file"\n            accept="image/jpeg,image/png,image/webp"\n            className="hidden"\n            onChange={(event) => {\n              const file = event.target.files?.[0];\n              if (file) void onUpload(file);\n              event.currentTarget.value = "";\n            }}\n          />\n          <div className="mt-3 flex flex-wrap gap-2">\n            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="gap-1.5">\n              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}\n              {uploading ? "Uploading" : value ? "Replace photo" : "Upload photo"}\n            </Button>\n            {value && (\n              <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={() => onChange("")} className="gap-1.5 text-slate-600">\n                <X className="h-3.5 w-3.5" /> Remove\n              </Button>\n            )}\n          </div>\n          <div className="mt-4">\n            <Label className="text-xs text-slate-500">Or paste an existing photo URL</Label>\n            <Input className="mt-1.5" type="url" value={value.startsWith("http") ? value : ""} onChange={(event) => onChange(event.target.value)} placeholder="https://... (optional)" />\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n\n`;
    next = next.replace(anchor, component + anchor);
  }

  return next;
});

update('server/expertApplicationRoutes.ts', (source) => {
  let next = source;

  if (!next.includes('import multer from "multer";')) {
    next = next.replace(
      'import OpenAI from "openai";\nimport { z } from "zod";',
      'import OpenAI from "openai";\nimport multer from "multer";\nimport sharp from "sharp";\nimport { z } from "zod";',
    );
  }

  if (!next.includes('const photoUpload = multer(')) {
    const anchor = 'const pool = dbPool as any;';
    const setup = `const pool = dbPool as any;\nconst photoUpload = multer({\n  storage: multer.memoryStorage(),\n  limits: { fileSize: 5 * 1024 * 1024, files: 1 },\n  fileFilter: (_req, file, callback) => {\n    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);\n    callback(allowed.has(file.mimetype) ? null : new Error("Unsupported profile photo type"), allowed.has(file.mimetype));\n  },\n});\n\nfunction acceptProfilePhoto(req: Request, res: Response, next: NextFunction) {\n  photoUpload.single("photo")(req, res, (error: any) => {\n    if (error) return res.status(400).json({ error: error?.code === "LIMIT_FILE_SIZE" ? "Please choose an image smaller than 5 MB." : "Please upload a JPG, PNG or WebP image." });\n    next();\n  });\n}\n\nfunction internalPhotoId(value: string): string | null {\n  const match = String(value || "").match(/^\\/api\\/expert-profile-images\\/([0-9a-f-]{36})$/i);\n  return match?.[1] || null;\n}`;
    next = next.replace(anchor, setup);
  }

  const oldSchema = '  profileImageUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),';
  if (next.includes(oldSchema)) {
    next = next.replace(
      oldSchema,
      '  profileImageUrl: z.string().trim().max(2000).optional().default("").refine((value) => !value || /^https?:\\/\\//i.test(value) || /^\\/api\\/expert-profile-images\\/[0-9a-f-]{36}$/i.test(value), "Please provide a valid photo URL or uploaded photo."),',
    );
  }

  if (!next.includes('app.get("/api/expert-profile-images/:imageId"')) {
    const anchor = '  app.get("/api/expert-applications/invite/:token", async (req, res) => {';
    if (!next.includes(anchor)) throw new Error('Could not locate expert invite route anchor');
    const routes = `  app.get("/api/expert-profile-images/:imageId", async (req, res) => {\n    try {\n      const image = rows<any>(await pool.query(\`\n        SELECT image_data AS "imageData", content_type AS "contentType"\n        FROM expert_profile_images\n        WHERE id = $1\n        LIMIT 1\n      \`, [req.params.imageId]))[0];\n      if (!image?.imageData) return res.status(404).send("Image not found");\n      res.setHeader("Content-Type", image.contentType || "image/webp");\n      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");\n      res.setHeader("X-Content-Type-Options", "nosniff");\n      return res.send(image.imageData);\n    } catch (error) {\n      console.error("[Expert Application] Profile image load failed", error);\n      return res.status(404).send("Image not found");\n    }\n  });\n\n  app.post("/api/expert-applications/photo", sameOriginMutation, acceptProfilePhoto, async (req, res) => {\n    try {\n      const inviteToken = String(req.body?.inviteToken || "");\n      const invite = await validInvite(inviteToken);\n      if (!invite || invite.status !== "active" || new Date(invite.expiresAt).getTime() <= Date.now()) {\n        return res.status(403).json({ error: "A valid invitation is required to upload a photo." });\n      }\n      if (!req.file?.buffer) return res.status(400).json({ error: "Please choose a photo to upload." });\n\n      const imageData = await sharp(req.file.buffer, { failOn: "error" })\n        .rotate()\n        .resize(640, 640, { fit: "cover", position: "attention", withoutEnlargement: true })\n        .webp({ quality: 82 })\n        .toBuffer();\n      const imageId = crypto.randomUUID();\n\n      await pool.query(\`DELETE FROM expert_profile_images WHERE invite_id = $1 AND expert_id IS NULL\`, [invite.id]);\n      await pool.query(\`\n        INSERT INTO expert_profile_images (id, invite_id, content_type, image_data)\n        VALUES ($1,$2,'image/webp',$3)\n      \`, [imageId, invite.id, imageData]);\n\n      return res.status(201).json({ imageUrl: \`/api/expert-profile-images/\${imageId}\` });\n    } catch (error) {\n      console.error("[Expert Application] Profile photo upload failed", error);\n      return res.status(400).json({ error: "We could not process that image. Please try another JPG, PNG or WebP photo." });\n    }\n  });\n\n`;
    next = next.replace(anchor, routes + anchor);
  }

  if (!next.includes('const uploadedPhotoId = internalPhotoId(input.profileImageUrl);')) {
    const anchor = `      if (invite.recipientEmail && invite.recipientEmail.toLowerCase() !== input.email.toLowerCase()) {\n        await client.query("ROLLBACK");\n        return res.status(403).json({ error: "Please use the email address this invitation was issued to." });\n      }`;
    if (!next.includes(anchor)) throw new Error('Could not locate invite email validation anchor');
    const verification = `${anchor}\n      const uploadedPhotoId = internalPhotoId(input.profileImageUrl);\n      if (uploadedPhotoId) {\n        const photo = rows<any>(await client.query(\`\n          SELECT id FROM expert_profile_images WHERE id = $1 AND invite_id = $2 LIMIT 1\n        \`, [uploadedPhotoId, invite.id]))[0];\n        if (!photo) {\n          await client.query("ROLLBACK");\n          return res.status(403).json({ error: "The uploaded profile photo does not belong to this invitation." });\n        }\n      }`;
    next = next.replace(anchor, verification);
  }

  if (!next.includes('UPDATE expert_profile_images SET expert_id')) {
    const anchor = `      const timezone = validTimeZone(input.timezone);`;
    if (!next.includes(anchor)) throw new Error('Could not locate expert creation follow-up anchor');
    next = next.replace(
      anchor,
      `      if (uploadedPhotoId) {\n        await client.query(\`UPDATE expert_profile_images SET expert_id = $2, updated_at = NOW() WHERE id = $1\`, [uploadedPhotoId, expert.id]);\n      }\n\n${anchor}`,
    );
  }

  return next;
});

console.log('[expert-photo-upload] photo upload preparation complete');
