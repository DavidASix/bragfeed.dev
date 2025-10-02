export default function Footer() {
  return (
    <footer className="w-full bg-muted/40 border-t border-border py-3 px-4 md:px-6">
      <p className="text-center text-sm text-muted-foreground">
        &copy; 2025 - {new Date().getFullYear()} Red Oxford Online
      </p>
    </footer>
  );
}
