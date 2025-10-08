import ViewerFrame from "@/components/ViewerFrame";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Viewer({ params }: { params: { ticket: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const water = user?.email ? `${user.email} • ${new Date().toISOString()}` : new Date().toISOString();
  const src = `/api/pdf/${encodeURIComponent(params.ticket)}`;
  return (
    <main>
      <ViewerFrame src={src} watermarkText={water} />
    </main>
  );
}
