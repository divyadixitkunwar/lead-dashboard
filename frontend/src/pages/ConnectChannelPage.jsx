import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from './Header';
import heroImage from '../assets/hero-himalaya.jpg';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// WhatsApp isn't part of this batch — see the step 3 handoff doc for why
// (it needs either Meta Business Verification or a paid BSP, neither of
// which fits this project right now). Only Messenger + Instagram here,
// both of which work today via the Tester-role trick.

function MessengerLogo({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.64.64 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.64.64 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76m5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z" />
        </svg>
    );
}

function InstagramLogo({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
        </svg>
    );
}

const CHANNEL_META = {
    messenger: {
        label: 'Messenger',
        helper: "Connect your Facebook Page's inbox.",
        Logo: MessengerLogo,
    },
    instagram: {
        label: 'Instagram',
        helper: 'Comes from the same Page — connects automatically if linked.',
        Logo: InstagramLogo,
    },
};
const CHANNEL_ORDER = ['messenger', 'instagram'];

// Loads the Facebook JS SDK exactly once, however many times this
// function gets called (StrictMode double-renders, revisiting the page,
// retrying after an error, etc.). Every caller gets the same promise, and
// that promise doesn't resolve until FB.init() has actually run.
let fbSdkPromise = null;
function loadFacebookSdk(appId) {
    if (fbSdkPromise) return fbSdkPromise;

    fbSdkPromise = new Promise((resolve, reject) => {
        window.fbAsyncInit = function () {
            window.FB.init({ appId, cookie: true, xfbml: false, version: 'v21.0' });
            resolve(window.FB);
        };

        if (document.getElementById('facebook-jssdk')) return; // fbAsyncInit above still fires once it's done loading

        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Could not load the Facebook SDK — check your connection and try again.'));
        document.body.appendChild(script);
    });

    return fbSdkPromise;
}

function ChannelRow({ meta, statusValue, onConnect, onUnavailableAction }) {
    const isConnecting = statusValue === 'connecting';
    const isConnected = statusValue === 'connected';
    const isUnavailable = statusValue === 'unavailable';

    let buttonLabel = 'Connect';
    let buttonHandler = onConnect;
    let buttonDisabled = isConnecting || isConnected;

    if (isConnected) {
        buttonLabel = 'Connected ✓';
    } else if (isConnecting) {
        buttonLabel = 'Connecting…';
    } else if (isUnavailable) {
        if (onUnavailableAction) {
            // Instagram's "not linked yet" state is actionable, not a dead
            // end — this re-checks using the token already saved from
            // Messenger, no full Facebook re-login needed.
            buttonLabel = 'Recheck';
            buttonHandler = onUnavailableAction;
            buttonDisabled = false;
        } else {
            buttonLabel = 'Not linked';
            buttonDisabled = true;
        }
    }

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: '12px',
                border: `1px solid ${isConnected ? 'rgba(37,211,102,0.35)' : 'rgba(27,23,18,0.1)'}`,
                background: isConnected ? 'rgba(37,211,102,0.06)' : 'rgba(255,255,255,0.5)',
            }}
        >
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '11px',
                    background: '#fff',
                    border: '1px solid rgba(27,23,18,0.08)',
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <meta.Logo />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: tokens.ink }}>{meta.label}</div>
                <div style={{ fontSize: '12.5px', color: tokens.inkMuted, marginTop: '2px' }}>
                    {isUnavailable
                        ? 'No Instagram Business account is linked to your connected Page yet — link it in Facebook Page settings, then tap Recheck.'
                        : meta.helper}
                </div>
            </div>

            <button
                type="button"
                onClick={buttonHandler}
                disabled={buttonDisabled}
                style={{
                    flexShrink: 0,
                    fontFamily: tokens.font,
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '999px',
                    padding: '9px 16px',
                    cursor: buttonDisabled ? 'default' : 'pointer',
                    border: isConnected ? 'none' : '1px solid rgba(27,23,18,0.2)',
                    background: isConnected ? '#25D366' : 'transparent',
                    color: isConnected ? '#fff' : tokens.ink,
                    opacity: isConnecting ? 0.6 : 1,
                    transition: 'opacity 0.15s ease',
                }}
            >
                {buttonLabel}
            </button>
        </div>
    );
}

