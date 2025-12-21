"use server"

import { signIn, signOut } from "@/modules/auth/core/auth"

export async function handleGithubSignIn() {
  await signIn("github")
}

export async function handleSingout() {
  await signOut()
}
