import "./globals.css";
import Footer from "../components/Footer";

export const metadata = {
  title: "Stockapi",
  description: "Aplicação para controle de estoque",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