export default function ConnectChannelPage() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    // messenger/instagram: 'idle' | 'connecting' | 'connected' | 'unavailable'
    // (instagram only ever hits 'unavailable' — it means "the Page you
    // connected has no linked Instagram Business account", not an error)
    const [status, setStatus] = useState({ messenger: 'idle', instagram: 'idle' });
    const [pickerPages, setPickerPages] = useState(null); // set when FB returns >1 Page to choose from
    const [error, setError] = useState('');

    // On load (and on every revisit — this page isn't one-time), show
    // whatever's actually connected already instead of always starting
    // from a blank slate.
    useEffect(() => {
        let cancelled = false;
        api.get('/channels')
            .then((res) => {
                if (cancelled) return;
                const next = { messenger: 'idle', instagram: 'idle' };
                for (const ch of res.data) {
                    if (ch.platform === 'messenger') next.messenger = 'connected';
                    if (ch.platform === 'instagram') next.instagram = 'connected';
                }
                setStatus(next);
            })
            .catch(() => { /* fine to just show idle if this one call fails */ });
        return () => { cancelled = true; };
    }, []);

    const finishConnect = useCallback(async (page) => {
        setError('');
        setStatus((s) => ({ ...s, messenger: 'connecting' }));
        try {
            const res = await api.post('/channels/facebook/finish', { page });
            setStatus((s) => ({
                ...s,
                messenger: 'connected',
                instagram: res.data.instagram ? 'connected' : 'unavailable',
            }));
            setPickerPages(null);
            const fresh = await refreshUser(); // flips hasChannel so the dashboard unlocks
            // First successful connect — this is the moment the dashboard
            // becomes reachable at all, so take them straight there instead
            // of leaving them stranded on a page with nothing left to do.
            // Small delay so "Connected ✓" is actually visible before the
            // page changes out from under them. If Instagram wasn't linked,
            // that's fine — this page stays reachable later to pick it up
            // with Recheck, nothing forces them to do it right now.
            if (fresh?.hasChannel) {
                setTimeout(() => navigate('/app'), 700);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Could not finish connecting that Page. Please try again.');
            setStatus((s) => ({ ...s, messenger: 'idle' }));
        }
    }, [refreshUser, navigate]);

    // Re-checks Instagram using the Page token already saved from the
    // Messenger connect above — no need to redo the Facebook popup login
    // just to look again. Most small businesses never linked Instagram to
    // their Page in the first place, so this is the expected path for
    // picking it up once they have, not an error-recovery path.
    const handleRecheckInstagram = useCallback(async () => {
        setError('');
        setStatus((s) => ({ ...s, instagram: 'connecting' }));
        try {
            const res = await api.post('/channels/instagram/recheck');
            if (res.data.linked) {
                setStatus((s) => ({ ...s, instagram: 'connected' }));
                await refreshUser();
            } else {
                setStatus((s) => ({ ...s, instagram: 'unavailable' }));
                setError('Still not linked. Open your Facebook Page settings, link your Instagram account there, then tap Recheck again.');
            }
        } catch (err) {
            setStatus((s) => ({ ...s, instagram: 'unavailable' }));
            setError(err.response?.data?.error || 'Could not check Instagram right now. Please try again.');
        }
    }, [refreshUser]);

    const handleConnect = useCallback(async () => {
        setError('');
        setStatus((s) => ({ ...s, messenger: 'connecting' }));

        const appId = import.meta.env.VITE_META_APP_ID;
        const configId = import.meta.env.VITE_META_FB_LOGIN_CONFIG_ID;

        if (!appId || !configId) {
            setStatus((s) => ({ ...s, messenger: 'idle' }));
            setError('Facebook connect isn\u2019t configured yet (missing VITE_META_APP_ID / VITE_META_FB_LOGIN_CONFIG_ID).');
            return;
        }

        let FB;
        try {
            FB = await loadFacebookSdk(appId);
        } catch (err) {
            setStatus((s) => ({ ...s, messenger: 'idle' }));
            setError(err.message);
            return;
        }

        FB.login(
            (response) => {
                const code = response.authResponse?.code;
                if (!code) {
                    setStatus((s) => ({ ...s, messenger: 'idle' }));
                    setError('Facebook login was cancelled or didn\u2019t complete.');
                    return;
                }

                api.post('/channels/facebook/callback', { code })
                    .then((res) => {
                        const pages = res.data.pages || [];
                        if (pages.length === 0) {
                            setStatus((s) => ({ ...s, messenger: 'idle' }));
                            setError(
                                'No Pages found for that account. Make sure you\u2019re an admin of a Facebook Page, ' +
                                'and that your Facebook account has been added as a Tester on our app.'
                            );
                            return;
                        }
                        if (pages.length === 1) {
                            finishConnect(pages[0]);
                        } else {
                            setStatus((s) => ({ ...s, messenger: 'idle' }));
                            setPickerPages(pages);
                        }
                    })
                    .catch((err) => {
                        setStatus((s) => ({ ...s, messenger: 'idle' }));
                        setError(err.response?.data?.error || 'Could not read your Pages from Facebook.');
                    });
            },
            { config_id: configId, response_type: 'code', override_default_response_type: true }
        );
    }, [finishConnect]);

    const cardStyle = {
        width: 'min(520px, 100%)',
        background: tokens.ivory,
        borderRadius: '16px',
        padding: '40px 44px 32px',
        boxShadow: '0 20px 60px rgba(27,23,18,0.12)',
        border: '1px solid rgba(27,23,18,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '22px',
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: tokens.font }}>
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed', inset: 0, zIndex: 0,
                    backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'blur(40px)', transform: 'scale(1.1)',
                }}
            />
            <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(246,241,231,0.6)' }} />

            <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: tokens.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '7px', height: '7px', background: tokens.ivory, borderRadius: '50%' }} />
                        </div>
                        <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Ekikrit</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ margin: 0, fontFamily: tokens.display, fontSize: '32px', fontWeight: 500, letterSpacing: '-0.03em', color: tokens.ink }}>
                            Connect a channel
                        </h1>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {CHANNEL_ORDER.map((key) => (
                            <ChannelRow
                                key={key}
                                meta={CHANNEL_META[key]}
                                statusValue={status[key]}
                                onConnect={handleConnect}
                                onUnavailableAction={key === 'instagram' ? handleRecheckInstagram : undefined}
                            />
                        ))}
                    </div>

                    <p style={{ margin: 0, fontSize: '12px', color: tokens.inkSoft, textAlign: 'center', lineHeight: 1.5 }}>
                        Instagram doesn't have its own separate login anywhere — it only ever comes through
                        a linked Facebook Page. One Facebook login above covers both; if Instagram shows
                        "Not linked," it's almost always because the Page's Instagram link was never set up
                        on Facebook's side, not because anything here is broken.
                    </p>

                    {pickerPages && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '12px', border: '1px solid rgba(27,23,18,0.1)', background: 'rgba(255,255,255,0.6)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: tokens.ink }}>Which Page would you like to connect?</div>
                            {pickerPages.map((page) => (
                                <button
                                    key={page.id}
                                    type="button"
                                    onClick={() => finishConnect(page)}
                                    style={{
                                        textAlign: 'left',
                                        width: '100%',
                                        fontFamily: tokens.font,
                                        fontSize: '13.5px',
                                        color: tokens.ink,
                                        background: 'rgba(255,255,255,0.8)',
                                        border: '1px solid rgba(27,23,18,0.12)',
                                        borderRadius: '9px',
                                        padding: '9px 12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {page.name}
                                    {page.instagram?.username ? ` — links to @${page.instagram.username}` : ''}
                                </button>
                            ))}
                        </div>
                    )}

                    {error && (
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#b3261e', textAlign: 'center', lineHeight: 1.5 }}>
                            {error}
                        </p>
                    )}

                    {status.messenger === 'connected' && (
                        <button
                            type="button"
                            onClick={() => navigate('/app')}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                color: tokens.ink,
                                border: '1px solid rgba(27,23,18,0.2)',
                                borderRadius: '999px',
                                padding: '13px',
                                fontFamily: tokens.font,
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Back to dashboard
                        </button>
                    )}

                    <p style={{ margin: 0, fontSize: '12px', color: tokens.inkSoft, textAlign: 'center', lineHeight: 1.5 }}>
                        You can come back to this page anytime to connect or check a channel.
                    </p>
                </div>
            </div>
        </div>
    );
}
