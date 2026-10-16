'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Save, Trash2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/field';
import { PhotoGallery } from '@/components/listings/photo-gallery';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, Notice } from '@/components/ui/empty-state';
import { PageHeading } from '@/components/ui/page-heading';
import { useDemo } from '@/components/demo-provider';
import { catalog, cities } from '@/lib/catalog';
import { editKind } from '@/lib/listing-lifecycle';
import { draftSchema } from '@/lib/validation';
import { formatPrice } from '@/lib/format';
import type { ListingDraft } from '@/lib/types';
const empty: ListingDraft = {
  id: '',
  brand: '',
  model: '',
  storage: '',
  price: '',
  city: 'Karachi',
  area: '',
  color: '',
  condition: '',
  pta: 'Unknown',
  battery: '',
  repairs: '',
  defects: '',
  accessories: '',
  description: '',
  call: true,
  whatsapp: true,
  consent: false,
  status: 'draft',
  updatedAt: '',
};
const steps = ['Phone details', 'Condition & story', 'Photos & contact', 'Review'];
interface Photo {
  id: string;
  url: string;
  name: string;
}
export function ListingForm({ draftId, preview = false }: { draftId?: string; preview?: boolean }) {
  const { ready, drafts } = useDemo();
  if (!ready) return <div className="container page-space">Loading your draft…</div>;
  if (draftId && !drafts.some((draft) => draft.id === draftId))
    return (
      <EmptyState
        title="Draft not found in this browser"
        description="Return to your listings or create a new draft. Opening this URL has not changed saved drafts."
      />
    );
  if (
    !preview &&
    drafts.some(
      (draft) =>
        draft.id === draftId && ['sold', 'withdrawn', 'pending_review'].includes(draft.status),
    )
  )
    return (
      <EmptyState
        title="Editing unavailable in this state"
        description="Sold and withdrawn listings are terminal; pending listings must finish review first."
      />
    );
  return (
    <ListingFormContent
      key={`${draftId || 'new'}-${preview}`}
      draftId={draftId}
      preview={preview}
    />
  );
}
function ListingFormContent({ draftId, preview }: { draftId?: string; preview: boolean }) {
  const { drafts, saveDraft, notify } = useDemo(),
    router = useRouter();
  const [draft, setDraft] = useState<ListingDraft>(
      () =>
        drafts.find((d) => d.id === draftId) || {
          ...empty,
          id: crypto.randomUUID(),
        },
    ),
    [step, setStep] = useState(preview ? 3 : 0),
    [photos, setPhotos] = useState<Photo[]>([]),
    [error, setError] = useState(''),
    [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}),
    [savedValue, setSavedValue] = useState(() => JSON.stringify(draft)),
    [saveMessage, setSaveMessage] = useState(''),
    [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== savedValue;
  useEffect(() => {
    if (preview || (!dirty && !photos.length)) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const onLink = (event: MouseEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const href = target.closest('a[href]')?.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation(href);
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', onLink, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', onLink, true);
    };
  }, [dirty, photos.length, preview]);
  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const save = () => {
    const previous = drafts.find((item) => item.id === draft.id);
    if (previous?.status === 'published' && !draftSchema.safeParse(draft).success) {
      setError('Correct listing validation before editing this published demo.');
      return false;
    }
    const kind = photos.length ? 'material' : previous ? editKind(previous, draft) : 'none';
    if (
      previous?.status === 'published' &&
      kind === 'material' &&
      !window.confirm(
        'This material edit invalidates existing inspection eligibility and returns the local scenario to review. Continue?',
      )
    )
      return false;
    const status =
      previous?.status === 'published' && kind === 'material'
        ? 'pending_review'
        : draft.status === 'rejected'
          ? 'draft'
          : draft.status;
    const updated = { ...draft, status, updatedAt: new Date().toISOString() };
    const persisted = saveDraft(updated);
    setDraft(updated);
    setSavedValue(JSON.stringify(updated));
    const message = persisted
      ? 'Draft saved in this browser. Temporary photos are not saved.'
      : 'Browser storage unavailable or full. Draft kept in this tab only; copy your details before leaving.';
    setSaveMessage(message);
    notify(message);
    return true;
  };
  const next = () => {
    setError('');
    const fields =
      step === 0
        ? ['brand', 'model', 'storage', 'price', 'city', 'color']
        : step === 1
          ? ['condition', 'description', 'battery', 'pta']
          : ['consent'];
    const result = draftSchema.safeParse(draft);
    const issues = result.success
      ? []
      : result.error.issues.filter((issue) => fields.includes(String(issue.path[0])));
    const errors = Object.fromEntries(
      issues.map((issue) => [String(issue.path[0]), issue.message]),
    );
    setFieldErrors(errors);
    if (issues.length) {
      setError('Please correct the marked fields.');
      document.getElementById(`listing-${String(issues[0].path[0])}`)?.focus();
      return;
    }
    if (step === 2 && !draft.call && !draft.whatsapp) {
      setError('Choose at least one contact option.');
      return;
    }
    if (!save()) return;
    setStep((s) => Math.min(s + 1, 3));
  };
  // Preview files stay in memory. The frontend never pretends to process or upload them.
  const previewUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const accepted: Photo[] = [];
    for (const file of Array.from(files)) {
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      ) {
        setError('Use JPEG, PNG or WebP files under 5 MB.');
        continue;
      }
      if (photos.length + accepted.length >= 8) {
        setError('Maximum 8 photos. Additional files were not added.');
        break;
      }
      accepted.push({
        id: crypto.randomUUID(),
        name: file.name,
        url: (() => {
          const url = URL.createObjectURL(file);
          previewUrls.current.add(url);
          return url;
        })(),
      });
    }
    setPhotos((p) => [...p, ...accepted]);
  };
  const removePhoto = (id: string) => {
    setPhotos((p) => {
      const photo = p.find((x) => x.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.url);
        previewUrls.current.delete(photo.url);
      }
      return p.filter((x) => x.id !== id);
    });
  };
  return (
    <div className="container page-space narrow-page">
      <PageHeading
        eyebrow="A NEW CHAPTER STARTS HERE"
        title={
          preview
            ? 'Preview saved listing'
            : draftId
              ? 'Edit your listing'
              : 'Let’s find your phone a new home.'
        }
        description="Honest details make better connections."
        action={
          preview ? undefined : (
            <Button variant="secondary" onClick={save}>
              <Save size={16} />
              Save draft
            </Button>
          )
        }
      />
      <Notice>
        Frontend demo. Drafts are saved only in this browser. Photos are temporary previews.
        Publishing and verification need the backend. Never enter passwords, codes, full device
        identifiers or private evidence in listing fields.
      </Notice>
      <p role="status">
        {preview
          ? 'Read-only saved draft preview. Temporary photos are not persisted.'
          : dirty
            ? 'Unsaved changes'
            : 'No unsaved field changes'}{' '}
        {saveMessage}
      </p>
      <Notice>
        Changing device details, photos, condition or defects is a material edit: existing
        inspection eligibility would be invalidated and a new physical inspection required. A
        price-only edit preserves inspection eligibility, subject to authoritative checks.
      </Notice>
      {preview && (
        <ButtonLink href="/account/listings" variant="secondary">
          Return to my listings
        </ButtonLink>
      )}
      <ol className="form-steps">
        {steps.map((label, i) => (
          <li key={label} className={i === step ? 'active' : i < step ? 'complete' : ''}>
            <span>{i < step ? <Check size={15} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <form
        className="form-card"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) next();
          else {
            if (save()) router.push('/account/listings');
          }
        }}
      >
        {error && (
          <div className="form-error" role="alert">
            {error}
            <ul>
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>
                  <a
                    href={`#listing-${field}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(`listing-${field}`)?.focus();
                    }}
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {step === 0 && (
          <>
            <h2>First, the essentials.</h2>
            <p className="muted">Tell buyers exactly what you’re selling.</p>
            <div className="form-grid">
              <Select
                label="Brand"
                id="listing-brand"
                error={fieldErrors.brand}
                value={draft.brand}
                onChange={(e) => {
                  setDraft((d) => ({
                    ...d,
                    brand: e.target.value,
                    model: '',
                    storage: '',
                  }));
                }}
                required
              >
                <option value="">Select brand</option>
                {Object.keys(catalog).map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </Select>
              <Select
                label="Model"
                id="listing-model"
                error={fieldErrors.model}
                value={draft.model}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    model: e.target.value,
                    storage: '',
                  }))
                }
                required
              >
                <option value="">Select model</option>
                {(catalog[draft.brand] || []).map((m) => (
                  <option key={m.name}>{m.name}</option>
                ))}
              </Select>
              <Select
                label="Storage"
                id="listing-storage"
                error={fieldErrors.storage}
                value={draft.storage}
                onChange={(e) => set('storage', e.target.value)}
                required
              >
                <option value="">Select storage</option>
                {catalog[draft.brand]
                  ?.find((m) => m.name === draft.model)
                  ?.storage.map((s) => (
                    <option key={s} value={s}>
                      {s} GB
                    </option>
                  ))}
              </Select>
              <Input
                label="Asking price (PKR)"
                type="number"
                min={1}
                max={10000000}
                id="listing-price"
                error={fieldErrors.price}
                value={draft.price}
                onChange={(e) => set('price', e.target.value)}
                required
              />
              <Select
                label="City"
                id="listing-city"
                error={fieldErrors.city}
                value={draft.city}
                onChange={(e) => set('city', e.target.value)}
              >
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <Input
                label="Area"
                value={draft.area}
                onChange={(e) => set('area', e.target.value)}
              />
              <Input
                label="Device color"
                id="listing-color"
                error={fieldErrors.color}
                value={draft.color}
                onChange={(e) => set('color', e.target.value)}
                required
              />
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2>A clear picture of its condition.</h2>
            <p className="muted">
              These are your declarations. Shop observations appear separately.
            </p>
            <div className="form-grid">
              <Select
                label="Condition"
                required
                id="listing-condition"
                error={fieldErrors.condition}
                value={draft.condition}
                onChange={(e) => set('condition', e.target.value)}
              >
                <option value="">Select condition</option>
                {['Excellent', 'Good', 'Fair'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <Select
                label="Seller-declared PTA status"
                id="listing-pta"
                error={fieldErrors.pta}
                value={draft.pta}
                onChange={(e) => set('pta', e.target.value)}
              >
                {['Approved', 'Not approved', 'Unknown'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              <Input
                label="Battery health claim (%)"
                type="number"
                min={0}
                max={100}
                id="listing-battery"
                error={fieldErrors.battery}
                value={draft.battery}
                onChange={(e) => set('battery', e.target.value)}
              />
              <Input
                label="Accessories (comma separated)"
                value={draft.accessories}
                onChange={(e) => set('accessories', e.target.value)}
              />
            </div>
            <Textarea
              label="Repair history"
              value={draft.repairs}
              onChange={(e) => set('repairs', e.target.value)}
              placeholder="Disclose repairs, or say if you do not know."
              maxLength={2000}
            />
            <Textarea
              label="Known defects"
              value={draft.defects}
              onChange={(e) => set('defects', e.target.value)}
              placeholder="Mention scratches, faults and anything a buyer should know."
              maxLength={2000}
            />
            <Textarea
              label="Description"
              id="listing-description"
              error={fieldErrors.description}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              minLength={20}
              maxLength={5000}
              required
            />
          </>
        )}
        {step === 2 && (
          <>
            <h2>Show it honestly.</h2>
            <p role="status">
              {photos.length} / 8 temporary photos selected. At least 3 required for future real
              submission.
            </p>
            <p className="muted">
              Add 3–8 photos for a real listing. Avoid personal data or visible device identifiers.
            </p>
            <label className="upload-zone">
              <ImagePlus size={30} />
              <strong>Add phone photos</strong>
              <span>JPEG, PNG or WebP · up to 5 MB each</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => addPhotos(e.target.files)}
                aria-label="Choose phone photos"
              />
            </label>
            <div className="photo-previews">
              {photos.map((photo, i) => (
                <div key={photo.id}>
                  <div
                    className="photo-preview"
                    style={{ backgroundImage: `url("${photo.url}")` }}
                    role="img"
                    aria-label={photo.name}
                  />
                  <span>{i === 0 ? 'Cover photo' : `Photo ${i + 1}`} · Preview only</span>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={i === 0}
                      onClick={() =>
                        setPhotos((p) => {
                          const next = [...p];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          return next;
                        })
                      }
                    >
                      Move earlier
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removePhoto(photo.id)}
                      aria-label={`Remove ${photo.name}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <h3>How can buyers reach you?</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={draft.call}
                onChange={(e) => set('call', e.target.checked)}
              />
              Call
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={draft.whatsapp}
                onChange={(e) => set('whatsapp', e.target.checked)}
              />
              WhatsApp
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="listing-consent"
                aria-invalid={!!fieldErrors.consent}
                checked={draft.consent}
                onChange={(e) => set('consent', e.target.checked)}
              />
              I agree to share my verified number with buyers through my published ad.
            </label>
            <p className="field__hint">
              Email and phone ownership must be verified before a real ad can be submitted.
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Looking good. Take one last look.</h2>
            <PhotoGallery
              photos={photos.map((photo) => ({
                src: photo.url,
                alt: `Temporary seller preview: ${photo.name}`,
              }))}
              label={draft.model || 'Draft'}
            />
            <div className="preview-summary">
              <p className="eyebrow">
                {draft.brand} · {draft.storage} GB
              </p>
              <h2>{draft.model}</h2>
              <p className="detail-price">{formatPrice(Number(draft.price))}</p>
              <p>
                {draft.city} · {draft.area} · {draft.condition}
              </p>
              <p>{draft.description}</p>
              <hr />
              <p>
                <strong>Repair history:</strong> {draft.repairs || 'Not provided'}
              </p>
              <p>
                <strong>Known defects:</strong> {draft.defects || 'Not provided'}
              </p>
              <p>{photos.length} temporary photo previews</p>
            </div>
            <Notice>
              Submission is unavailable in this frontend. Save the draft to keep your details.
              Photos must be added again after a reload.
            </Notice>
          </>
        )}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0 || preview}
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <span>
            {step + 1} of {steps.length}
          </span>
          <Button disabled={preview}>
            {step === 3 ? 'Save & view my listings' : 'Continue'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
      <Dialog
        open={pendingNavigation !== null}
        onClose={() => setPendingNavigation(null)}
        title="Leave unsaved listing?"
      >
        <p>
          Unsaved field changes and temporary photo previews will be lost. Saved fields remain in
          this browser only when storage is available.
        </p>
        <Button type="button" variant="secondary" onClick={() => setPendingNavigation(null)}>
          Keep editing
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (pendingNavigation) {
              const href = pendingNavigation;
              setPendingNavigation(null);
              router.push(href);
            }
          }}
        >
          Leave form
        </Button>
      </Dialog>
    </div>
  );
}
