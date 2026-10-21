'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Save, Trash2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/field';
import { EmptyState, Notice } from '@/components/ui/empty-state';
import { PageHeading } from '@/components/ui/page-heading';
import { useDemo } from '@/components/demo-provider';
import { catalog, cities } from '@/lib/catalog';
import { draftSchema } from '@/lib/validation';
import { formatPrice } from '@/lib/format';
import { isEditable, nextStatus, statusHelp, statusLabels } from '@/lib/listing-lifecycle';
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
export function ListingForm({ draftId }: { draftId?: string }) {
  const { ready } = useDemo();
  if (!ready) return <div className="container page-space">Loading your draft…</div>;
  return <ListingFormContent draftId={draftId} />;
}
function ListingFormContent({ draftId }: { draftId?: string }) {
  const { drafts, saveDraft, notify } = useDemo(),
    router = useRouter();
  const [draft, setDraft] = useState<ListingDraft>(
      () =>
        drafts.find((d) => d.id === draftId) || {
          ...empty,
          id: crypto.randomUUID(),
        },
    ),
    [step, setStep] = useState(0),
    [photos, setPhotos] = useState<Photo[]>([]),
    [error, setError] = useState('');
  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const save = () => {
    saveDraft({ ...draft, updatedAt: new Date().toISOString() });
    notify('Draft saved in this browser.');
  };
  const next = () => {
    setError('');
    if (
      step === 0 &&
      (!draft.brand ||
        !draft.model ||
        !draft.storage ||
        !draft.price ||
        Number(draft.price) <= 0 ||
        !draft.city ||
        !draft.color)
    ) {
      setError('Complete the phone details and enter a valid asking price.');
      return;
    }
    if (step === 1 && (!draft.condition || draft.description.length < 20)) {
      setError('Choose a condition and write a description of at least 20 characters.');
      return;
    }
    if (step === 2) {
      const result = draftSchema.safeParse(draft);
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }
      if (!draft.call && !draft.whatsapp) {
        setError('Choose at least one contact option.');
        return;
      }
    }
    saveDraft({ ...draft, updatedAt: new Date().toISOString() });
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
      if (photos.length + accepted.length >= 8) break;
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
  // Live, sold and pending ads are not edited in place: withdrawing first keeps buyers from
  // seeing half-finished changes and keeps review meaningful.
  if (!isEditable(draft.status))
    return (
      <div className="container page-space narrow-page">
        <EmptyState
          title={`This ad is ${statusLabels[draft.status].toLowerCase()}`}
          description={statusHelp[draft.status]}
          action={<ButtonLink href="/account/listings">Back to my listings</ButtonLink>}
        />
      </div>
    );
  // Validates every step again so a skipped or stale field cannot slip through to review.
  const submitForReview = () => {
    const result = draftSchema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (!draft.call && !draft.whatsapp) {
      setError('Choose at least one contact option.');
      return;
    }
    const status = nextStatus(draft.status, draft.status === 'rejected' ? 'resubmit' : 'submit');
    if (!status) return;
    saveDraft({ ...draft, status, updatedAt: new Date().toISOString() });
    notify('Marked as submitted on this device only. Nothing was sent to the shop yet.');
    router.push('/account/listings');
  };
  return (
    <div className="container page-space narrow-page">
      <PageHeading
        eyebrow="A NEW CHAPTER STARTS HERE"
        title={draftId ? 'Edit your listing' : 'Let’s find your phone a new home.'}
        description="Honest details make better connections."
        action={
          <Button variant="secondary" onClick={save}>
            <Save size={16} />
            Save draft
          </Button>
        }
      />
      <Notice>
        Frontend demo. Drafts are saved only in this browser. Photos are temporary previews.
        Publishing and verification need the backend.
      </Notice>
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
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) next();
          else submitForReview();
        }}
      >
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {step === 0 && (
          <>
            <h2>First, the essentials.</h2>
            <p className="muted">Tell buyers exactly what you’re selling.</p>
            <div className="form-grid">
              <Select
                label="Brand"
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
                value={draft.price}
                onChange={(e) => set('price', e.target.value)}
                required
              />
              <Select label="City" value={draft.city} onChange={(e) => set('city', e.target.value)}>
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
              Submitting marks this ad as waiting for review on this device only; the shop is not
              told yet. Verification is optional and can be added any time. Photos must be added
              again after a reload.
            </Notice>
          </>
        )}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <span>
            {step + 1} of {steps.length}
          </span>
          <Button>
            {step === 3
              ? draft.status === 'rejected'
                ? 'Resubmit for review'
                : 'Submit for review'
              : 'Continue'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}
