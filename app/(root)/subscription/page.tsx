import { permanentRedirect } from 'next/navigation';

// The one-time-purchase model is presented on /pricing; this legacy route
// only duplicated it with stale copy.
export default function SubscriptionPage() {
  permanentRedirect('/pricing');
}
