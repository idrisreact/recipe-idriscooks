import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/src/utils/roles';
import { CateringDashboard } from '@/src/components/catering/catering-dashboard';

export const metadata = {
  title: 'Catering inquiries',
  description: 'Manage catering inquiries.',
};

export default async function AdminCateringPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect('/sign-in?redirect_url=/admin/catering');
  }

  if (!(await isAdmin(session.user.id))) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="wrapper page">
      <CateringDashboard />
    </div>
  );
}
