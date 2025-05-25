import { supabase } from './supabaseClient';

// Create a custom channel for cross-tab communication
class CustomChannel {
  private channel: BroadcastChannel | null = null;
  private callbacks: ((msg: any) => void)[] = [];

  constructor(name: string) {
    try {
      // Try to use native BroadcastChannel
      this.channel = new BroadcastChannel(name);
      this.channel.onmessage = (event) => {
        this.callbacks.forEach(cb => cb(event.data));
      };
    } catch (err) {
      console.warn('BroadcastChannel not supported, falling back to localStorage');
      // Fallback to localStorage for older browsers
      window.addEventListener('storage', (event) => {
        if (event.key === name) {
          try {
            const data = JSON.parse(event.newValue || '');
            this.callbacks.forEach(cb => cb(data));
          } catch (err) {
            console.error('Failed to parse message:', err);
          }
        }
      });
    }
  }

  postMessage(message: any) {
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback: use localStorage
      localStorage.setItem('session_channel', JSON.stringify(message));
      // Clean up after a short delay
      setTimeout(() => {
        localStorage.removeItem('session_channel');
      }, 100);
    }
  }

  onmessage(callback: (msg: any) => void) {
    this.callbacks.push(callback);
  }

  close() {
    if (this.channel) {
      this.channel.close();
    }
    this.callbacks = [];
  }
}

// Create session channel
const sessionChannel = new CustomChannel('session_channel');

// Session keepalive interval (5 minutes)
const KEEPALIVE_INTERVAL = 5 * 60 * 1000;

// Session refresh threshold (5 minutes before expiry)
const REFRESH_THRESHOLD = 5 * 60 * 1000;

// Initialize session management
export function initializeSessionManagement() {
  // Handle visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Handle focus/blur
  window.addEventListener('focus', handleTabFocus);
  window.addEventListener('blur', handleTabBlur);

  // Start keepalive for active sessions
  startSessionKeepalive();

  // Listen for session messages from other tabs
  sessionChannel.onmessage(handleSessionMessage);

  // Initial session check
  checkSession();
}

// Handle visibility state changes
async function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    await checkSession();
  }
}

// Handle tab focus
async function handleTabFocus() {
  await checkSession();
}

// Handle tab blur
function handleTabBlur() {
  // Optionally pause certain operations when tab is inactive
}

// Check and refresh session if needed
async function checkSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return;
    }

    // Check if session needs refresh
    const expiresAt = new Date(session.expires_at!).getTime();
    const now = Date.now();

    if (expiresAt - now < REFRESH_THRESHOLD) {
      await refreshSession();
    }
  } catch (err) {
    console.error('Session check failed:', err);
  }
}

// Refresh the session
async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;

    if (session) {
      // Broadcast session refresh to other tabs
      sessionChannel.postMessage({ type: 'SESSION_REFRESHED', session });
    }
  } catch (err) {
    console.error('Session refresh failed:', err);
  }
}

// Start keepalive interval
function startSessionKeepalive() {
  setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await checkSession();
    }
  }, KEEPALIVE_INTERVAL);
}

// Handle session messages from other tabs
function handleSessionMessage(msg: any) {
  if (msg.type === 'SESSION_REFRESHED') {
    // Update local session state if needed
  }
}

// Clean up function
export function cleanupSessionManagement() {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('focus', handleTabFocus);
  window.removeEventListener('blur', handleTabBlur);
  sessionChannel.close();
}