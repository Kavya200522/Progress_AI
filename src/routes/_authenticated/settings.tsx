import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Moon, Sun, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useProfile } from "@/hooks/useWorkspace";
import { updateProfile } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ProgressAI" },
      { name: "description", content: "Update your display name, switch themes and manage your ProgressAI account." },
      { property: "og:title", content: "Settings — ProgressAI" },
      { property: "og:description", content: "Update your display name, switch themes and manage your account." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
  }, [profile?.display_name]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { display_name: name.trim() });
      await refetch();
      toast.success("Profile updated.");
    } catch {
      toast.error("We couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Your account and preferences.</p>

        <Card className="shadow-card mt-6 gap-4 p-6">
          <h2 className="font-semibold">Profile</h2>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Card>

        <Card className="shadow-card mt-4 flex-row items-center justify-between p-6">
          <div>
            <h2 className="font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Currently using {theme === "dark" ? "dark" : "light"} mode.
            </p>
          </div>
          <Button variant="outline" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Switch theme
          </Button>
        </Card>

        <Card className="shadow-card mt-4 flex-row items-center justify-between p-6">
          <div>
            <h2 className="font-semibold">Session</h2>
            <p className="text-sm text-muted-foreground">Sign out of ProgressAI on this device.</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
