import "./globals.css";

export const metadata = {
  title: "Flin: AI Stock Advisor",
  description: "Your personal AI-powered stock market advisor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}