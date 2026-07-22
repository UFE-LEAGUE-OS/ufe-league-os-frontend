import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorAgreement,
  getSponsorAgreementDocument,
  signSponsorAgreement,
  type SponsorAgreement,
  type SponsorAgreementDocument,
} from '../../services/sponsorshipService';
import './SponsorAgreementSign.css';

function money(value: string, currency: string) {
  const parsed = Number(value);
  const amount = Number.isFinite(parsed) ? parsed : 0;

  try {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-UG')}`;
  }
}

export default function SponsorAgreementSign() {
  const navigate = useNavigate();
  const { agreementId } = useParams();
  const parsedAgreementId = Number(agreementId);

  const [agreement, setAgreement] = useState<SponsorAgreement | null>(null);
  const [document_, setDocument] =
    useState<SponsorAgreementDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [agreed, setAgreed] = useState(false);
  const [signatureError, setSignatureError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const sigPadRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [agreementResponse, documentResponse] = await Promise.all([
          getSponsorAgreement(parsedAgreementId),
          getSponsorAgreementDocument(parsedAgreementId),
        ]);

        if (!active) return;

        setAgreement(agreementResponse.data);
        setDocument(documentResponse.data);
      } catch {
        if (active) {
          setError('We could not load this sponsorship agreement.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (Number.isInteger(parsedAgreementId) && parsedAgreementId > 0) {
      void load();
    } else {
      setLoading(false);
      setError('The agreement number is invalid.');
    }

    return () => {
      active = false;
    };
  }, [parsedAgreementId]);

  const handleClear = () => {
    sigPadRef.current?.clear();
    setSignatureError('');
  };

  const handleConfirm = async () => {
    setSignatureError('');
    setSubmitError('');

    if (!agreed) {
      setSignatureError(
        'Please confirm that you have read and agree to this sponsorship agreement.',
      );
      return;
    }

    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      setSignatureError('Please draw your signature before continuing.');
      return;
    }

    setSubmitting(true);

    try {
      const signatureData = sigPadRef.current
        .getTrimmedCanvas()
        .toDataURL('image/png');

      await signSponsorAgreement(parsedAgreementId, {
        signature_data: signatureData,
        signed_at: new Date().toISOString(),
      });

      navigate(`/sponsor/payments?agreement=${parsedAgreementId}`);
    } catch {
      setSubmitError(
        'We could not save your signature. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sas-page">
      <div className="sas-layout">
        <SponsorSidebar />

        <main className="sas-main">
          <button
            type="button"
            className="sas-back"
            onClick={() => navigate('/sponsor/payments')}
          >
            <FiArrowLeft size={16} />
            Back to Agreements & Payments
          </button>

          {loading && (
            <div className="sas-state">
              <FiRefreshCw className="sas-spin" size={28} />
              <h2>Loading agreement</h2>
            </div>
          )}

          {!loading && error && (
            <div className="sas-state">
              <FiAlertCircle size={28} />
              <h2>Agreement unavailable</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && agreement && (
            <>
              <header className="sas-header">
                <h1>Review & Sign Sponsorship Agreement</h1>
                <p>
                  {agreement.sponsor_package_detail.name} ·{' '}
                  {agreement.reference} ·{' '}
                  {money(agreement.total_value, agreement.currency)}
                </p>
              </header>

              {agreement.signed_at ? (
                <div className="sas-signed-card">
                  <FiCheckCircle size={32} />
                  <h2>This agreement has already been signed</h2>
                  <p>
                    Signed{' '}
                    {new Date(agreement.signed_at).toLocaleString('en-GB')}
                    {agreement.signed_by_email
                      ? ` by ${agreement.signed_by_email}`
                      : ''}
                    .
                  </p>
                  <button
                    type="button"
                    className="sas-primary-btn"
                    onClick={() =>
                      navigate(
                        `/sponsor/payments?agreement=${parsedAgreementId}`,
                      )
                    }
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : (
                <div className="sas-grid">
                  <section className="sas-panel sas-document-panel">
                    <h2>Agreement Terms</h2>
                    <div className="sas-document-body">
                      {document_?.pdf_url ? (
                        <iframe
                          src={document_.pdf_url}
                          title="Sponsorship agreement document"
                          className="sas-document-frame"
                        />
                      ) : document_?.html_content ? (
                        // The backend is the only source for this content (a
                        // League OS-authored legal template) — never wire a
                        // sponsor-editable field into this prop.
                        <div
                          className="sas-document-html"
                          dangerouslySetInnerHTML={{
                            __html: document_.html_content,
                          }}
                        />
                      ) : (
                        <p className="sas-document-fallback">
                          Agreement document text is not available yet.
                          Contact support if this persists.
                        </p>
                      )}
                    </div>
                  </section>

                  <section className="sas-panel sas-signature-panel">
                    <h2>Your Signature</h2>
                    <p className="sas-hint">
                      Draw your signature in the box below using your mouse,
                      trackpad or touchscreen.
                    </p>

                    <div className="sas-canvas-wrap">
                      <SignatureCanvas
                        ref={sigPadRef}
                        penColor="#111827"
                        canvasProps={{
                          className: 'sas-canvas',
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="sas-clear-btn"
                      onClick={handleClear}
                    >
                      Clear
                    </button>

                    <label className="sas-declaration">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(event) => {
                          setAgreed(event.target.checked);
                          setSignatureError('');
                        }}
                      />
                      <span>
                        I have read and agree to the terms of this
                        sponsorship agreement.
                      </span>
                    </label>

                    {(signatureError || submitError) && (
                      <p className="sas-error">
                        <FiAlertCircle size={14} />{' '}
                        {signatureError || submitError}
                      </p>
                    )}

                    <button
                      type="button"
                      className="sas-primary-btn"
                      disabled={submitting}
                      onClick={() => void handleConfirm()}
                    >
                      {submitting
                        ? 'Saving signature…'
                        : 'Confirm & Proceed to Payment'}
                    </button>
                  </section>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
