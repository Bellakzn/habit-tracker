"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Проверьте email и подтвердите регистрацию, затем войдите",
      )}`,
    );
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteHabit(formData: FormData) {
  const habitId = String(formData.get("habit_id") ?? "");
  if (!habitId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error: completionsError } = await supabase
    .from("completions")
    .delete()
    .eq("habit_id", habitId)
    .eq("user_id", user.id);

  if (completionsError) {
    throw new Error(completionsError.message);
  }

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function addHabit(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim();

  if (!name || !emoji) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("habits")
    .insert({ name, emoji, user_id: user.id });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function toggleCompletion(formData: FormData) {
  const habitId = String(formData.get("habit_id") ?? "");
  if (!habitId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: existing, error: selectError } = await supabase
    .from("completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("user_id", user.id)
    .eq("completed_at", today)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existing) {
    const { error } = await supabase
      .from("completions")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("completions").insert({
      habit_id: habitId,
      user_id: user.id,
      completed_at: today,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
}
