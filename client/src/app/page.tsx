import { redirect } from "next/navigation";

export default function Home() {
  // In a real application, we would check if the user is authenticated
  // and redirect to the dashboard if they are, or to the login page if they are not.
  // For now, we'll just redirect to the login page.
  redirect("/login");
  
  // This won't be rendered, but is required to satisfy TypeScript
  return null;
}
