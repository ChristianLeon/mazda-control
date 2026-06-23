type FloatingActionButtonProps = {
  onClick?: () => void;
};

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-700 text-3xl font-light text-white shadow-lg shadow-red-950/60 active:scale-95"
      aria-label="Agregar registro"
    >
      +
    </button>
  );
}
